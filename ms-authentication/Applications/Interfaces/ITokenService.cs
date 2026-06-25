using System.Security.Claims;

namespace Applications.Interfaces
{
    public interface ITokenService
    {
        string GenerateAccessToken(string userId, string email, IList<string> roles);
        string GenerateRefreshToken();
        string HashToken(string token);
        ClaimsPrincipal? ValidateAccessToken(string token);
    }
}