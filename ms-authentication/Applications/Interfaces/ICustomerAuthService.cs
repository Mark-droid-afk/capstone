using Api.Contracts.Requests;
using Api.Contracts.Responses;

namespace Applications.Interfaces
{
    public interface ICustomerAuthService
    {
        Task<(bool Success, string? Error)> RegisterAsync(CustomerRegisterRequest request);
        Task<(bool Success, string? Error)> ConfirmEmailAsync(string email, string token);
        Task<CustomerDto?> LoginAsync(CustomerLoginRequest request, HttpResponse response);
        Task<CustomerDto?> ValidateAsync(HttpRequest request);
        Task<bool> RefreshAsync(HttpRequest request, HttpResponse response);
        Task LogoutAsync(HttpRequest request, HttpResponse response);
        Task<(bool Success, string? Error)> ForgotPasswordAsync(ForgotPasswordRequest request);
        Task<(bool Success, string? Error)> ResetPasswordAsync(ResetPasswordRequest request);
        Task<CustomerDto?> GoogleLoginAsync(string email, string? firstName, string? lastName, HttpResponse response);
        Task<(bool Success, string? Error)> UpdateAsync(Guid customerId, UpdateCustomerRequest request);
        Task<(bool Success, string? Error)> DeleteAsync(Guid customerId);
        Task<CustomerDto?> GetByIdAsync(Guid customerId);
        Task<List<CustomerDto>> GetAllAsync();
    }
}