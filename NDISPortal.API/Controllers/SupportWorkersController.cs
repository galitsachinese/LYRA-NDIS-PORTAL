using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NDISPortal.API.Data;
using NDISPortal.API.DTOs.SupportWorkers;
using NDISPortal.API.Models;

namespace NDISPortal.API.Controllers
{
    [Route("api/support-workers")]
    [ApiController]
    [Authorize(Roles = "Coordinator")]
    public class SupportWorkersController : ControllerBase
    {
        private static readonly Dictionary<string, string> ValidStatuses = new(StringComparer.OrdinalIgnoreCase)
        {
            ["Active"] = "Active",
            ["Inactive"] = "Inactive",
            ["On Leave"] = "On Leave"
        };

        private static readonly Dictionary<string, string> ValidEmploymentTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            ["Full Time"] = "Full Time",
            ["Full-Time"] = "Full Time",
            ["Part Time"] = "Part Time",
            ["Part-Time"] = "Part Time",
            ["Casual"] = "Casual",
            ["Contractor"] = "Contractor",
            ["Permanent"] = "Permanent"
        };

        private readonly application_db_context _context;

        public SupportWorkersController(application_db_context context)
        {
            _context = context;
        }

        // GET /api/support-workers
        // Coordinator only
        // Supports ?status=Active, ?serviceId=3, ?expiringSoon=true
        [HttpGet]
        public async Task<IActionResult> GetSupportWorkers(
            [FromQuery] string? status,
            [FromQuery] int? serviceId,
            [FromQuery] bool expiringSoon = false)
        {
            var query = _context.SupportWorker
                .Include(sw => sw.AssignedService)
                    .ThenInclude(s => s!.ServiceCategory)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
            {
                var normalizedStatus = NormalizeStatus(status);
                if (normalizedStatus == null)
                {
                    return BadRequest(new
                    {
                        message = "Invalid status value. Allowed values are: Active, Inactive, On Leave."
                    });
                }

                query = query.Where(sw => sw.Status == normalizedStatus);
            }

            if (serviceId.HasValue)
            {
                if (serviceId.Value <= 0)
                {
                    return BadRequest(new
                    {
                        message = "serviceId must be greater than 0."
                    });
                }

                query = query.Where(sw => sw.ServiceId == serviceId.Value);
            }

            if (expiringSoon)
            {
                var today = DateTime.UtcNow.Date;
                var cutoff = today.AddDays(90);

                query = query.Where(sw =>
                    sw.WwccExpiryDate.HasValue &&
                    sw.WwccExpiryDate.Value >= today &&
                    sw.WwccExpiryDate.Value <= cutoff);
            }

            var workers = await query
                .OrderBy(sw => sw.FirstName)
                .ThenBy(sw => sw.LastName)
                .ToListAsync();

            return Ok(workers.Select(MapToResponseDto).ToList());
        }

        // GET /api/support-workers/{id}
        // Coordinator only
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetSupportWorker(int id)
        {
            var worker = await _context.SupportWorker
                .Include(sw => sw.AssignedService)
                    .ThenInclude(s => s!.ServiceCategory)
                .FirstOrDefaultAsync(sw => sw.Id == id);

            if (worker == null)
            {
                return NotFound(new
                {
                    message = $"Support worker with ID {id} was not found."
                });
            }

            return Ok(MapToResponseDto(worker));
        }

        // GET /api/support-workers/{id}/upcoming-bookings/count
        // Coordinator only
        [HttpGet("{id:int}/upcoming-bookings/count")]
        public async Task<IActionResult> GetUpcomingBookingCount(int id)
        {
            var workerExists = await _context.SupportWorker.AnyAsync(sw => sw.Id == id);
            if (!workerExists)
            {
                return NotFound(new
                {
                    message = $"Support worker with ID {id} was not found."
                });
            }

            var today = DateTime.UtcNow.Date;
            var count = await _context.WorkerBookings
                .Where(wb =>
                    wb.WorkerId == id &&
                    wb.Booking.BookingDate >= today &&
                    wb.Booking.Status != 2)
                .CountAsync();

            return Ok(new { count });
        }

        // POST /api/support-workers
        // Coordinator only
        [HttpPost]
        public async Task<IActionResult> CreateSupportWorker([FromBody] CreateSupportWorkerDto request)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var input = await ValidateWorkerInputAsync(request);
            if (input.Error != null)
            {
                return input.Error;
            }

