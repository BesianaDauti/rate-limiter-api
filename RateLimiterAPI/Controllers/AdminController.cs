using System.Diagnostics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RateLimiterApi.Data;
using RateLimiterApi.DTOs.Admin;
using RateLimiterApi.DTOs.Common;
using RateLimiterApi.Services;

namespace RateLimiterApi.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users.Select(u => new UserInfoDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Role = u.Role,
                RateLimit = u.RateLimit,
                IsBlocked = u.IsBlocked,
                CreatedAt = u.CreatedAt
            }).ToListAsync();

            return Ok(ApiResponseDto<List<UserInfoDto>>.Ok(users));
        }

        [HttpGet("logs")]
        public async Task<IActionResult> GetLogs()
        {
            var logs = await _context.RequestLogs
            .Include(r => r.User)
            .OrderByDescending(r => r.Timestamp).Take(100).Select(r => new
            {
                r.Id,
                r.Endpoint,
                r.Method,
                r.StatusCode,
                r.Timestamp,
                User = r.User == null ? null : new
                {
                    r.User.FullName,
                    r.User.Email
                }
            }).ToListAsync();

            return Ok(ApiResponseDto<object>.Ok(logs));
        }

        [HttpPut("users/{id}/ratelimit")]
        public async Task<IActionResult> UpdateRateLimit(int id, [FromBody] UpdateRateLimitDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if(user == null) return NotFound(ApiResponseDto<string>.Fail("User not found"));

            user.RateLimit = dto.NewLimit;
            await _context.SaveChangesAsync();

            return Ok(ApiResponseDto<string>.Ok($"Rate limit updated to {dto.NewLimit} requsts/minute"));
        }

        [HttpPut("users/{id}/block")]
        public async Task<IActionResult> BlockUser(int id, [FromBody] BlockUserDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(ApiResponseDto<string>.Fail("User not found."));

            user.IsBlocked = dto.IsBlocked;
            await _context.SaveChangesAsync();

            var status = dto.IsBlocked ? "blocked" : "unblocked";
            return Ok(ApiResponseDto<string>.Ok($"User {status} successfully"));
        }

            [HttpGet("suspicious")]
            public async Task<IActionResult> GetSuspiciousActivities(
                [FromServices] AbuseDetectionService abuseDetectionService)
            {
                var activities = await abuseDetectionService.GetSuspiciousActivitiesAsync();
                var result = activities.Select(a => new
                {
                    a.Id,
                    a.IpAddress,
                    a.Reason,
                    a.RiskScore,
                    a.IsAutoBanned,
                    a.DetectedAt,
                    User = a.User == null ? null : new
                    {
                        a.User.FullName,
                        a.User.Email
                    }
                }).ToList();

                return Ok(ApiResponseDto<object>.Ok(result));
            }

            [HttpPut("users/{id}/reset-risk")]
            public async Task<IActionResult> ResetRiskScore(
                int id,
                [FromServices] AbuseDetectionService abuseDetectionService)
            {
                await abuseDetectionService.ResetRiskScoreAsync(id);
                return Ok(ApiResponseDto<string>.Ok("Risk score reset successfully."));
            }
    }
}