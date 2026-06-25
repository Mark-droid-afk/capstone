using Api.Contracts.Requests;
using Applications.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Api.Contracts.Responses;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/customer-auth")]
    public class CustomerAuthController : ControllerBase
    {
        private readonly ICustomerAuthService _customerAuthService;

        public CustomerAuthController(ICustomerAuthService customerAuthService)
        {
            _customerAuthService = customerAuthService;
        }

        [HttpPost("register")]
        [ProducesResponseType(typeof(CustomerDto), StatusCodes.Status200OK)] 
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Register([FromBody] CustomerRegisterRequest request)
        {
            var (success, error) = await _customerAuthService.RegisterAsync(request);
            if (!success) return BadRequest(new { error });
            return Ok(new { message = "Registration successful. Please check your email to confirm your account." });
        }

        [HttpGet("confirm-email")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ConfirmEmail([FromQuery] string email, [FromQuery] string token)
        {
            var (success, error) = await _customerAuthService.ConfirmEmailAsync(email, token);
            if (!success) return BadRequest(new { error });
            return Ok(new { message = "Email confirmed successfully." });
        }

        [HttpPost("login")]
        [ProducesResponseType(typeof(CustomerDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Login([FromBody] CustomerLoginRequest request)
        {
            var customer = await _customerAuthService.LoginAsync(request, Response);
            if (customer is null) return Unauthorized(new { error = "Invalid credentials or email not confirmed." });
            return Ok(new { customer });
        }

        [HttpGet("validate")]
        [ProducesResponseType(typeof(CustomerDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Validate()
        {
            var customer = await _customerAuthService.ValidateAsync(Request);
            if (customer is null) return Unauthorized();
            return Ok(new { customer });
        }

        [HttpPost("refresh")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Refresh()
        {
            var success = await _customerAuthService.RefreshAsync(Request, Response);
            if (!success) return Unauthorized(new { error = "Invalid or expired refresh token." });
            return Ok(new { message = "Token refreshed." });
        }

        [HttpPost("logout")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        public async Task<IActionResult> Logout()
        {
            await _customerAuthService.LogoutAsync(Request, Response);
            return Ok(new { message = "Logged out successfully." });
        }

        [HttpPost("forgot-password")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            await _customerAuthService.ForgotPasswordAsync(request);
            return Ok(new { message = "If the email exists, a reset link has been sent." });
        }

        [HttpPost("reset-password")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var (success, error) = await _customerAuthService.ResetPasswordAsync(request);
            if (!success) return BadRequest(new { error });
            return Ok(new { message = "Password reset successfully." });
        }

        [HttpGet("google")]
        [ProducesResponseType(typeof(void), StatusCodes.Status302Found)]
        public IActionResult GoogleLogin()
        {
            var redirectUrl = Url.Action(nameof(GoogleCallback), "CustomerAuth");
            var properties = new Microsoft.AspNetCore.Authentication.AuthenticationProperties
            {
                RedirectUri = redirectUrl
            };
            return Challenge(properties, "Google");
        }

        [HttpGet("google/callback")]
        [ProducesResponseType(typeof(void), StatusCodes.Status302Found)]
        public async Task<IActionResult> GoogleCallback()
        {
            var result = await HttpContext.AuthenticateAsync("Google");
            if (!result.Succeeded) return Unauthorized(new { error = "Google authentication failed." });

            var email = result.Principal?.FindFirst(ClaimTypes.Email)?.Value;
            var firstName = result.Principal?.FindFirst(ClaimTypes.GivenName)?.Value;
            var lastName = result.Principal?.FindFirst(ClaimTypes.Surname)?.Value;

            if (email is null) return Unauthorized(new { error = "Could not retrieve email from Google." });

            var customer = await _customerAuthService.GoogleLoginAsync(email, firstName, lastName, Response);
            if (customer is null) return Unauthorized(new { error = "Google login failed." });

            var frontendUrl = Environment.GetEnvironmentVariable("CUSTOMER_FRONTEND_URL");
            return Redirect($"{frontendUrl}/auth/callback");
        }

        [HttpGet("customers")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(List<CustomerDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll()
        {
            var customers = await _customerAuthService.GetAllAsync();
            return Ok(new { customers });
        }

        [HttpGet("customers/{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(CustomerDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(Guid id)
        {
            var customer = await _customerAuthService.GetByIdAsync(id);
            if (customer is null) return NotFound(new { error = "Customer not found." });
            return Ok(new { customer });
        }

        [HttpPatch("customers/{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(CustomerDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCustomerRequest request)
        {
            var (success, error) = await _customerAuthService.UpdateAsync(id, request);
            if (!success) return BadRequest(new { error });
            return Ok(new { message = "Customer updated successfully." });
        }

        [HttpDelete("customers/{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(CustomerDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(object), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var (success, error) = await _customerAuthService.DeleteAsync(id);
            if (!success) return NotFound(new { error });
            return Ok(new { message = "Customer deactivated successfully." });
        }
    }
}