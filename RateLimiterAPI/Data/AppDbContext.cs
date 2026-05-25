using Microsoft.EntityFrameworkCore;
using RateLimiterApi.Models;

namespace RateLimiterApi.Data
{
    public class AppDbContext: DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
            
        }
        public DbSet<User>Users {get; set;}
        public DbSet<RequestLog> RequestLogs { get; set; }
        public DbSet<ApiKey> ApiKeys { get; set; }
        public DbSet<Plan> Plans { get; set; }
        public DbSet<Subscription> Subscriptions { get; set; }
        public DbSet<SuspiciousActivity> SuspiciousActivities { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);
                entity.HasIndex(u => u.Email).IsUnique();
                entity.Property(u => u.FullName).IsRequired().HasMaxLength(100);
                entity.Property(u => u.Email).IsRequired().HasMaxLength(100);
                entity.Property(u => u.PasswordHash).IsRequired();
                entity.Property(u => u.Role).HasDefaultValue("User");
                entity.Property(u => u.RateLimit).HasDefaultValue(100);
                entity.Property(u => u.IsBlocked).HasDefaultValue(false);
            });

            modelBuilder.Entity<RequestLog>(entity =>
            {
                entity.HasKey(r => r.Id);
                entity.Property(r => r.Endpoint).IsRequired().HasMaxLength(200);
                entity.Property(r => r.Method).IsRequired().HasMaxLength(10);
                entity.HasOne(r => r.User).WithMany().HasForeignKey(r => r.UserId).OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ApiKey>(entity =>
            {
                entity.HasKey(a => a.Id);
                entity.HasIndex(a => a.Key).IsUnique();
                entity.Property(a => a.Name).IsRequired().HasMaxLength(100);
                entity.Property(a => a.Key).IsRequired().HasMaxLength(64);
                entity.Property(a => a.Scopes).HasDefaultValue("read");
                entity.Property(a => a.IsActive).HasDefaultValue(true);
                entity.HasOne(a => a.User)
                      .WithMany(u => u.ApiKeys)
                      .HasForeignKey(a => a.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Plan>(entity =>
            {
                entity.HasKey(p => p.Id);
                entity.Property(p => p.Name).IsRequired().HasMaxLength(50);
                entity.Property(p => p.Price).HasColumnType("decimal(10,2)");
                entity.HasMany(p => p.Users)
                    .WithOne(u => u.Plan)
                    .HasForeignKey(u => u.PlanId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Plan>().HasData(
                new Plan
                {
                    Id = 1,
                    Name = "Free",
                    RequestsPerMinute = 100,
                    Description = "Perfect for small projects and testing.",
                    Price = 0,
                    IsActive = true
                },
                new Plan
                {
                    Id = 2,
                    Name = "Pro",
                    RequestsPerMinute = 1000,
                    Description = "For growing applications and teams.",
                    Price = 29,
                    IsActive = true
                },
                new Plan
                {
                    Id = 3,
                    Name = "Enterprise",
                    RequestsPerMinute = 999999,
                    Description = "Unlimited access for large scale applications.",
                    Price = 199,
                    IsActive = true
                }
            );

            modelBuilder.Entity<Subscription>(entity =>
            {
                entity.HasKey(s => s.Id);
                entity.Property(s => s.StripeCustomerId).IsRequired().HasMaxLength(100);
                entity.Property(s => s.StripeSubscriptionId).IsRequired().HasMaxLength(100);
                entity.Property(s => s.Status).HasDefaultValue("active");
                entity.HasOne(s => s.User)
                    .WithOne(u => u.Subscription)
                    .HasForeignKey<Subscription>(s => s.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(s => s.Plan)
                    .WithMany()
                    .HasForeignKey(s => s.PlanId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<SuspiciousActivity>(entity =>
            {
                entity.HasKey(s => s.Id);
                entity.Property(s => s.IpAddress).IsRequired().HasMaxLength(50);
                entity.Property(s => s.Reason).IsRequired().HasMaxLength(200);
                entity.HasOne(s => s.User)
                    .WithMany(u => u.SuspiciousActivities)
                    .HasForeignKey(s => s.UserId)
                    .OnDelete(DeleteBehavior.SetNull)
                    .IsRequired(false);
            });
        }
    }
}