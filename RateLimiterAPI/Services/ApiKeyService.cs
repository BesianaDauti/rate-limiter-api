using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations.Operations;
using RateLimiterApi.Data;
using RateLimiterApi.DTOs.ApiKey;
using RateLimiterApi.Models;

namespace RateLimiterApi.Services
{
    public class ApiKeyService
    {
        private readonly AppDbContext _context;

        public ApiKeyService(AppDbContext context)
        {
            _context = context;
        }

        private static string GenerateKey()
        {
            var prefix = "rl_live_";
            var randomPart = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32))
            .Replace("+", "").Replace("/", "").Replace("=", "")[..32];
            return prefix + randomPart;
        }

        public async Task<ApiKeyResponseDto?> CreateAsync(int userId, CreateApiKeyDto dto)
        {
            var keyCount = await _context.ApiKeys.CountAsync(k => k.UserId == userId && k.IsActive);

            if (keyCount >= 5) return null;

            var apiKey = new ApiKey
            {
                UserId = userId,
                Name = dto.Name,
                Key = GenerateKey(),
                Scopes = dto.Scopes,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = dto.ExpiresAt
            };

            _context.ApiKeys.Add(apiKey);
            await _context.SaveChangesAsync();

            return MapToDto(apiKey);
        }

        public async Task<List<ApiKeyResponseDto>> GetUserKeysAsync(int userId)
        {
            var keys = await _context.ApiKeys.Where(k => k.UserId == userId).OrderByDescending(k => k.CreatedAt).ToListAsync();
            return keys.Select(MapToDto).ToList();
        }

        public async Task<bool> RevokeAsync(int userId, int keyId)
        {
            var key = await _context.ApiKeys.FirstOrDefaultAsync(k => k.Id == keyId && k.UserId == userId);

            if (key == null) return false;

            key.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<ApiKeyResponseDto?> RegenerateAsync(int userId, int keyId)
        {
            var key = await _context.ApiKeys.FirstOrDefaultAsync(k => k.Id == keyId && k.UserId == userId);

            if(key == null) return null;

            key.Key = GenerateKey();
            key.IsActive = true;
            key.LastUsedAt = null;
            key.CreatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return MapToDto(key);
        }

        public async Task<ApiKey?> ValidateKeyAsync(string key)
        {
            var apiKey = await _context.ApiKeys.Include(k => k.User).FirstOrDefaultAsync(k => k.Key == key.Trim() && k.IsActive);

            if (apiKey == null) return null;

            if(apiKey.ExpiresAt.HasValue && apiKey.ExpiresAt.Value < DateTime.UtcNow)
            {
                apiKey.IsActive = false;
                await _context.SaveChangesAsync();
                return null;
            }

            apiKey.LastUsedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return apiKey;
        }

        public async Task<bool> DeleteAsync(int userId, int keyId)
        {
            var key = await _context.ApiKeys.FirstOrDefaultAsync(k => k.Id == keyId && k.UserId == userId);

            if (key == null) return false;

            _context.ApiKeys.Remove(key);
            await _context.SaveChangesAsync();
            return true;
        }

        private static ApiKeyResponseDto MapToDto(ApiKey key)
        {
            return new ApiKeyResponseDto
            {
                Id = key.Id,
                Name = key.Name,
                Key = key.Key,
                Scopes = key.Scopes,
                IsActive = key.IsActive,
                CreatedAt = key.CreatedAt,
                ExpiresAt = key.ExpiresAt,
                LastUsedAt = key.LastUsedAt
            };
        }
    }
}