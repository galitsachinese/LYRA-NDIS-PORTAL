namespace NDISPortal.API.DTOs.SupportWorkers
{
    public class SupportWorkerResponseDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public int AssignedServiceId { get; set; }
        public string? AssignedServiceName { get; set; }
        public string? ServiceCategory { get; set; }
        public string Status { get; set; } = string.Empty;
        public string EmploymentType { get; set; } = string.Empty;
        public DateTime? WwccExpiryDate { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
    }
}
