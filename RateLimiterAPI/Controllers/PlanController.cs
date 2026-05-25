using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RateLimiterApi.DTOs.Common;
using RateLimiterApi.DTOs.Plan;
using RateLimiterApi.Services;
using System.Security.Claims;

namespace RateLimiterApi.Controllers
{
    [ApiController]
    [Route("api/plans")]
    public class PlanController : ControllerBase
    {
        private readonly PlanService _planService;

        public PlanController(PlanService planService)
        {
            _planService = planService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPlans()
        {
            var plans = await _planService.GetAllPlansAsync();
            return Ok(ApiResponseDto<List<PlanResponseDto>>.Ok(plans));
        }

        [HttpGet("my-plan")]
        [Authorize]
        public async Task<IActionResult> GetMyPlan()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var plan = await _planService.GetUserPlanAsync(userId);

            if(plan == null) return NotFound(ApiResponseDto<string>.Fail("Plan not found"));

            return Ok(ApiResponseDto<PlanResponseDto>.Ok(plan));
        }

        [HttpPut("users/{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUserPlan(int userId, [FromBody] UpdateUserPlanDto dto)
        {
            var result = await _planService.UpdateUserPlanAsync(userId, dto.PlanId);

            if(!result) return NotFound(ApiResponseDto<string>.Fail("User or plan not found"));

            return Ok(ApiResponseDto<string>.Ok("Plan updated successfully"));
        }
    }
}