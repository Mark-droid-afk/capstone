using Api.Contracts.Requests;
using Api.Contracts.Responses;
using Applications.Interfaces;
using Domains.Entities;
using Domains.Enums;
using Infrastructures.Persistence;
using Applications.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Applications.Services
{
    public class ErpAuthService : IErpAuthService
    {
        private readonly UserManager<ErpUser> _userManager;
        private readonly AuthDbContext _dbContext;
        private readonly ITokenService _tokenService;
        private readonly ICookieService _cookieService;
        private readonly IEmailService _emailService;

        public ErpAuthService(
            UserManager<ErpUser> userManager,
            AuthDbContext dbContext,
            ITokenService tokenService,
            ICookieService cookieService,
            IEmailService emailService)
        {
            _userManager = userManager;
            _dbContext = dbContext;
            _tokenService = tokenService;
            _cookieService = cookieService;
            _emailService = emailService;
        }

        public async Task<(bool Success, string? Error)> RegisterAsync(ErpRegisterRequest request)
        {
            var username = await GenerateUsernameAsync();
            var tempPassword = GenerateTempPassword();

            var user = new ErpUser
            {
                Id = Guid.NewGuid(),
                UserName = username,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                MustChangePassword = true,
                EmailConfirmed = true // admin-created, no need to verify
            };

            var result = await _userManager.CreateAsync(user, tempPassword);
            if (!result.Succeeded)
                return (false, string.Join(", ", result.Errors.Select(e => e.Description)));

            await _userManager.AddToRoleAsync(user, "Employee");

            // Assign app accesses
            var appAccesses = request.AppAccesses.Select(a => new AppAccess
            {
                Id = Guid.NewGuid(),
                ErpUserId = user.Id,
                AppName = a.AppName,
                Modules = a.Modules.Select(m => new ModuleAccess
                {
                    Id = Guid.NewGuid(),
                    ModuleName = m.ModuleName,
                    CanRead = m.CanRead,
                    CanWrite = m.CanWrite,
                    CanDelete = m.CanDelete,
                    CanExport = m.CanExport
                }).ToList()
            }).ToList();

            _dbContext.AppAccesses.AddRange(appAccesses);
            await _dbContext.SaveChangesAsync();

            await _emailService.SendErpCredentialsAsync(request.Email, username, tempPassword);

            return (true, null);
        }

        public async Task<(ErpUserDto? User, bool MustChangePassword)> LoginAsync(ErpLoginRequest request, HttpResponse response)
        {
            var user = await _userManager.Users
                .Include(u => u.AppAccesses)
                    .ThenInclude(a => a.Modules)
                .FirstOrDefaultAsync(u => u.UserName == request.Username);

            if (user is null || !await _userManager.CheckPasswordAsync(user, request.Password))
                return (null, false);

            if (!user.IsActive) // see note below
                return (null, false);

            var roles = await _userManager.GetRolesAsync(user);
            var accessToken = _tokenService.GenerateAccessToken(user.Id.ToString(), user.Email!, roles);
            var rawRefreshToken = _tokenService.GenerateRefreshToken();
            var hashedRefreshToken = _tokenService.HashToken(rawRefreshToken);

            _dbContext.RefreshTokens.Add(new Domains.Entities.RefreshToken
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Token = hashedRefreshToken,
                TokenType = TokenType.Erp,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                CreatedAt = DateTime.UtcNow,
                IsRevoked = false
            });

            await _dbContext.SaveChangesAsync();
            _cookieService.SetTokenCookies(response, accessToken, rawRefreshToken, TokenType.Erp);

            return (MapToDto(user, roles), user.MustChangePassword);
        }

        public async Task<ErpUserDto?> ValidateAsync(HttpRequest request)
        {
            var accessToken = _cookieService.GetAccessTokenFromCookies(request, TokenType.Erp);
            Console.WriteLine($"Access token from cookie: {accessToken?[..20]}..."); // ← add this            
            if (accessToken is null) return null;

            var principal = _tokenService.ValidateAccessToken(accessToken);
            Console.WriteLine($"Principal: {principal?.Identity?.Name}");
            if (principal is null) return null;


            foreach (var claim in principal.Claims)
                Console.WriteLine($"[Validate] claim: {claim.Type} = {claim.Value}");

            var userId = principal.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
     ?? principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            Console.WriteLine($"[Validate] userId: {userId ?? "NULL"}");
            if (userId is null) return null;

            var user = await _userManager.Users
                .Include(u => u.AppAccesses)
                    .ThenInclude(a => a.Modules)
                .FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));
            Console.WriteLine($"[Validate] user found: {user?.Email ?? "NULL"}");
            if (user is null) return null;

            Console.WriteLine($"[Validate] IsActive: {user.IsActive}");
            var roles = await _userManager.GetRolesAsync(user);
            return MapToDto(user, roles);
        }

        public async Task<bool> RefreshAsync(HttpRequest request, HttpResponse response)
        {
            var rawRefreshToken = _cookieService.GetRefreshTokenFromCookies(request, TokenType.Erp);
            if (rawRefreshToken is null) return false;

            var hashed = _tokenService.HashToken(rawRefreshToken);
            var existing = await _dbContext.RefreshTokens.FirstOrDefaultAsync(
                rt => rt.Token == hashed && rt.TokenType == TokenType.Erp);

            if (existing is null) return false;

            if (existing.IsRevoked)
            {
                var family = await _dbContext.RefreshTokens
                    .Where(rt => rt.UserId == existing.UserId && rt.TokenType == TokenType.Erp)
                    .ToListAsync();

                foreach (var t in family) { t.IsRevoked = true; t.RevokedAt = DateTime.UtcNow; }
                await _dbContext.SaveChangesAsync();
                return false;
            }

            if (existing.ExpiresAt < DateTime.UtcNow) return false;

            var user = await _userManager.Users
                .Include(u => u.AppAccesses)
                    .ThenInclude(a => a.Modules)
                .FirstOrDefaultAsync(u => u.Id == existing.UserId);

            if (user is null) return false;

            var roles = await _userManager.GetRolesAsync(user);
            var newAccessToken = _tokenService.GenerateAccessToken(user.Id.ToString(), user.Email!, roles);
            var newRaw = _tokenService.GenerateRefreshToken();
            var newHashed = _tokenService.HashToken(newRaw);

            existing.IsRevoked = true;
            existing.RevokedAt = DateTime.UtcNow;
            existing.ReplacedByToken = newHashed;

            _dbContext.RefreshTokens.Add(new Domains.Entities.RefreshToken
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Token = newHashed,
                TokenType = TokenType.Erp,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                CreatedAt = DateTime.UtcNow,
                IsRevoked = false
            });

            await _dbContext.SaveChangesAsync();
            _cookieService.SetTokenCookies(response, newAccessToken, newRaw, TokenType.Erp);
            return true;
        }

        public async Task LogoutAsync(HttpRequest request, HttpResponse response)
        {
            var rawRefreshToken = _cookieService.GetRefreshTokenFromCookies(request, TokenType.Erp);
            if (rawRefreshToken is null) return;

            var hashed = _tokenService.HashToken(rawRefreshToken);
            var existing = await _dbContext.RefreshTokens.FirstOrDefaultAsync(
                rt => rt.Token == hashed && rt.TokenType == TokenType.Erp);

            if (existing is null) return;

            existing.IsRevoked = true;
            existing.RevokedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();
            _cookieService.DeleteTokenCookies(response, TokenType.Erp);
        }

        public async Task<(bool Success, string? Error)> ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user is null) return (false, "User not found.");

            var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
            if (!result.Succeeded)
                return (false, string.Join(", ", result.Errors.Select(e => e.Description)));

            user.MustChangePassword = false;
            await _userManager.UpdateAsync(user);

            return (true, null);
        }

        public async Task<(bool Success, string? Error)> ForgotPasswordAsync(ForgotPasswordRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);

            // Always return success to avoid email enumeration
            if (user is null) return (true, null);

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = Uri.EscapeDataString(token);
            var frontendUrl = Environment.GetEnvironmentVariable("ERP_FRONTEND_URL");
            var resetLink = $"{frontendUrl}/reset-password?email={request.Email}&token={encodedToken}";

            await _emailService.SendPasswordResetAsync(request.Email, resetLink);
            return (true, null);
        }

        public async Task<(bool Success, string? Error)> ResetPasswordAsync(ResetPasswordRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user is null) return (false, "Invalid request.");

            var token = Uri.UnescapeDataString(request.Token);
            var result = await _userManager.ResetPasswordAsync(user, token, request.NewPassword);
            if (!result.Succeeded)
                return (false, string.Join(", ", result.Errors.Select(e => e.Description)));

            return (true, null);
        }

        public async Task<(bool Success, string? Error)> UpdateAsync(Guid userId, UpdateErpUserRequest request)
        {
            var user = await _userManager.Users
                .Include(u => u.AppAccesses)
                    .ThenInclude(a => a.Modules)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user is null) return (false, "User not found.");

            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
            user.Email = request.Email;
            user.IsActive = request.IsActive;

            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
                return (false, string.Join(", ", updateResult.Errors.Select(e => e.Description)));

            // Update roles
            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
            await _userManager.AddToRolesAsync(user, request.Roles);

            // Replace app accesses
            var existing = await _dbContext.AppAccesses
                .Where(a => a.ErpUserId == userId)
                .ToListAsync();

            _dbContext.AppAccesses.RemoveRange(existing);

            var newAccesses = request.AppAccesses.Select(a => new AppAccess
            {
                Id = Guid.NewGuid(),
                ErpUserId = userId,
                AppName = a.AppName,
                Modules = a.Modules.Select(m => new ModuleAccess
                {
                    Id = Guid.NewGuid(),
                    ModuleName = m.ModuleName,
                    CanRead = m.CanRead,
                    CanWrite = m.CanWrite,
                    CanDelete = m.CanDelete,
                    CanExport = m.CanExport
                }).ToList()
            }).ToList();

            _dbContext.AppAccesses.AddRange(newAccesses);
            await _dbContext.SaveChangesAsync();

            return (true, null);
        }

        public async Task<(bool Success, string? Error)> DeleteAsync(Guid userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user is null) return (false, "User not found.");

            user.IsActive = false;
            await _userManager.UpdateAsync(user);

            // Revoke all refresh tokens
            var tokens = await _dbContext.RefreshTokens
                .Where(rt => rt.UserId == userId && rt.TokenType == TokenType.Erp)
                .ToListAsync();

            foreach (var t in tokens) { t.IsRevoked = true; t.RevokedAt = DateTime.UtcNow; }
            await _dbContext.SaveChangesAsync();

            return (true, null);
        }

        public async Task<ErpUserDto?> GetByIdAsync(Guid userId)
        {
            var user = await _userManager.Users
                .Include(u => u.AppAccesses)
                    .ThenInclude(a => a.Modules)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user is null) return null;

            var roles = await _userManager.GetRolesAsync(user);
            return MapToDto(user, roles);
        }

        public async Task<List<ErpUserDto>> GetAllAsync()
        {
            var users = await _userManager.Users
                .Include(u => u.AppAccesses)
                    .ThenInclude(a => a.Modules)
                .ToListAsync();

            var result = new List<ErpUserDto>();
            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                result.Add(MapToDto(user, roles));
            }

            return result;
        }

        // Helpers

        private async Task<string> GenerateUsernameAsync()
        {
            var today = DateTime.UtcNow.ToString("yyyyMMdd");
            var prefix = $"ERP-{today}-";

            var count = await _userManager.Users
                .CountAsync(u => u.UserName != null && u.UserName.StartsWith(prefix));

            return $"{prefix}{(count + 1):D4}";
        }

        private static string GenerateTempPassword()
        {
            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
            var random = new Random();
            return new string(Enumerable.Range(0, 12).Select(_ => chars[random.Next(chars.Length)]).ToArray());
        }

        private static ErpUserDto MapToDto(ErpUser user, IList<string> roles) => new(
            user.Id,
            user.UserName!,
            user.FirstName,
            user.LastName,
            user.Email!,
            user.MustChangePassword,
            roles.ToList(),
            user.AppAccesses.Select(a => new AppAccessDto(
                a.AppName,
                a.Modules.Select(m => new ModuleAccessDto(
                    m.ModuleName,
                    m.CanRead,
                    m.CanWrite,
                    m.CanDelete,
                    m.CanExport
                )).ToList()
            )).ToList()
        );
    }
}