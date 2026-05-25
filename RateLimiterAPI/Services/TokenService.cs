using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Microsoft.IdentityModel.Tokens;
using RateLimiterApi.Models;

namespace RateLimiterApi.Services
{
    public class TokenService
    {
        private readonly string _key;
        private readonly string _issuer;
        private readonly string _audience;
        private readonly int _expiryHours;

        public TokenService()
        {
            _key = Environment.GetEnvironmentVariable("JWT_KEY") ?? throw new Exception("JWT_KEY is missing");
            _issuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? throw new Exception("JWT_ISSUER is missing");
            _audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? throw new Exception("JWT_AUDIENCE is missing");
            _expiryHours = int.Parse(Environment.GetEnvironmentVariable("JWT_EXPIRY_HOURS") ?? "24");
        }

        public string GenerateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_key));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _issuer,
                audience: _audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(_expiryHours),
                signingCredentials: creds
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public ClaimsPrincipal? ValidateToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_key);

            try
            {
                var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                   ValidateIssuerSigningKey = true,
                   IssuerSigningKey = new SymmetricSecurityKey(key),
                   ValidateIssuer = true,
                   ValidIssuer = _issuer,
                   ValidateAudience = true,
                   ValidAudience = _audience,
                   ValidateLifetime = true,
                   ClockSkew = TimeSpan.Zero 
                }, out _);
                return principal;
            }
            catch
            {
                return null;
            }
        }
    }
}