using System.ComponentModel.DataAnnotations;

namespace NdisPortal.BookingsApi.DTOs
{
    public class BookingWorkerAssignmentDto
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "supportWorkerId is required.")]
        public int SupportWorkerId { get; set; }
    }
}
