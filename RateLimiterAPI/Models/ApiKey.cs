using RateLimiterApi.Models;

namespace RateLimiterApi.Models
{
    public class ApiKey
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Key { get; set; } = string.Empty;
        public string Scopes { get; set; } = "read";
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ExpiresAt { get; set; } = null;
        public DateTime? LastUsedAt { get; set; } = null;
        public User? User { get; set; }
    }
}