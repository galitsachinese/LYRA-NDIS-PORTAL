using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NdisPortal.BookingsApi.Models;
using Register.API.Models;

namespace NDISPortal.API.Models
{
    [Table("worker_bookings")]
    public class WorkerBooking
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("worker_id")]
        public int WorkerId { get; set; }

        [ForeignKey(nameof(WorkerId))]
        public SupportWorkers Worker { get; set; } = null!;

        [Column("booking_id")]
        public int BookingId { get; set; }

        [ForeignKey(nameof(BookingId))]
        public Booking Booking { get; set; } = null!;

        [Column("assigned_date")]
        public DateTime AssignedDate { get; set; }

        [Column("modified_date")]
        public DateTime ModifiedDate { get; set; }

        [Column("assigned_by")]
        public int AssignedBy { get; set; }

        [ForeignKey(nameof(AssignedBy))]
        public User AssignedByUser { get; set; } = null!;
    }
}
