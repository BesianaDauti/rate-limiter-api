using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RateLimiterApi.DTOs.Common;
using RateLimiterApi.Services;
using System.Security.Claims;
using Stripe;
using Microsoft.EntityFrameworkCore;
using RateLimiterApi.Data;

namespace RateLimiterApi.Controllers
{
    [ApiController]
    [Route("api/payment")]
    public class PaymentController : ControllerBase
    {
        private readonly StripeService _stripeService;
        private readonly AppDbContext _context;

        public PaymentController(StripeService stripeService, AppDbContext context)
        {
            _stripeService = stripeService;
            _context = context;
        }

        [HttpPost("checkout/{planId}")]
        [Authorize]
        public async Task<IActionResult> CreateCheckout(int planId)
        {
            if (planId != 2 && planId != 3)
                return BadRequest(ApiResponseDto<string>.Fail(
                    "Invalid plan. Use 2 for Pro or 3 for Enterprise."));

            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            try
            {
                var url = await _stripeService.CreateCheckoutSessionAsync(userId, planId);
                return Ok(ApiResponseDto<string>.Ok(url, "Checkout session created."));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponseDto<string>.Fail(ex.Message));
            }
        }

        [HttpGet("status")]
        [Authorize]
        public async Task<IActionResult> GetStatus()
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var subscription = await _context.Subscriptions
                .Include(s => s.Plan)
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (subscription == null)
                return Ok(ApiResponseDto<object>.Ok(new
                {
                    status = "none",
                    plan = "Free",
                    endDate = (DateTime?)null,
                    cancelAtPeriodEnd = false
                }));

            return Ok(ApiResponseDto<object>.Ok(new
            {
                status = subscription.Status,
                plan = subscription.Plan?.Name,
                endDate = subscription.EndDate,
                cancelAtPeriodEnd = subscription.Status == "cancel_at_period_end"
            }));
        }

        [HttpPost("cancel")]
        [Authorize]
        public async Task<IActionResult> CancelSubscription()
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var result = await _stripeService.CancelSubscriptionAsync(userId);

            if (!result)
                return NotFound(ApiResponseDto<string>.Fail(
                    "No active subscription found."));

            var subscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.UserId == userId);

            var endDate = subscription?.EndDate?.ToString("MMMM dd, yyyy") ?? "end of billing period";

            return Ok(ApiResponseDto<string>.Ok(
                $"Subscription canceled. You will keep Pro access until {endDate}. After that, you will be moved to the Free plan."));
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> Webhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body)
                .ReadToEndAsync();
            var signature = Request.Headers["Stripe-Signature"].ToString();

            try
            {
                await _stripeService.HandleWebhookAsync(json, signature);
                return Ok();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Webhook error: " + ex.Message);
                return BadRequest();
            }
        }
    }
}