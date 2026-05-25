using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using RateLimiterApi.Data;
using RateLimiterApi.Middleware;
using RateLimiterApi.Services;
using Microsoft.OpenApi.Models;
using RateLimiterApi.Models;
using RateLimiterApi.Hubs;
using RateLimiterApi.Infrastructure.SignalR;
using Microsoft.AspNetCore.SignalR;

Env.Load();

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        Environment.GetEnvironmentVariable("DB_CONNECTION"),
        sqlOptions => sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null
        )
    ));

builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<RateLimitService>();
builder.Services.AddScoped<ApiKeyService>();
builder.Services.AddScoped<PlanService>();
builder.Services.AddScoped<StripeService>();
builder.Services.AddScoped<AbuseDetectionService>();
builder.Services.AddSingleton<IUserIdProvider, CustomUserIdProvider>();
builder.Services.AddSignalR();

var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY")
    ?? throw new Exception("JWT_KEY is missing");
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER")
    ?? throw new Exception("JWT_ISSUER is missing");
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE")
    ?? throw new Exception("JWT_AUDIENCE is missing");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",
            "http://ratelimiter-frontend-012619468189-eu-north-1-an.s3-website.eu-north-1.amazonaws.com"
        )
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "RateLimiter API",
        Version = "v1"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter: Bearer {token}"
    });

    options.AddSecurityDefinition("ApiKey", new OpenApiSecurityScheme
    {
        Name = "X-API-Key",
        Type = SecuritySchemeType.ApiKey,
        In = ParameterLocation.Header,
        Description = "Enter your API Key"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        },
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "ApiKey"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();
app.MapHub<DashboardHub>("/hubs/dashboard");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    if (!db.Users.Any(u => u.Email == "admin@ratelimiter.com"))
    {
        db.Users.Add(new User
        {
            FullName = "Admin",
            Email = "admin@ratelimiter.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            Role = "Admin",
            RateLimit = 1000,
            IsBlocked = false,
            CreatedAt = DateTime.UtcNow
        });
        db.SaveChanges();
    }
}

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "RateLimiter API v1");
    options.RoutePrefix = "swagger";
});

app.UseCors("AllowReact");
app.UseAuthentication();
app.UseMiddleware<RateLimitMiddleware>();
app.UseAuthorization();
app.MapControllers();

app.Run();