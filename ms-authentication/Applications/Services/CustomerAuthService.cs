using Api.Contracts.Requests;
using Api.Contracts.Responses;
using Applications.Interfaces;
using Infrastructures.Externals;
using Domains.Entities;
using Domains.Enums;
using Infrastructures.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;

namespace Applications.Services
{
    public class CustomerAuthService : ICustomerAuthService
    {
        private readonly UserManager<Customer> _userManager;
        private readonly AuthDbContext _dbContext;
        private readonly ITokenService _tokenService;
        private readonly ICookieService _cookieService;
        private readonly IEmailService _emailService;
        private readonly CustomerSyncChannel _syncChannel;

        public CustomerAuthService(
            UserManager<Customer> userManager,
            AuthDbContext dbContext,
            ITokenService tokenService,
            ICookieService cookieService,
            IEmailService emailService,
            CustomerSyncChannel syncChannel
        )
        {
            _userManager = userManager;
            _dbContext = dbContext;
            _tokenService = tokenService;
            _cookieService = cookieService;
            _emailService = emailService;
            _syncChannel = syncChannel;
        }

        public async Task<(bool Success, string? Error)> RegisterAsync(CustomerRegisterRequest request)
        {
            var existing = await _userManager.FindByEmailAsync(request.Email);
            if (existing is not null)
                return (false, "Email is already in use.");

            var customer = new Customer
            {
                Id = Guid.NewGuid(),
                UserName = request.Email,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                EmailConfirmed = false
            };

            var result = await _userManager.CreateAsync(customer, request.Password);
            if (!result.Succeeded)
                return (false, string.Join(", ", result.Errors.Select(e => e.Description)));

            await _userManager.AddToRoleAsync(customer, "Customer");

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(customer);
            var encodedToken = Uri.EscapeDataString(token);
            var frontendUrl = Environment.GetEnvironmentVariable("CUSTOMER_FRONTEND_URL");
            var confirmLink = $"{frontendUrl}/confirm-email?email={request.Email}&token={encodedToken}";

            await _emailService.SendEmailConfirmationAsync(request.Email, confirmLink);

            return (true, null);
        }

        public async Task<(bool Success, string? Error)> ConfirmEmailAsync(string email, string token)
        {

            var customer = await _userManager.FindByEmailAsync(email);
            if (customer is null) return (false, "Invalid request.");

            var decoded = Uri.UnescapeDataString(token);

            var result = await _userManager.ConfirmEmailAsync(customer, decoded);
            if (!result.Succeeded)
                Console.WriteLine($"ERRORS: {string.Join(", ", result.Errors.Select(e => e.Description))}");

            if (!result.Succeeded)
                return (false, string.Join(", ", result.Errors.Select(e => e.Description)));

            await _syncChannel.Writer.WriteAsync(new CustomerSyncMessage(
                Email: customer.Email!,
                FirstName: customer.FirstName,
                LastName: customer.LastName,
                PhoneNumber: customer.PhoneNumber,
                AuthId: customer.Id.ToString()
            ));
            return (true, null);
        }

        public async Task<CustomerDto?> LoginAsync(CustomerLoginRequest request, HttpResponse response)
        {
            var customer = await _userManager.FindByEmailAsync(request.Email);

            if (customer is null || !await _userManager.CheckPasswordAsync(customer, request.Password))
                return null;

            if (!customer.EmailConfirmed) return null;

            var roles = await _userManager.GetRolesAsync(customer);
            var accessToken = _tokenService.GenerateAccessToken(customer.Id.ToString(), customer.Email!, roles);
            var rawRefreshToken = _tokenService.GenerateRefreshToken();
            var hashedRefreshToken = _tokenService.HashToken(rawRefreshToken);

            _dbContext.RefreshTokens.Add(new Domains.Entities.RefreshToken
            {
                Id = Guid.NewGuid(),
                UserId = customer.Id,
                Token = hashedRefreshToken,
                TokenType = TokenType.Customer,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                CreatedAt = DateTime.UtcNow,
                IsRevoked = false
            });

            await _dbContext.SaveChangesAsync();
            _cookieService.SetTokenCookies(response, accessToken, rawRefreshToken, TokenType.Customer);

            return MapToDto(customer);
        }

