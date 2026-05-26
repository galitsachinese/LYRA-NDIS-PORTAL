namespace NdisPortal.BookingsApi.DTOs
{
    public class WorkerAssignmentResponseDto
    {
        public int BookingId { get; set; }
        public int WorkerId { get; set; }
        public string WorkerName { get; set; } = string.Empty;
        public string WorkerPhone { get; set; } = string.Empty;
        public int AssignedServiceId { get; set; }
        public string AssignedServiceName { get; set; } = string.Empty;
        public DateTime AssignedDate { get; set; }
        public string NotificationMessage { get; set; } = string.Empty;
    }
}
