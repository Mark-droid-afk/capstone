using Api.Contracts.Requests;
using Applications.Interfaces;
using Api.Contracts.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/erp-auth")]
    public class ErpAuthController : ControllerBase
    {
        private readonly IErpAuthService _erpAuthService;

        public ErpAuthController(IErpAuthService erpAuthService)
        {
            _erpAuthService = erpAuthService;
        }

        [HttpPost("register")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ErpUserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Register([FromBody] ErpRegisterRequest request)
        {
            var (success, error) = await _erpAuthService.RegisterAsync(request);
            if (!success) return BadRequest(new { error });
            return Ok(new { message = "User created successfully." });
        }

        [HttpPost("login")]
        [ProducesResponseType(typeof(ErpUserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login([FromBody] ErpLoginRequest request)
        {
            var (user, mustChangePassword) = await _erpAuthService.LoginAsync(request, Response);
            if (user is null) return Unauthorized(new { error = "Invalid credentials." });
            return Ok(new { user, mustChangePassword });
        }

        [HttpGet("validate")]
        [ProducesResponseType(typeof(ErpUserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Validate()
        {
            var user = await _erpAuthService.ValidateAsync(Request);
            if (user is null) return Unauthorized(new { error = "Invalid or expired token." });
            return Ok(new { user });
        }

        [HttpPost("refresh")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Refresh()
        {
            var success = await _erpAuthService.RefreshAsync(Request, Response);
            if (!success) return Unauthorized(new { error = "Invalid or expired refresh token." });
            return Ok(new { message = "Token refreshed." });
        }

        [HttpPost("logout")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Logout()
        {
            await _erpAuthService.LogoutAsync(Request, Response);
            return Ok(new { message = "Logged out successfully." });
        }

        [HttpPost("change-password")]
        [Authorize]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value;

            if (userId is null) return Unauthorized(new { error = "Invalid or expired token." });

            var (success, error) = await _erpAuthService.ChangePasswordAsync(Guid.Parse(userId), request);
            if (!success) return BadRequest(new { error });
            return Ok(new { message = "Password changed successfully." });
        }

        [HttpPost("forgot-password")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            await _erpAuthService.ForgotPasswordAsync(request);
            return Ok(new { message = "If the email exists, a reset link has been sent." });
        }

        [HttpPost("reset-password")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var (success, error) = await _erpAuthService.ResetPasswordAsync(request);
            if (!success) return BadRequest(new { error });
            return Ok(new { message = "Password reset successfully." });
        }

        [HttpGet("users")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(List<ErpUserDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll()
        {
            var users = await _erpAuthService.GetAllAsync();
            return Ok(new { users });
        }

        [HttpGet("users/{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ErpUserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(Guid id)
        {
            var user = await _erpAuthService.GetByIdAsync(id);
            if (user is null) return NotFound(new { error = "User not found." });
            return Ok(new { user });
        }

        [HttpPatch("users/{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ErpUserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateErpUserRequest request)
        {
            var (success, error) = await _erpAuthService.UpdateAsync(id, request);
            if (!success) return BadRequest(new { error });
            return Ok(new { message = "User updated successfully." });
        }

        [HttpDelete("users/{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var (success, error) = await _erpAuthService.DeleteAsync(id);
            if (!success) return NotFound(new { error });
            return Ok(new { message = "User deactivated successfully." });
        }
    }
}