        public async Task<CustomerDto?> ValidateAsync(HttpRequest request)
        {
            var accessToken = _cookieService.GetAccessTokenFromCookies(request, TokenType.Customer);
            if (accessToken is null) return null;

            var principal = _tokenService.ValidateAccessToken(accessToken);
            if (principal is null) return null;

            var userId = principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                ?? principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId is null) return null;

            var customer = await _userManager.FindByIdAsync(userId);

            if (customer is null || !customer.EmailConfirmed) return null;

            return MapToDto(customer);
        }

        public async Task<bool> RefreshAsync(HttpRequest request, HttpResponse response)
        {
            var rawRefreshToken = _cookieService.GetRefreshTokenFromCookies(request, TokenType.Customer);
            if (rawRefreshToken is null) return false;

            var hashed = _tokenService.HashToken(rawRefreshToken);
            var existing = await _dbContext.RefreshTokens.FirstOrDefaultAsync(
                rt => rt.Token == hashed && rt.TokenType == TokenType.Customer);

            if (existing is null) return false;

            if (existing.IsRevoked)
            {
                var family = await _dbContext.RefreshTokens
                    .Where(rt => rt.UserId == existing.UserId && rt.TokenType == TokenType.Customer)
                    .ToListAsync();

                foreach (var t in family) { t.IsRevoked = true; t.RevokedAt = DateTime.UtcNow; }
                await _dbContext.SaveChangesAsync();
                return false;
            }

            if (existing.ExpiresAt < DateTime.UtcNow) return false;

            var customer = await _userManager.FindByIdAsync(existing.UserId.ToString());
            if (customer is null || !customer.EmailConfirmed) return false;

            var roles = await _userManager.GetRolesAsync(customer);
            var newAccessToken = _tokenService.GenerateAccessToken(customer.Id.ToString(), customer.Email!, roles);
            var newRaw = _tokenService.GenerateRefreshToken();
            var newHashed = _tokenService.HashToken(newRaw);

            existing.IsRevoked = true;
            existing.RevokedAt = DateTime.UtcNow;
            existing.ReplacedByToken = newHashed;

            _dbContext.RefreshTokens.Add(new Domains.Entities.RefreshToken
            {
                Id = Guid.NewGuid(),
                UserId = customer.Id,
                Token = newHashed,
                TokenType = TokenType.Customer,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                CreatedAt = DateTime.UtcNow,
                IsRevoked = false
            });

            await _dbContext.SaveChangesAsync();
            _cookieService.SetTokenCookies(response, newAccessToken, newRaw, TokenType.Customer);
            return true;
        }

        public async Task LogoutAsync(HttpRequest request, HttpResponse response)
        {
            var rawRefreshToken = _cookieService.GetRefreshTokenFromCookies(request, TokenType.Customer);
            if (rawRefreshToken is null) return;

            var hashed = _tokenService.HashToken(rawRefreshToken);
            var existing = await _dbContext.RefreshTokens.FirstOrDefaultAsync(
                rt => rt.Token == hashed && rt.TokenType == TokenType.Customer);

            if (existing is null) return;

            existing.IsRevoked = true;
            existing.RevokedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();
            _cookieService.DeleteTokenCookies(response, TokenType.Customer);
        }

        public async Task<(bool Success, string? Error)> ForgotPasswordAsync(ForgotPasswordRequest request)
        {
            var customer = await _userManager.FindByEmailAsync(request.Email);

            // Always return success to avoid email enumeration
            if (customer is null) return (true, null);

            var token = await _userManager.GeneratePasswordResetTokenAsync(customer);
            var encodedToken = Uri.EscapeDataString(token);
            var frontendUrl = Environment.GetEnvironmentVariable("CUSTOMER_FRONTEND_URL");
            var resetLink = $"{frontendUrl}/reset-password?email={request.Email}&token={encodedToken}";

            await _emailService.SendPasswordResetAsync(request.Email, resetLink);
            return (true, null);
        }

