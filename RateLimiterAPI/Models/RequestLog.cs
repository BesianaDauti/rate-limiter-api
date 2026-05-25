using System.Runtime.CompilerServices;

namespace RateLimiterApi.Models
{
    public class RequestLog
    {
        public int Id { get; set; }
        public int UserId {get; set; }
        public string Endpoint {get; set; } = string.Empty;
        public string Method { get; set; } = string.Empty;
        public int StatusCode {get; set;}
        public DateTime Timestamp {get; set;} = DateTime.UtcNow;
        public User? User { get; set; }
        public string IpAddress { get; set; } = string.Empty;
    }
}