using Register.API.DTO;

namespace Register.API.Services.NDISPortal.API.Services
{
    public interface ichat_service
    {
        Task<string> SendMessage(chat_request_dto dto);
    }
}