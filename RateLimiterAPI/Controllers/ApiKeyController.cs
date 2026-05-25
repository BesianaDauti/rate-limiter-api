using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RateLimiterApi.DTOs.ApiKey;
using RateLimiterApi.DTOs.Common;
using RateLimiterApi.Services;
using System.Security.Claims;

namespace RateLimiterApi.Controllers
{
    [ApiController]
    [Route("api/keys")]
    [Authorize]
    public class ApiKeyController : ControllerBase
    {
        private readonly ApiKeyService _apiKeyService;
        public ApiKeyController(ApiKeyService apiKeyService)
        {
            _apiKeyService = apiKeyService;
        }

        [HttpGet]
        public async Task<IActionResult> GetKeys()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var keys = await _apiKeyService.GetUserKeysAsync(userId);
            return Ok(ApiResponseDto<List<ApiKeyResponseDto>>.Ok(keys));
        }

        [HttpPost]
        public async Task<IActionResult> CreateKey([FromBody] CreateApiKeyDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ApiResponseDto<string>.Fail("Invalid data"));

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var result = await _apiKeyService.CreateAsync(userId, dto);

            if(result == null) return BadRequest(ApiResponseDto<string>.Fail("Maximum 5 active API keys allowed"));
            return Ok(ApiResponseDto<ApiKeyResponseDto>.Ok(result, "API key created successfully"));
        }

        [HttpPut("{id}/revoke")]
        public async Task<IActionResult> RevokeKey(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var result = await _apiKeyService.RevokeAsync(userId, id);

            if(!result) return NotFound(ApiResponseDto<string>.Fail("API key not found"));

            return Ok(ApiResponseDto<string>.Ok("API key revoked successfully"));
        }
        
        [HttpPut("{id}/regenerate")]
        public async Task<IActionResult> RegenerateKey(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var result = await _apiKeyService.RegenerateAsync(userId, id);

            if(result == null) return NotFound(ApiResponseDto<string>.Fail("API key not found"));

            return Ok(ApiResponseDto<ApiKeyResponseDto>.Ok(result, "API key regenerated successfully"));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteKey(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var result = await _apiKeyService.DeleteAsync(userId, id);

            if (!result) return NotFound(ApiResponseDto<string>.Fail("API key not found"));

            return Ok(ApiResponseDto<string>.Ok("API key deleted successfully"));
        }
    }
}