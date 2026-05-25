namespace RateLimiterApi.Models
{
    public class SuspiciousActivity
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string IpAddress { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public int RiskScore { get; set; } = 0;
        public bool IsAutoBanned { get; set; } = false;
        public DateTime DetectedAt { get; set; } = DateTime.UtcNow;
        public User? User { get; set; }
    }
}