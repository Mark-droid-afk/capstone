using Applications.Interfaces;
using Domains.Enums;

namespace Applications.Services
{
    public class CookieService : ICookieService
    {
        private static (string Access, string Refresh) GetCookieNames(TokenType tokenType) => tokenType switch
        {
            TokenType.Erp => ("erp_access_token", "erp_refresh_token"),
            TokenType.Customer => ("customer_access_token", "customer_refresh_token"),
            _ => throw new ArgumentOutOfRangeException(nameof(tokenType))
        };

        public void SetTokenCookies(HttpResponse response, string accessToken, string refreshToken, TokenType tokenType)
        {
            var (accessName, refreshName) = GetCookieNames(tokenType);
            var isProduction = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Production";

            var accessOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = isProduction,
                SameSite = isProduction ? SameSiteMode.None : SameSiteMode.Lax,
                Expires = DateTime.UtcNow.AddMinutes(
                    int.Parse(Environment.GetEnvironmentVariable("JWT_EXPIRY_MINUTES") ?? "15"))
            };

            var refreshOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = isProduction,
                SameSite = isProduction ? SameSiteMode.None : SameSiteMode.Lax,
                Expires = DateTime.UtcNow.AddDays(7)
            };

            response.Cookies.Append(accessName, accessToken, accessOptions);
            response.Cookies.Append(refreshName, refreshToken, refreshOptions);
        }

        public void DeleteTokenCookies(HttpResponse response, TokenType tokenType)
        {
            var (accessName, refreshName) = GetCookieNames(tokenType);
            response.Cookies.Delete(accessName);
            response.Cookies.Delete(refreshName);
        }

        public string? GetAccessTokenFromCookies(HttpRequest request, TokenType tokenType)
        {
            var (accessName, _) = GetCookieNames(tokenType);
            return request.Cookies.TryGetValue(accessName, out var token) ? token : null;
        }

        public string? GetRefreshTokenFromCookies(HttpRequest request, TokenType tokenType)
        {
            var (_, refreshName) = GetCookieNames(tokenType);
            return request.Cookies.TryGetValue(refreshName, out var token) ? token : null;
        }
    }
}
