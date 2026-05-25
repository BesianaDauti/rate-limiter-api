using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RateLimiterApi.Data;
using RateLimiterApi.DTOs.Admin;
using RateLimiterApi.DTOs.Common;
using RateLimiterApi.Services;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace RateLimiterApi.Controllers
{
    [ApiController]
    [Route("api/data")]
    [Authorize]
    public class ApiController: ControllerBase
    {
        private readonly RateLimitService _rateLimitService;
        private readonly AppDbContext _context;

        public ApiController(RateLimitService rateLimitService, AppDbContext context)
        {
            _rateLimitService = rateLimitService;
            _context = context;
        }

        [HttpGet("status")]
        public async Task<IActionResult> GetStatus()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var remaining = await _rateLimitService.GetRemainingRequestsAsync(userId);
            var resetTime = await _rateLimitService.GetResetTimeInSecondsAsync(userId);

            var result = new
            {
                message = "API is active",
                remainingRequests = remaining,
                resetInSeconds = resetTime
            };
            return Ok(ApiResponseDto<object>.Ok(result));
        }

        [HttpGet("test")]
        [AllowAnonymous]
        public IActionResult Test()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            var result = new
            {
                message = "Request completed successfully",
                email, role,
                timestamp = DateTime.UtcNow
            };

            return Ok(ApiResponseDto<object>.Ok(result));
        }

        [HttpGet("my-logs")]
        [Authorize]
        public async Task<IActionResult> GetMyLogs(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? method = null,
            [FromQuery] int? statusCode = null)
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var query = _context.RequestLogs
                .Where(r => r.UserId == userId)
                .AsQueryable();

            // Filtrime
            if (!string.IsNullOrEmpty(method))
                query = query.Where(r => r.Method == method);

            if (statusCode.HasValue)
                query = query.Where(r => r.StatusCode == statusCode);

            var total = await query.CountAsync();

            var logs = await query
                .OrderByDescending(r => r.Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new
                {
                    r.Id,
                    r.Endpoint,
                    r.Method,
                    r.StatusCode,
                    r.Timestamp,
                    source = r.UserId == userId ? "API Key" : "JWT"
                })
                .ToListAsync();

            return Ok(ApiResponseDto<object>.Ok(new
            {
                logs,
                total,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling(total / (double)pageSize)
            }));
        }

        [HttpGet("my-stats")]
        [Authorize]
        public async Task<IActionResult> GetMyStats()
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var now = DateTime.UtcNow;
            var oneDayAgo = now.AddDays(-1);
            var oneWeekAgo = now.AddDays(-7);
            var oneMonthAgo = now.AddDays(-30);

            var totalRequests = await _context.RequestLogs
                .CountAsync(r => r.UserId == userId);

            var requestsToday = await _context.RequestLogs
                .CountAsync(r => r.UserId == userId
                    && r.Timestamp >= oneDayAgo);

            var requestsThisWeek = await _context.RequestLogs
                .CountAsync(r => r.UserId == userId
                    && r.Timestamp >= oneWeekAgo);

            var requestsThisMonth = await _context.RequestLogs
                .CountAsync(r => r.UserId == userId
                    && r.Timestamp >= oneMonthAgo);

            var blockedRequests = await _context.RequestLogs
                .CountAsync(r => r.UserId == userId
                    && r.StatusCode == 429);

            var successRequests = await _context.RequestLogs
                .CountAsync(r => r.UserId == userId
                    && r.StatusCode == 200);

            var topEndpoints = await _context.RequestLogs
                .Where(r => r.UserId == userId)
                .GroupBy(r => r.Endpoint)
                .Select(g => new
                {
                    endpoint = g.Key,
                    count = g.Count()
                })
                .OrderByDescending(x => x.count)
                .Take(5)
                .ToListAsync();

            return Ok(ApiResponseDto<object>.Ok(new
            {
                totalRequests,
                requestsToday,
                requestsThisWeek,
                requestsThisMonth,
                blockedRequests,
                successRequests,
                successRate = totalRequests > 0
                    ? Math.Round((double)successRequests / totalRequests * 100, 1)
                    : 0,
                topEndpoints
            }));
        }
    }
}