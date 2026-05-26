using System.ComponentModel.DataAnnotations;

namespace NdisPortal.BookingsApi.DTOs
{
    public class AssignWorkerDto
    {
        [Range(1, int.MaxValue)]
        public int WorkerId { get; set; }
    }
}
