using Microsoft.EntityFrameworkCore;
using RateLimiterApi.Data;
using RateLimiterApi.Models;
using Microsoft.AspNetCore.SignalR;
using RateLimiterApi.Hubs;
namespace RateLimiterApi.Services
{
    public class RateLimitService
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<DashboardHub> _hubContext;

        public RateLimitService(AppDbContext context, IHubContext<DashboardHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        public async Task<bool> IsRateLimitedAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);

            if (user == null) return true;
            if (user.IsBlocked) return true;

            var oneMinuteAgo = DateTime.UtcNow.AddMinutes(-1);
            var requestCount = await _context.RequestLogs.CountAsync(r => r.UserId == userId && r.Timestamp >= oneMinuteAgo);

            return requestCount >= user.RateLimit;
        }

        public async Task LogRequestAsync(int userId, string endpoint, string method, int statusCode)
        {
            var log = new RequestLog
            {
                UserId = userId,
                Endpoint = endpoint,
                Method = method,
                StatusCode = statusCode,
                Timestamp = DateTime.UtcNow
            };

            _context.RequestLogs.Add(log);
            await _context.SaveChangesAsync();
        }

        public async Task<int> GetRemainingRequestsAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return 0;

            var oneMinuteAgo = DateTime.UtcNow.AddMinutes(-1);
            var requestCount = await _context.RequestLogs.CountAsync(r => r.UserId == userId && r.Timestamp >= oneMinuteAgo);

            return Math.Max(0, user.RateLimit - requestCount);
        }

        public async Task<int> GetResetTimeInSecondsAsync(int userId)
        {
            var oneMinuteAgo = DateTime.UtcNow.AddMinutes(-1);

            var oldestRequest = await _context.RequestLogs
            .Where(r => r.UserId == userId && r.Timestamp >= oneMinuteAgo)
            .OrderBy(r => r.Timestamp)
            .FirstOrDefaultAsync();

            if (oldestRequest == null) return 0;

            var resetTime = oldestRequest.Timestamp.AddMinutes(1);
            var secondsLeft = (int)(resetTime - DateTime.UtcNow).TotalSeconds;

            return Math.Max(0, secondsLeft);
        }

        public async Task NotifyStatusAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return;

            var remaining = await GetRemainingRequestsAsync(userId);
            var resetTime = await GetResetTimeInSecondsAsync(userId);

            var riskScore = 0; 

            await _hubContext.Clients.User(userId.ToString())
                .SendAsync("StatusUpdate", new
                {
                    remainingRequests = remaining,
                    resetInSeconds = resetTime,
                    riskScore = riskScore
                });
        }
    }
}