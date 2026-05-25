namespace RateLimiterApi.Models
{
    public class User
    {
        public int Id { get; set; }
        public string FullName {get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "User";
        public int RateLimit { get; set; } = 100;
        public bool IsBlocked { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int PlanId { get; set; } = 1;
        public ICollection<ApiKey> ApiKeys { get; set; } = new List<ApiKey>();
        public Plan? Plan { get; set; }      

        public string? StripeCustomerId { get; set; }
        public Subscription? Subscription { get; set; }
        public int FailedLoginAttempts { get; set; } = 0;
        public DateTime? LockedUntil { get; set; } = null;
        public int RiskScore { get; set; } = 0;
        public ICollection<SuspiciousActivity> SuspiciousActivities { get; set; } 
            = new List<SuspiciousActivity>();
    }
}