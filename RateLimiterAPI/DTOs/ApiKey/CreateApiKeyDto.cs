namespace RateLimiterApi.DTOs.ApiKey
{
    public class CreateApiKeyDto
    {
        public string Name { get; set; } = string.Empty;
        public string Scopes { get; set; } = "read";
        public DateTime? ExpiresAt { get; set; } = null;
    }
}