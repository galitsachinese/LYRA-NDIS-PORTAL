using System.ComponentModel.DataAnnotations;

namespace NDISPortal.API.DTOs.SupportWorkers
{
    public class CreateSupportWorkerDto
    {
        [Required]
        [StringLength(150)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Phone { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int AssignedServiceId { get; set; }
    }
}
