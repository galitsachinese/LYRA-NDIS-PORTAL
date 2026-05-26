using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NDISPortal.API.Data;
using NDISPortal.API.Models;
using NdisPortal.BookingsApi.DTOs;
using NdisPortal.BookingsApi.Services.Interfaces;
using System.Security.Claims;

namespace NdisPortal.BookingsApi.Controllers
{
    [Route("api/bookings")]
    [ApiController]
    [Authorize]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _service;
        private readonly application_db_context _context;

        public BookingsController(IBookingService service, application_db_context context)
        {
            _service = service;
            _context = context;
        }

        // GET /api/bookings
        // Authenticated - any role
        // Participant: own bookings only
        // Coordinator: all bookings with participant name and service name
        // Supports ?status=Pending
        [HttpGet]
        public async Task<IActionResult> GetBookings([FromQuery] string? status)
        {
            var roleClaim = GetCurrentUserRole();
            var userId = GetCurrentUserId();

            if (string.IsNullOrWhiteSpace(roleClaim))
            {
                return Unauthorized(new
                {
                    message = "Role claim is missing."
                });
            }

            if (userId == null)
            {
                return Unauthorized(new
                {
                    message = "User ID claim is missing or invalid."
                });
            }

            try
            {
                var bookings = await _service.GetBookingsAsync(status, roleClaim, userId.Value);
                return Ok(bookings);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new
                {
                    message = ex.Message
                });
            }
        }

        // GET /api/bookings/{id}
        // Authenticated - any role
        // Participant: can view only own booking
        // Coordinator: can view any booking
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetBooking(int id)
        {
            var roleClaim = GetCurrentUserRole();
            var userId = GetCurrentUserId();

            if (string.IsNullOrWhiteSpace(roleClaim))
            {
                return Unauthorized(new
                {
                    message = "Role claim is missing."
                });
            }

            if (userId == null)
            {
                return Unauthorized(new
                {
                    message = "User ID claim is missing or invalid."
                });
            }

            var booking = await _service.GetBookingByIdAsync(id);

            if (booking == null)
            {
                return NotFound(new
                {
                    message = "Booking not found."
                });
            }

            if (roleClaim.Equals("Participant", StringComparison.OrdinalIgnoreCase) && booking.UserId != userId.Value)
            {
                return StatusCode(403, new
                {
                    message = "You are not allowed to view another participant's booking."
                });
            }

            return Ok(booking);
        }

        // GET /api/bookings/{id}/worker
        // Authenticated - any role
        // Participant: can view only their own booking worker
        // Coordinator: can view any booking worker
        [HttpGet("{id:int}/worker")]
        public async Task<IActionResult> GetBookingWorker(int id)
        {
            var access = await CheckBookingAccessAsync(id);
            if (access.Error != null)
            {
                return access.Error;
            }

            var assignment = await _context.WorkerBookings
                .Include(wb => wb.Worker)
                    .ThenInclude(sw => sw.AssignedService)
                .AsNoTracking()
                .FirstOrDefaultAsync(wb => wb.BookingId == id);

            if (assignment == null)
            {
                return NotFound(new
                {
                    message = "No worker assigned yet."
                });
            }

            return Ok(new WorkerSummaryDto
            {
                WorkerId = assignment.WorkerId,
                WorkerName = FormatFullName(assignment.Worker.FirstName, assignment.Worker.LastName),
                WorkerPhone = assignment.Worker.Phone,
                AssignedServiceId = assignment.Worker.ServiceId,
                AssignedServiceName = assignment.Worker.AssignedService?.Name ?? string.Empty,
                AssignedDate = assignment.AssignedDate
            });
        }

        // POST /api/bookings
        // Participant only
        // Status is automatically Pending
        [HttpPost]
        [Authorize(Roles = "Participant")]
        public async Task<IActionResult> PostBooking([FromBody] BookingCreateDto dto)
        {
            var userId = GetCurrentUserId();

            if (userId == null)
            {
                return Unauthorized(new
                {
                    message = "Missing or invalid user claim."
                });
            }

            try
            {
                var created = await _service.CreateBookingAsync(dto, userId.Value);

                return CreatedAtAction(
                    nameof(GetBooking),
                    new { id = created.Id },
                    created
                );
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        // POST /api/bookings/{id}/assign-worker
        // Coordinator only
        [HttpPost("{id:int}/assign-worker")]
        [Authorize(Roles = "Coordinator")]
        public async Task<IActionResult> AssignWorker(int id, [FromBody] AssignWorkerDto dto)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var coordinatorId = GetCurrentUserId();
            if (coordinatorId == null)
            {
                return Unauthorized(new
                {
                    message = "Missing or invalid user claim."
                });
            }

            var coordinator = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == coordinatorId.Value);

            if (coordinator == null)
            {
                return Unauthorized(new
                {
                    message = "Authenticated coordinator was not found."
                });
            }

            var booking = await _context.Bookings
                .Include(b => b.Service)
                .Include(b => b.User)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
            {
                return NotFound(new
                {
                    message = "Booking not found."
                });
            }

            var worker = await _context.SupportWorker
                .Include(sw => sw.AssignedService)
                .FirstOrDefaultAsync(sw => sw.Id == dto.WorkerId);

            if (worker == null)
            {
                return NotFound(new
                {
                    message = "Support worker not found."
                });
            }

            if (booking.Status != 1)
            {
                return BadRequest(new
                {
                    message = "Only Approved bookings can be assigned to a support worker."
                });
            }

            if (!worker.Status.Equals("Active", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    message = "Worker must be Active before they can be assigned to a booking."
                });
            }

            if (worker.ServiceId != booking.ServiceId)
            {
                return BadRequest(new
                {
                    message = "Worker must be assigned to the same service as the booking."
                });
            }

            var hasExistingAssignment = await _context.WorkerBookings
                .AnyAsync(wb => wb.BookingId == id);

            if (hasExistingAssignment)
            {
                return BadRequest(new
                {
                    message = "This booking already has an assigned support worker."
                });
            }

            var now = DateTime.UtcNow;
            var assignment = new WorkerBooking
            {
                BookingId = id,
                WorkerId = worker.Id,
                AssignedBy = coordinator.Id,
                AssignedDate = now,
                ModifiedDate = now
            };

            _context.WorkerBookings.Add(assignment);
            await _context.SaveChangesAsync();

            var workerName = FormatFullName(worker.FirstName, worker.LastName);
            var serviceName = booking.Service?.Name ?? worker.AssignedService?.Name ?? "service";
            var notificationMessage = $"{workerName} has been assigned to your {serviceName} booking on {booking.BookingDate:yyyy-MM-dd}";

            var response = new WorkerAssignmentResponseDto
            {
                BookingId = booking.Id,
                WorkerId = worker.Id,
                WorkerName = workerName,
                WorkerPhone = worker.Phone,
                AssignedServiceId = worker.ServiceId,
                AssignedServiceName = serviceName,
                AssignedDate = assignment.AssignedDate,
                NotificationMessage = notificationMessage
            };

            return CreatedAtAction(
                nameof(GetBookingWorker),
                new { id = booking.Id },
                response
            );
        }

        // PUT /api/bookings/{id}/status
        // Coordinator only
        // Body: { "status": "Approved" } or { "status": "Cancelled" }
        [HttpPut("{id:int}/status")]
        [Authorize(Roles = "Coordinator")]
        public async Task<IActionResult> PutBookingStatus(int id, [FromBody] BookingStatusUpdateDto dto)
        {
            try
            {
                var updated = await _service.UpdateBookingStatusAsync(id, dto);

                if (updated == null)
                {
                    return NotFound(new
                    {
                        message = "Booking not found."
                    });
                }

                return Ok(updated);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        // DELETE /api/bookings/{id}
        // Participant only
        // Participant can only delete their own Pending booking
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Participant")]
        public async Task<IActionResult> DeleteBooking(int id)
        {
            var userId = GetCurrentUserId();

            if (userId == null)
            {
                return Unauthorized(new
                {
                    message = "Missing or invalid user claim."
                });
            }

            try
            {
                var deleted = await _service.DeleteBookingAsync(id, userId.Value);

                if (!deleted)
                {
                    return NotFound(new
                    {
                        message = "Booking not found."
                    });
                }

                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new
                {
                    message = ex.Message
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        // DELETE /api/bookings/{id}/assign-worker
        // Coordinator only
        [HttpDelete("{id:int}/assign-worker")]
        [Authorize(Roles = "Coordinator")]
        public async Task<IActionResult> RemoveWorkerAssignment(int id)
        {
            var assignment = await _context.WorkerBookings
                .FirstOrDefaultAsync(wb => wb.BookingId == id);

            if (assignment == null)
            {
                return NotFound(new
                {
                    message = "No worker assignment exists for this booking."
                });
            }

            _context.WorkerBookings.Remove(assignment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET /api/bookings/stats
        // Coordinator only - returns booking counts by status
        [HttpGet("stats")]
        [Authorize(Roles = "Coordinator")]
        public async Task<IActionResult> GetBookingStats()
        {
            var stats = await _service.GetBookingStatsAsync();
            return Ok(stats);
        }

        private async Task<(IActionResult? Error, NdisPortal.BookingsApi.Models.Booking? Booking)> CheckBookingAccessAsync(int bookingId)
        {
            var roleClaim = GetCurrentUserRole();
            var userId = GetCurrentUserId();

            if (string.IsNullOrWhiteSpace(roleClaim))
            {
                return (Unauthorized(new { message = "Role claim is missing." }), null);
            }

            if (userId == null)
            {
                return (Unauthorized(new { message = "User ID claim is missing or invalid." }), null);
            }

            var booking = await _context.Bookings
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.Id == bookingId);

            if (booking == null)
            {
                return (NotFound(new { message = "Booking not found." }), null);
            }

            if (roleClaim.Equals("Participant", StringComparison.OrdinalIgnoreCase) && booking.UserId != userId.Value)
            {
                return (StatusCode(403, new { message = "You are not allowed to view another participant's booking." }), null);
            }

            if (!roleClaim.Equals("Participant", StringComparison.OrdinalIgnoreCase) &&
                !roleClaim.Equals("Coordinator", StringComparison.OrdinalIgnoreCase))
            {
                return (StatusCode(403, new { message = "You are not authorized to access this booking." }), null);
            }

            return (null, booking);
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim =
                User.FindFirst("userId")?.Value ??
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                User.FindFirst("sub")?.Value;

            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }

            return null;
        }

        private string? GetCurrentUserRole()
        {
            return User.FindFirst(ClaimTypes.Role)?.Value ??
                   User.FindFirst("role")?.Value;
        }

        private static string FormatFullName(string firstName, string lastName)
        {
            return ((firstName ?? string.Empty) + " " + (lastName ?? string.Empty)).Trim();
        }
    }
}
