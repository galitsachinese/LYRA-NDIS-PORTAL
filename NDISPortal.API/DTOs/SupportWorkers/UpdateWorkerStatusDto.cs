using System.ComponentModel.DataAnnotations;

namespace NDISPortal.API.DTOs.SupportWorkers
{
    public class UpdateWorkerStatusDto
    {
        [Required]
        [StringLength(20)]
        public string Status { get; set; } = string.Empty;
    }
}
