using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NDISPortal.API.Data;
using NDISPortal.API.DTOs.Contact;
using NDISPortal.API.Models;

namespace NDISPortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactController : ControllerBase
    {
        private readonly application_db_context _context;

        public ContactController(application_db_context context)
        {
            _context = context;
        }

        /// <summary>
        /// POST /api/contact
        /// Public endpoint — no token required.
        /// Accepts a contact form submission and saves it to the database.
        /// </summary>
        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> SubmitContactForm([FromBody] ContactEnquiryDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    status = 400,
                    message = "Validation failed.",
                    errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                });
            }

            try
            {
                var enquiry = new ContactEnquiry
                {
                    FirstName = dto.FirstName.Trim(),
                    LastName = dto.LastName.Trim(),
                    Email = dto.Email.Trim(),
                    PhoneNumber = dto.PhoneNumber?.Trim(),
                    Message = dto.Message.Trim(),
                    IsRead = false,
                    SubmittedAt = DateTime.UtcNow
                };

                _context.ContactInquiries.Add(enquiry);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    status = 200,
                    message = "Your enquiry has been submitted successfully. We will get back to you soon."
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ContactController] Exception: {ex.Message}");
                Console.WriteLine($"[ContactController] Stack trace: {ex.StackTrace}");
                return StatusCode(500, new
                {
                    status = 500,
                    message = "An error occurred while processing your request. Please try again later."
                });
            }
        }

        /// <summary>
        /// GET /api/contact
        /// Coordinator only — returns all contact enquiries, newest first.
        /// Supports optional query params: ?status=Unread&search=name or email
        /// </summary>
        [Authorize(Roles = "Coordinator")]
        [HttpGet]
        public async Task<IActionResult> GetEnquiries([FromQuery] string? status, [FromQuery] string? search)
        {
            var query = _context.ContactInquiries.AsQueryable();

            // Filter by read/unread status
            if (!string.IsNullOrWhiteSpace(status))
            {
                if (status.Equals("Unread", StringComparison.OrdinalIgnoreCase))
                    query = query.Where(e => !e.IsRead);
                else if (status.Equals("Read", StringComparison.OrdinalIgnoreCase))
                    query = query.Where(e => e.IsRead);
            }

            // Search by name or email
            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(e =>
                    e.FirstName.ToLower().Contains(term) ||
                    e.LastName.ToLower().Contains(term) ||
                    e.Email.ToLower().Contains(term));
            }

            // Newest first
            query = query.OrderByDescending(e => e.SubmittedAt);

            var enquiries = await query
                .Select(e => new ContactEnquiryResponseDto
                {
                    Id = e.Id,
                    FirstName = e.FirstName,
                    LastName = e.LastName,
                    Email = e.Email,
                    PhoneNumber = e.PhoneNumber,
                    Message = e.Message,
                    IsRead = e.IsRead,
                    SubmittedAt = e.SubmittedAt
                })
                .ToListAsync();

            return Ok(new
            {
                status = 200,
                data = enquiries
            });
        }

        /// <summary>
        /// GET /api/contact/{id}
        /// Coordinator only — returns full enquiry detail.
        /// Automatically marks the enquiry as Read.
        /// </summary>
        [Authorize(Roles = "Coordinator")]
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetEnquiryById(int id)
        {
            var enquiry = await _context.ContactInquiries.FindAsync(id);

            if (enquiry == null)
            {
                return NotFound(new
                {
                    status = 404,
                    message = "Enquiry not found."
                });
            }

            // Automatically mark as read
            if (!enquiry.IsRead)
            {
                enquiry.IsRead = true;
                await _context.SaveChangesAsync();
            }

            var dto = new ContactEnquiryResponseDto
            {
                Id = enquiry.Id,
                FirstName = enquiry.FirstName,
                LastName = enquiry.LastName,
                Email = enquiry.Email,
                PhoneNumber = enquiry.PhoneNumber,
                Message = enquiry.Message,
                IsRead = enquiry.IsRead,
                SubmittedAt = enquiry.SubmittedAt
            };

            return Ok(new
            {
                status = 200,
                data = dto
            });
        }
    }
}
