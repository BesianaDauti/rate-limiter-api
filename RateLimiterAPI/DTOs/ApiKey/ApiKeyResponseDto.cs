namespace RateLimiterApi.DTOs.ApiKey
{
    public class ApiKeyResponseDto
    {
        public int Id {get; set; }
        public string Name { get; set; } = string.Empty;
        public string Key {get; set; } = string.Empty;
        public string Scopes { get; set; } = string.Empty;
        public bool IsActive {get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public DateTime? LastUsedAt { get; set; }
    }
}