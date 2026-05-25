using Microsoft.AspNetCore.Mvc;
using RateLimiterApi.DTOs.Auth;
using RateLimiterApi.DTOs.Common;
using RateLimiterApi.Services;

namespace RateLimiterApi.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if(!ModelState.IsValid) return BadRequest(ApiResponseDto<string>.Fail("Invalid data."));

            var result = await _authService.RegisterAsync(dto);

            if(result == null) return BadRequest(ApiResponseDto<string>.Fail("Email already exists"));

            return Ok(ApiResponseDto<AuthResponseDto>.Ok(result, "Registration successfull"));
        }

       [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponseDto<string>.Fail("Invalid data."));

            var (result, error) = await _authService.LoginAsync(dto);

            if (result == null)
                return Unauthorized(ApiResponseDto<string>.Fail(error ?? "Login failed."));

            return Ok(ApiResponseDto<AuthResponseDto>.Ok(result, "Login successful."));
        }
    }
}