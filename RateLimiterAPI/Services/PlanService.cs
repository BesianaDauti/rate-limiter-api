using Microsoft.EntityFrameworkCore;
using RateLimiterApi.Data;
using RateLimiterApi.DTOs.Plan;

namespace RateLimiterApi.Services
{
    public class PlanService
    {
        private readonly AppDbContext _context;

        public PlanService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<PlanResponseDto>> GetAllPlansAsync()
        {
            var plans = await _context.Plans.Where(p => p.IsActive).OrderBy(p => p.Price).ToListAsync();

            return plans.Select(p => new PlanResponseDto
            {
                Id = p.Id,
                Name = p.Name,
                RequestsPerMinute = p.RequestsPerMinute,
                Description = p.Description,
                Price = p.Price
            }).ToList();
        }

        public async Task<PlanResponseDto?> GetUserPlanAsync(int userId)
        {
            var user = await _context.Users.Include(u => u.Plan).FirstOrDefaultAsync(u => u.Id == userId);

            if (user?.Plan == null) return null;

            return new PlanResponseDto
            {
                Id = user.Plan.Id,
                Name = user.Plan.Name,
                RequestsPerMinute = user.Plan.RequestsPerMinute,
                Description = user.Plan.Description,
                Price = user.Plan.Price 
            };
        }

        public async Task<bool> UpdateUserPlanAsync(int userId, int planId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            var plan = await _context.Plans.FindAsync(planId);
            if (plan == null) return false;

            user.PlanId = planId;
            user.RateLimit = plan.RequestsPerMinute;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}