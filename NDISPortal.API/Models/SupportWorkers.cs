using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Service.API.Model;

namespace NDISPortal.API.Models
{
    [Table("support_workers")]
    public class SupportWorkers
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("first_name")]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [Column("last_name")]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Column("phone")]
        public string Phone { get; set; } = string.Empty;

        [Required]
        [Column("status")]
        public string Status { get; set; } = "Active";

        [Required]
        [Column("employment_type")]
        public string EmploymentType { get; set; } = "Casual";

        [Column("wwcc_expiry_date")]
        public DateTime? WwccExpiryDate { get; set; }

        [Column("service_id")]
        public int ServiceId { get; set; }

        [ForeignKey("ServiceId")]
        public ServiceItem? AssignedService { get; set; }

        [Column("created_date")]
        public DateTime CreatedDate { get; set; }

        [Column("modified_date")]
        public DateTime ModifiedDate { get; set; }

        [Column("profile_picture")]
        [MaxLength(500)]
        public string? ProfilePicture { get; set; }
    }
}
