using System.ComponentModel.DataAnnotations;

namespace NDISPortal.API.DTOs.Contact
{
    public class ContactEnquiryDto
    {
        [Required(ErrorMessage = "First name is required.")]
        [MaxLength(100, ErrorMessage = "First name must not exceed 100 characters.")]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Last name is required.")]
        [MaxLength(100, ErrorMessage = "Last name must not exceed 100 characters.")]
        public string LastName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Email must be a valid email address.")]
        [MaxLength(150, ErrorMessage = "Email must not exceed 150 characters.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Phone number is required.")]
        [Phone(ErrorMessage = "Phone number must be a valid phone number.")]
        [MaxLength(20, ErrorMessage = "Phone number must not exceed 20 characters.")]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "Message is required.")]
        [MinLength(10, ErrorMessage = "Message must be at least 10 characters.")]
        [MaxLength(500, ErrorMessage = "Message must not exceed 500 characters.")]
        public string Message { get; set; } = string.Empty;
    }
}