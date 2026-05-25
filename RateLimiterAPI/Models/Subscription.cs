namespace RateLimiterApi.Models
{
    public class Subscription
    {
        public int Id {get; set;}
        public int UserId { get; set; }
        public int PlanId { get; set; }
        public string StripeCustomerId { get; set; } = string.Empty;
        public string StripeSubscriptionId { get; set; } = string.Empty;
        public string Status { get; set; } = "active";
        public DateTime StartDate {get; set;} = DateTime.UtcNow;
        public DateTime? EndDate { get; set; }

        public User? User { get; set; }
        public Plan? Plan { get; set; }
    }
}