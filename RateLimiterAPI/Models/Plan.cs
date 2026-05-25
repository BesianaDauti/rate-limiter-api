namespace RateLimiterApi.Models
{
    public class Plan
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int RequestsPerMinute { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public bool IsActive { get; set;} = true;

        public ICollection<User> Users { get; set; } = new List<User>();
    }
}