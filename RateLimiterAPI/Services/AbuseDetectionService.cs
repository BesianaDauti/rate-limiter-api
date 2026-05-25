using Microsoft.EntityFrameworkCore;
using RateLimiterApi.Data;
using RateLimiterApi.Models;

namespace RateLimiterApi.Services
{
    public class AbuseDetectionService
    {
        private readonly AppDbContext _context;

        public AbuseDetectionService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> IsBurstTrafficAsync(int userId)
        {
            var tenSecondsAgo = DateTime.UtcNow.AddSeconds(-10);

            var requestCount = await _context.RequestLogs
                .AsNoTracking()
                .CountAsync(r =>
                    r.UserId == userId &&
                    r.Timestamp >= tenSecondsAgo);

            return requestCount >= 50;
        }

        public async Task<int> CalculateRiskScoreAsync(int userId, string ipAddress)
        {
            var riskScore = 0;

            if (await IsBurstTrafficAsync(userId))
                riskScore += 40;

            var oneHourAgo = DateTime.UtcNow.AddHours(-1);

            var blockedRequests = await _context.RequestLogs
                .AsNoTracking()
                .CountAsync(r =>
                    r.UserId == userId &&
                    r.StatusCode == 429 &&
                    r.Timestamp >= oneHourAgo);

            if (blockedRequests >= 10)
                riskScore += 30;
            else if (blockedRequests >= 5)
                riskScore += 15;

            var fiveMinutesAgo = DateTime.UtcNow.AddMinutes(-5);

            var uniqueEndpoints = await _context.RequestLogs
                .AsNoTracking()
                .Where(r =>
                    r.UserId == userId &&
                    r.Timestamp >= fiveMinutesAgo)
                .Select(r => r.Endpoint)
                .Distinct()
                .CountAsync();

            if (uniqueEndpoints >= 10)
                riskScore += 20;

            /*
             * Nëse tabela RequestLogs ka kolonën IpAddress,
             * përdore këtë logjikë:
             */

            var usersFromSameIp = await _context.RequestLogs
                .AsNoTracking()
                .Where(r =>
                    r.IpAddress == ipAddress &&
                    r.Timestamp >= oneHourAgo)
                .Select(r => r.UserId)
                .Distinct()
                .CountAsync();

            if (usersFromSameIp >= 5)
                riskScore += 10;

            return Math.Min(riskScore, 100);
        }

        public async Task AnalyzeAndActAsync(int userId, string ipAddress)
        {
            var riskScore = await CalculateRiskScoreAsync(userId, ipAddress);

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return;

            user.RiskScore = riskScore;

            var recentActivityExists = await _context.SuspiciousActivities
                .AsNoTracking()
                .AnyAsync(s =>
                    s.UserId == userId &&
                    s.DetectedAt >= DateTime.UtcNow.AddMinutes(-5));

            if (riskScore >= 80 && !user.IsBlocked)
            {
                user.IsBlocked = true;

                if (!recentActivityExists)
                {
                    _context.SuspiciousActivities.Add(new SuspiciousActivity
                    {
                        UserId = userId,
                        IpAddress = ipAddress,
                        Reason = $"Auto-banned: Risk score {riskScore}/100",
                        RiskScore = riskScore,
                        IsAutoBanned = true,
                        DetectedAt = DateTime.UtcNow
                    });
                }
            }
            else if (riskScore >= 40)
            {
                if (!recentActivityExists)
                {
                    _context.SuspiciousActivities.Add(new SuspiciousActivity
                    {
                        UserId = userId,
                        IpAddress = ipAddress,
                        Reason = $"Suspicious activity detected: Risk score {riskScore}/100",
                        RiskScore = riskScore,
                        IsAutoBanned = false,
                        DetectedAt = DateTime.UtcNow
                    });
                }
            }

            await _context.SaveChangesAsync();
        }

        public async Task<List<SuspiciousActivity>> GetSuspiciousActivitiesAsync()
        {
            return await _context.SuspiciousActivities
                .AsNoTracking()
                .Include(s => s.User)
                .OrderByDescending(s => s.DetectedAt)
                .Take(100)
                .ToListAsync();
        }

        public async Task<int> GetUserRiskScoreAsync(int userId)
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId);

            return user?.RiskScore ?? 0;
        }

        public async Task ResetRiskScoreAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return;

            user.RiskScore = 0;
            user.IsBlocked = false;

            await _context.SaveChangesAsync();
        }
    }
}