        public async Task<(bool Success, string? Error)> ResetPasswordAsync(ResetPasswordRequest request)
        {
            var customer = await _userManager.FindByEmailAsync(request.Email);
            if (customer is null) return (false, "Invalid request.");

            var decoded = Uri.UnescapeDataString(request.Token);
            var result = await _userManager.ResetPasswordAsync(customer, decoded, request.NewPassword);
            if (!result.Succeeded)
                return (false, string.Join(", ", result.Errors.Select(e => e.Description)));

            return (true, null);
        }

        public async Task<CustomerDto?> GoogleLoginAsync(string email, string? firstName, string? lastName, HttpResponse response)
        {
            var customer = await _userManager.FindByEmailAsync(email);

            if (customer is null)
            {
                customer = new Customer
                {
                    Id = Guid.NewGuid(),
                    UserName = email,
                    Email = email,
                    FirstName = firstName ?? string.Empty,
                    LastName = lastName ?? string.Empty,
                    EmailConfirmed = true // Google already verified the email
                };

                var result = await _userManager.CreateAsync(customer);
                if (!result.Succeeded) return null;

                await _userManager.AddToRoleAsync(customer, "Customer");
            }

            var roles = await _userManager.GetRolesAsync(customer);
            var accessToken = _tokenService.GenerateAccessToken(customer.Id.ToString(), customer.Email!, roles);
            var rawRefreshToken = _tokenService.GenerateRefreshToken();
            var hashedRefreshToken = _tokenService.HashToken(rawRefreshToken);

            _dbContext.RefreshTokens.Add(new Domains.Entities.RefreshToken
            {
                Id = Guid.NewGuid(),
                UserId = customer.Id,
                Token = hashedRefreshToken,
                TokenType = TokenType.Customer,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                CreatedAt = DateTime.UtcNow,
                IsRevoked = false
            });

            await _dbContext.SaveChangesAsync();
            _cookieService.SetTokenCookies(response, accessToken, rawRefreshToken, TokenType.Customer);

            return MapToDto(customer);
        }

        public async Task<(bool Success, string? Error)> UpdateAsync(Guid customerId, UpdateCustomerRequest request)
        {
            var customer = await _userManager.FindByIdAsync(customerId.ToString());
            if (customer is null) return (false, "Customer not found.");

            customer.FirstName = request.FirstName;
            customer.LastName = request.LastName;
            customer.Email = request.Email;
            customer.UserName = request.Email;

            var result = await _userManager.UpdateAsync(customer);
            if (!result.Succeeded)
                return (false, string.Join(", ", result.Errors.Select(e => e.Description)));

            return (true, null);
        }

        public async Task<(bool Success, string? Error)> DeleteAsync(Guid customerId)
        {
            var customer = await _userManager.FindByIdAsync(customerId.ToString());
            if (customer is null) return (false, "Customer not found.");

            customer.IsActive = false;
            await _userManager.UpdateAsync(customer);

            // Revoke all refresh tokens
            var tokens = await _dbContext.RefreshTokens
                .Where(rt => rt.UserId == customerId && rt.TokenType == TokenType.Customer)
                .ToListAsync();

            foreach (var t in tokens) { t.IsRevoked = true; t.RevokedAt = DateTime.UtcNow; }
            await _dbContext.SaveChangesAsync();

            return (true, null);
        }

        public async Task<CustomerDto?> GetByIdAsync(Guid customerId)
        {
            var customer = await _userManager.FindByIdAsync(customerId.ToString());
            if (customer is null) return null;
            return MapToDto(customer);
        }

        public async Task<List<CustomerDto>> GetAllAsync()
        {
            var customers = await _userManager.Users.ToListAsync();
            return customers.Select(MapToDto).ToList();
        }

        private static CustomerDto MapToDto(Customer customer) => new(
            customer.Id,
            customer.FirstName,
            customer.LastName,
            customer.Email!,
            customer.EmailConfirmed
        );
    }
}