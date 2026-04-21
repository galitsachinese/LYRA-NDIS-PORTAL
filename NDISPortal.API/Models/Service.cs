using System.ComponentModel.DataAnnotations.Schema;

namespace Service.API.Model
{
    // Fix: Rename to ServiceItem (Uppercase I) to match the rest of the app
    public class ServiceItem
    {
        public int Id { get; set; }

        [Column("category_id")] // Keeps DB as snake_case
        public int CategoryId { get; set; } // Variable naming is now PascalCase

        [Column("name")]
        public string Name { get; set; }

        [Column("description")]
        public string Description { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; }

        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }

        // NAVIGATION PROPERTY
        [ForeignKey("CategoryId")]
        public ServiceCategory ServiceCategory { get; set; }
    }
}