            var worker = new SupportWorkers
            {
                ServiceId = request.AssignedServiceId,
                FirstName = input.FirstName,
                LastName = input.LastName,
                Email = input.Email,
                Phone = input.Phone,
                Status = "Active",
                CreatedDate = DateTime.UtcNow,
                ModifiedDate = DateTime.UtcNow
            };

            _context.SupportWorker.Add(worker);
            await _context.SaveChangesAsync();

            var createdWorker = await FindWorkerWithDetailsAsync(worker.Id);

            return CreatedAtAction(
                nameof(GetSupportWorker),
                new { id = worker.Id },
                MapToResponseDto(createdWorker!)
            );
        }

        // PUT /api/support-workers/{id}
        // Coordinator only
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateSupportWorker(int id, [FromBody] CreateSupportWorkerDto request)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var worker = await _context.SupportWorker.FindAsync(id);
            if (worker == null)
            {
                return NotFound(new
                {
                    message = $"Support worker with ID {id} was not found."
                });
            }

            var input = await ValidateWorkerInputAsync(request, id);
            if (input.Error != null)
            {
                return input.Error;
            }

            worker.ServiceId = request.AssignedServiceId;
            worker.FirstName = input.FirstName;
            worker.LastName = input.LastName;
            worker.Email = input.Email;
            worker.Phone = input.Phone;
            worker.ModifiedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var updatedWorker = await FindWorkerWithDetailsAsync(worker.Id);

            return Ok(MapToResponseDto(updatedWorker!));
        }

        // PATCH or PUT /api/support-workers/{id}/status
        // Coordinator only
        [HttpPatch("{id:int}/status")]
        [HttpPut("{id:int}/status")]
        public async Task<IActionResult> UpdateSupportWorkerStatus(int id, [FromBody] UpdateWorkerStatusDto request)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var normalizedStatus = NormalizeStatus(request.Status);
            if (normalizedStatus == null)
            {
                return BadRequest(new
                {
                    message = "Invalid status value. Allowed values are: Active, Inactive, On Leave."
                });
            }

            var worker = await _context.SupportWorker.FindAsync(id);
            if (worker == null)
            {
                return NotFound(new
                {
                    message = $"Support worker with ID {id} was not found."
                });
            }

            worker.Status = normalizedStatus;
            worker.ModifiedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var updatedWorker = await FindWorkerWithDetailsAsync(worker.Id);

            return Ok(MapToResponseDto(updatedWorker!));
        }

        // DELETE /api/support-workers/{id}
        // Coordinator only - soft delete
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteSupportWorker(int id)
        {
            var worker = await _context.SupportWorker.FindAsync(id);
            if (worker == null)
            {
                return NotFound(new
                {
                    message = $"Support worker with ID {id} was not found."
                });
            }

            worker.Status = "Inactive";
            worker.ModifiedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST /api/support-workers/{id}/upload-picture
        // Coordinator only - uploads a profile picture
        [HttpPost("{id:int}/upload-picture")]
        [RequestSizeLimit(5 * 1024 * 1024)] // 5MB
        public async Task<IActionResult> UploadPicture(int id, IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file provided." });
            }

            // Validate file type
            var allowedTypes = new[] { "image/jpeg", "image/png", "image/jpg" };
            if (!allowedTypes.Contains(file.ContentType.ToLower()))
            {
                return BadRequest(new { message = "Invalid file type. Only JPG and PNG files are allowed." });
            }

            // Validate file size (max 5MB)
            if (file.Length > 5 * 1024 * 1024)
            {
                return BadRequest(new { message = "File size must not exceed 5MB." });
            }

            var worker = await _context.SupportWorker.FindAsync(id);
            if (worker == null)
            {
                return NotFound(new { message = $"Support worker with ID {id} was not found." });
            }

            try
            {
                // Create uploads directory if it doesn't exist
                var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "profile-pictures");
                Directory.CreateDirectory(uploadsDir);

                // Generate unique filename
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                var fileName = $"worker_{id}_{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsDir, fileName);

                // Save the file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Update worker's profile_picture field
                var imagePath = $"/uploads/profile-pictures/{fileName}";
                worker.ProfilePicture = imagePath;
                worker.ModifiedDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    status = 200,
                    profilePicture = BuildProfilePictureUrl(imagePath),
                    message = "Profile picture uploaded successfully."
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SupportWorkersController] Upload error: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while uploading the file." });
            }
        }

        private async Task<(IActionResult? Error, string FirstName, string LastName, string Email, string Phone)> ValidateWorkerInputAsync(
            CreateSupportWorkerDto request,
            int? existingWorkerId = null)
        {
            var cleanedFullName = (request.FullName ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(cleanedFullName))
            {
                return (BadRequest(new { message = "Full name is required." }), string.Empty, string.Empty, string.Empty, string.Empty);
            }

            var (firstName, lastName) = SplitFullName(cleanedFullName);
            if (string.IsNullOrWhiteSpace(firstName) || string.IsNullOrWhiteSpace(lastName))
            {
                return (BadRequest(new { message = "Full name must include first name and last name." }), string.Empty, string.Empty, string.Empty, string.Empty);
            }

            var normalizedEmail = (request.Email ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(normalizedEmail))
            {
                return (BadRequest(new { message = "Email is required." }), string.Empty, string.Empty, string.Empty, string.Empty);
            }

            var phone = (request.Phone ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(phone))
            {
                return (BadRequest(new { message = "Phone is required." }), string.Empty, string.Empty, string.Empty, string.Empty);
            }

            var serviceExists = await _context.Services.AnyAsync(s => s.Id == request.AssignedServiceId);
            if (!serviceExists)
            {
                return (BadRequest(new { message = $"Service with ID {request.AssignedServiceId} does not exist." }), string.Empty, string.Empty, string.Empty, string.Empty);
            }

            var emailExists = await _context.SupportWorker
                .AnyAsync(sw => sw.Email == normalizedEmail && (!existingWorkerId.HasValue || sw.Id != existingWorkerId.Value));

            if (emailExists)
            {
                return (BadRequest(new { message = "A support worker with this email already exists." }), string.Empty, string.Empty, string.Empty, string.Empty);
            }

            return (null, firstName, lastName, normalizedEmail, phone);
        }

        private async Task<SupportWorkers?> FindWorkerWithDetailsAsync(int id)
        {
            return await _context.SupportWorker
                .Include(sw => sw.AssignedService)
                    .ThenInclude(s => s!.ServiceCategory)
                .FirstOrDefaultAsync(sw => sw.Id == id);
        }

        private SupportWorkerResponseDto MapToResponseDto(SupportWorkers worker)
        {
            return new SupportWorkerResponseDto
            {
                Id = worker.Id,
                FullName = FormatFullName(worker.FirstName, worker.LastName),
                Email = worker.Email,
                Phone = worker.Phone,
                AssignedServiceId = worker.ServiceId,
                AssignedServiceName = worker.AssignedService?.Name,
                ServiceCategory = worker.AssignedService?.ServiceCategory?.Name,
                Status = worker.Status,
                EmploymentType = worker.EmploymentType,
                WwccExpiryDate = worker.WwccExpiryDate,
                CreatedDate = worker.CreatedDate,
                ModifiedDate = worker.ModifiedDate,
                ProfilePicture = BuildProfilePictureUrl(worker.ProfilePicture)
            };
        }

        private string? BuildProfilePictureUrl(string? profilePicture)
        {
            if (string.IsNullOrWhiteSpace(profilePicture))
            {
                return null;
            }

            if (Uri.IsWellFormedUriString(profilePicture, UriKind.Absolute))
            {
                return profilePicture;
            }

            return $"{Request.Scheme}://{Request.Host}{profilePicture}";
        }

        private static string? NormalizeStatus(string? status)
        {
            var cleaned = (status ?? string.Empty).Trim();
            return ValidStatuses.TryGetValue(cleaned, out var normalized) ? normalized : null;
        }

        private static string? NormalizeEmploymentType(string? employmentType)
        {
            var cleaned = (employmentType ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(cleaned))
            {
                return null;
            }

            return ValidEmploymentTypes.TryGetValue(cleaned, out var normalized) ? normalized : null;
        }

        private static (string FirstName, string LastName) SplitFullName(string fullName)
        {
            var parts = fullName.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);

            if (parts.Length < 2)
            {
                return (string.Empty, string.Empty);
            }

            return (parts[0].Trim(), parts[1].Trim());
        }

        private static string FormatFullName(string firstName, string lastName)
        {
            return ((firstName ?? string.Empty) + " " + (lastName ?? string.Empty)).Trim();
        }
    }
}
