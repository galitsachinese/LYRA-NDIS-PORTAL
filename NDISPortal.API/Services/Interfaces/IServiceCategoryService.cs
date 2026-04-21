using Service.API.DTOs;

namespace NDISPortal.API.Services.Interfaces
{
    public interface IServiceCategoryService
    {
        Task<IEnumerable<ServiceCategoryDTO>> GetAllAsync();
        Task<ServiceCategoryDTO?> GetByIdAsync(int id);
    }
}
