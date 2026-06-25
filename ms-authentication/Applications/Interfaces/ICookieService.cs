using Domains.Enums;

namespace Applications.Interfaces
{
    public interface ICookieService
    {
        void SetTokenCookies(HttpResponse response, string accessToken, string refreshToken, TokenType tokenType);
        void DeleteTokenCookies(HttpResponse response, TokenType tokenType);
        string? GetAccessTokenFromCookies(HttpRequest request, TokenType tokenType);
        string? GetRefreshTokenFromCookies(HttpRequest request, TokenType tokenType);
    }
}