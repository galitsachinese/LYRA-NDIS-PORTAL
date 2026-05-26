namespace NdisPortal.BookingsApi.DTOs
{
    public class WorkerSummaryDto
    {
        public int WorkerId { get; set; }
        public string WorkerName { get; set; } = string.Empty;
        public string WorkerPhone { get; set; } = string.Empty;
        public int AssignedServiceId { get; set; }
        public string AssignedServiceName { get; set; } = string.Empty;
        public DateTime AssignedDate { get; set; }
    }
}
