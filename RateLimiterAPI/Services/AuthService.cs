using System.Formats.Asn1;
using Microsoft.EntityFrameworkCore;
using RateLimiterApi.Data;
using RateLimiterApi.DTOs.Auth;
using RateLimiterApi.Models;

namespace RateLimiterApi.Services
{
    public class AuthService
    {
        private readonly AppDbContext _context;
        private readonly TokenService _tokenService;

        public AuthService(AppDbContext context, TokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        public async Task<AuthResponseDto?> RegisterAsync(RegisterDto dto)
        {
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (existingUser != null) return null;

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = "User",
                RateLimit = 100,
                IsBlocked = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = _tokenService.GenerateToken(user);

            return new AuthResponseDto
            {
                Token = token,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role
            };
        }

        public async Task<(AuthResponseDto? result, string? error)> LoginAsync(LoginDto dto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (user == null)
                return (null, "Invalid email or password.");

            if (user.LockedUntil.HasValue && user.LockedUntil.Value > DateTime.UtcNow)
            {
                var minutesLeft = (int)Math.Ceiling(
                    (user.LockedUntil.Value - DateTime.UtcNow).TotalMinutes
                );
                return (null, $"Account locked. Try again in {minutesLeft} minute(s).");
            }

            if (user.IsBlocked)
                return (null, "Your account has been blocked. Contact support.");

            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                user.FailedLoginAttempts++;

                if (user.FailedLoginAttempts >= 5)
                {
                    user.LockedUntil = DateTime.UtcNow.AddMinutes(2);
                    user.FailedLoginAttempts = 0;
                    await _context.SaveChangesAsync();
                    return (null, "Too many failed attempts. Account locked for 2 minutes.");
                }

                var attemptsLeft = 5 - user.FailedLoginAttempts;
                await _context.SaveChangesAsync();
                return (null, $"Invalid email or password. {attemptsLeft} attempt(s) remaining before lockout.");
            }

            user.FailedLoginAttempts = 0;
            user.LockedUntil = null;
            await _context.SaveChangesAsync();

            var token = _tokenService.GenerateToken(user);

            return (new AuthResponseDto
            {
                Id = user.Id,
                Token = token,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role
            }, null);
        }
    }
}