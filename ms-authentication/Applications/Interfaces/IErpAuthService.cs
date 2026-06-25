using Api.Contracts.Requests;
using Api.Contracts.Responses;

namespace Applications.Interfaces
{
    public interface IErpAuthService
    {
        Task<(bool Success, string? Error)> RegisterAsync(ErpRegisterRequest request);
        Task<(ErpUserDto? User, bool MustChangePassword)> LoginAsync(ErpLoginRequest request, HttpResponse response);
        Task<ErpUserDto?> ValidateAsync(HttpRequest request);
        Task<bool> RefreshAsync(HttpRequest request, HttpResponse response);
        Task LogoutAsync(HttpRequest request, HttpResponse response);
        Task<(bool Success, string? Error)> ChangePasswordAsync(Guid userId, ChangePasswordRequest request);
        Task<(bool Success, string? Error)> ForgotPasswordAsync(ForgotPasswordRequest request);
        Task<(bool Success, string? Error)> ResetPasswordAsync(ResetPasswordRequest request);
        Task<(bool Success, string? Error)> UpdateAsync(Guid userId, UpdateErpUserRequest request);
        Task<(bool Success, string? Error)> DeleteAsync(Guid userId);
        Task<ErpUserDto?> GetByIdAsync(Guid userId);
        Task<List<ErpUserDto>> GetAllAsync();
    }
}