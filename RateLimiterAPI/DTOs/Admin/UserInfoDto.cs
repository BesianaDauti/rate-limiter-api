namespace RateLimiterApi.DTOs.Admin
{
    public class UserInfoDto
    {
        public int Id {get; set;}
        public string FullName {get; set;} = string.Empty;
        public string Email {get; set; } = string.Empty;
        public string Role {get; set;} = string.Empty;
        public int RateLimit {get; set;}
        public bool IsBlocked {get; set;}
        public DateTime CreatedAt {get; set;}
    }
}