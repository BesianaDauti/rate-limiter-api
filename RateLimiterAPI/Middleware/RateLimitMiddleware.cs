using System.Security.Claims;
using System.Text.Json;
using RateLimiterApi.Services;
using Microsoft.AspNetCore.SignalR;
using RateLimiterApi.Hubs;

namespace RateLimiterApi.Middleware
{
    public class RateLimitMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IHubContext<DashboardHub> _hubContext;

        public RateLimitMiddleware(RequestDelegate next, IHubContext<DashboardHub> hubContext)
        {
            _next = next;
            _hubContext = hubContext;
        }

        public async Task InvokeAsync(
            HttpContext context,
            RateLimitService rateLimitService,
            ApiKeyService apiKeyService,
            AbuseDetectionService abuseDetectionService)
        {
            var path = context.Request.Path.Value?.ToLower();

            if (path != null && (
                path.StartsWith("/api/auth") ||
                path.StartsWith("/swagger") ||
                path.StartsWith("/hubs") ||
                path.EndsWith("/data/status") ||
                path.EndsWith("/data/risk-score")))
            {
                await _next(context);
                return;
            }

            int userId = 0;
            var ipAddress = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

            var apiKeyHeader = context.Request.Headers["X-API-Key"].FirstOrDefault()?.Trim();

            if (!string.IsNullOrEmpty(apiKeyHeader))
            {
                Console.WriteLine($"HEADER KEY: '{apiKeyHeader}'");

                var apiKey = await apiKeyService.ValidateKeyAsync(apiKeyHeader);

                Console.WriteLine($"DB MATCH FOUND: {apiKey != null}");

                if (apiKey == null)
                {
                    context.Response.StatusCode = 401;
                    context.Response.ContentType = "application/json";
                    await context.Response.WriteAsync(JsonSerializer.Serialize(new
                    {
                        success = false,
                        error = "Invalid or expired API key."
                    }));
                    return;
                }

                userId = apiKey.UserId;
            }
            else
            {
                var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);

                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out userId))
                {
                    context.Response.StatusCode = 401;
                    context.Response.ContentType = "application/json";
                    await context.Response.WriteAsync(JsonSerializer.Serialize(new
                    {
                        success = false,
                        error = "Missing API key or JWT token."
                    }));
                    return;
                }
            }

            var endpoint = context.Request.Path.Value ?? "/";
            var method = context.Request.Method;

            var isBurst = await abuseDetectionService.IsBurstTrafficAsync(userId);
            if (isBurst)
            {
                context.Response.StatusCode = 429;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync(JsonSerializer.Serialize(new
                {
                    success = false,
                    error = "Burst traffic detected.",
                    message = "Too many requests in a short period. Slow down!"
                }));
                await abuseDetectionService.AnalyzeAndActAsync(userId, ipAddress);
                return;
            }

            var isLimited = await rateLimitService.IsRateLimitedAsync(userId);
            if (isLimited)
            {
                var resetTime = await rateLimitService.GetResetTimeInSecondsAsync(userId);
                context.Response.StatusCode = 429;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync(JsonSerializer.Serialize(new
                {
                    success = false,
                    error = "Rate limit exceeded",
                    remaining = 0,
                    resetInSeconds = resetTime,
                    message = $"Too many requests. Try again in {resetTime} seconds."
                }));
                await abuseDetectionService.AnalyzeAndActAsync(userId, ipAddress);
                return;
            }

            context.Response.OnStarting(() =>
            {
                context.Response.Headers.TryAdd("X-RateLimit-Reset", "60");
                return Task.CompletedTask;
            });

            await _next(context);

            var statusCode = context.Response.StatusCode;
            await rateLimitService.LogRequestAsync(userId, endpoint, method, statusCode);

            var remaining = await rateLimitService.GetRemainingRequestsAsync(userId);
            var resetTimeAfter = await rateLimitService.GetResetTimeInSecondsAsync(userId);

            await _hubContext.Clients
                .Group($"user_{userId}")
                .SendAsync("StatusUpdate", new
                {
                    remainingRequests = remaining,
                    resetInSeconds = resetTimeAfter,
                    message = "API is active"
                });

            var riskScore = await abuseDetectionService.GetUserRiskScoreAsync(userId);
            await _hubContext.Clients
                .Group($"user_{userId}")
                .SendAsync("RiskScoreUpdate", riskScore);

            if (statusCode == 429 || remaining % 10 == 0)
                await abuseDetectionService.AnalyzeAndActAsync(userId, ipAddress);
        }
    }
}