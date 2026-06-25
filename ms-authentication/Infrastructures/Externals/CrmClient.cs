using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Infrastructures.Externals;

public class CrmClient(IHttpClientFactory httpClientFactory)
{
    private readonly string _jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET")!;
    private readonly string _jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER")!;
    private readonly string _jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE")!;

    public async Task SyncCustomerAsync(CustomerSyncMessage message)
    {
        var client = httpClientFactory.CreateClient("CrmApi");
        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", GenerateServiceToken());

        var payload = new
        {
            firstName = message.FirstName,
            lastName = message.LastName,
            email = message.Email,
            phoneNumber = message.PhoneNumber,
            authId = message.AuthId,
            customerType = 2, // Regular
            status = 0        // Active
        };

        var response = await client.PostAsJsonAsync("/api/crms/contacts", payload);
        response.EnsureSuccessStatusCode();
    }

    private string GenerateServiceToken()
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtIssuer,
            audience: _jwtAudience,
            claims: [new Claim("scope", "service"), new Claim("sub", "api-auth")],
            expires: DateTime.UtcNow.AddMinutes(5),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}