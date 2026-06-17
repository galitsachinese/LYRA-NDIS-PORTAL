using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
    }
}