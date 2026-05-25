using Stripe;
using Stripe.Checkout;
using RateLimiterApi.Data;
using Microsoft.EntityFrameworkCore;

namespace RateLimiterApi.Services
{
    public static class StripeSubscriptionExtensions
    {
        public static DateTime GetPeriodEnd(this Stripe.Subscription sub)
        {
            try
            {
                var item = sub.Items?.Data?.FirstOrDefault();
                if (item != null)
                {
                    if (sub.StripeResponse?.Content != null)
                    {
                        var json = System.Text.Json.JsonDocument
                            .Parse(sub.StripeResponse.Content);
                        if (json.RootElement.TryGetProperty(
                            "current_period_end", out var prop))
                        {
                            var unixTime = prop.GetInt64();
                            return DateTimeOffset
                                .FromUnixTimeSeconds(unixTime)
                                .UtcDateTime;
                        }
                    }
                }
            }
            catch { }

            return DateTime.UtcNow.AddMonths(1);
        }
    }
    public class StripeService
    {
        private readonly AppDbContext _context;
        private readonly string _proPriceId;
        private readonly string _enterprisePriceId;

        public StripeService(AppDbContext context)
        {
            _context = context;
            StripeConfiguration.ApiKey = Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY")
                ?? throw new Exception("STRIPE_SECRET_KEY is missing");
            _proPriceId = Environment.GetEnvironmentVariable("STRIPE_PRO_PRICE_ID")
                ?? throw new Exception("STRIPE_PRO_PRICE_ID is missing");
            _enterprisePriceId = Environment.GetEnvironmentVariable("STRIPE_ENTERPRISE_PRICE_ID")
                ?? throw new Exception("STRIPE_ENTERPRISE_PRICE_ID is missing");
        }

        public async Task<string> CreateCheckoutSessionAsync(int userId, int planId)
        {
            var user = await _context.Users.FindAsync(userId)
                ?? throw new Exception("User not found.");

            var customerId = user.StripeCustomerId;
            if (string.IsNullOrEmpty(customerId))
            {
                var customerService = new CustomerService();
                var customer = await customerService.CreateAsync(new CustomerCreateOptions
                {
                    Email = user.Email,
                    Name = user.FullName
                });
                customerId = customer.Id;
                user.StripeCustomerId = customerId;
                await _context.SaveChangesAsync();
            }

            var priceId = planId == 2 ? _proPriceId : _enterprisePriceId;

            var options = new SessionCreateOptions
            {
                Customer = customerId,
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        Price = priceId,
                        Quantity = 1
                    }
                },
                Mode = "subscription",
                SuccessUrl = "http://ratelimiter-frontend-012619468189-eu-north-1-an.s3-website.eu-north-1.amazonaws.com/payment/success?session_id={CHECKOUT_SESSION_ID}",
                CancelUrl = "http://ratelimiter-frontend-012619468189-eu-north-1-an.s3-website.eu-north-1.amazonaws.com/plans",
                Metadata = new Dictionary<string, string>
                {
                    { "userId", userId.ToString() },
                    { "planId", planId.ToString() }
                }
            };

            var sessionService = new SessionService();
            var session = await sessionService.CreateAsync(options);
            return session.Url;
        }

        public async Task<string> GetSubscriptionStatusAsync(int userId)
        {
            var subscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.UserId == userId);
            return subscription?.Status ?? "none";
        }

        public async Task<bool> CancelSubscriptionAsync(int userId)
        {
            var subscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.UserId == userId
                    && (s.Status == "active" || s.Status == "cancel_at_period_end"));

            if (subscription == null) return false;

            if (subscription.Status == "cancel_at_period_end") return true;

            var subscriptionService = new SubscriptionService();

            await subscriptionService.UpdateAsync(
                subscription.StripeSubscriptionId,
                new SubscriptionUpdateOptions
                {
                    CancelAtPeriodEnd = true
                }
            );

            var stripeSub = await subscriptionService
                .GetAsync(subscription.StripeSubscriptionId);

            subscription.Status = "cancel_at_period_end";
            subscription.EndDate = stripeSub.GetPeriodEnd();

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task HandleWebhookAsync(string json, string stripeSignature)
        {
            var webhookSecret = Environment.GetEnvironmentVariable("STRIPE_WEBHOOK_SECRET")
                ?? throw new Exception("STRIPE_WEBHOOK_SECRET is missing");

            var stripeEvent = EventUtility.ConstructEvent(
                json,
                stripeSignature,
                webhookSecret,
                throwOnApiVersionMismatch: false
            );

            switch (stripeEvent.Type)
            {
                case "checkout.session.completed":
                    var session = stripeEvent.Data.Object as Stripe.Checkout.Session;
                    if (session != null)
                        await HandleCheckoutCompletedAsync(session);
                    break;

                case "customer.subscription.deleted":
                    var deletedSub = stripeEvent.Data.Object as Stripe.Subscription;
                    if (deletedSub != null)
                        await HandleSubscriptionDeletedAsync(deletedSub);
                    break;

                case "customer.subscription.updated":
                    var updatedSub = stripeEvent.Data.Object as Stripe.Subscription;
                    if (updatedSub != null)
                        await HandleSubscriptionUpdatedAsync(updatedSub);
                    break;
            }
        }

        public async Task HandleCheckoutCompletedAsync(Stripe.Checkout.Session session)
        {
            var userId = int.Parse(session.Metadata["userId"]);
            var planId = int.Parse(session.Metadata["planId"]);

            var plan = await _context.Plans.FindAsync(planId);
            if (plan == null) return;

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return;

            user.PlanId = planId;
            user.RateLimit = plan.RequestsPerMinute;

            var existing = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (existing != null)
            {
                existing.PlanId = planId;
                existing.StripeSubscriptionId = session.SubscriptionId ?? string.Empty;
                existing.Status = "active";
                existing.StartDate = DateTime.UtcNow;
                existing.EndDate = null;
            }
            else
            {
                _context.Subscriptions.Add(new Models.Subscription
                {
                    UserId = userId,
                    PlanId = planId,
                    StripeCustomerId = session.CustomerId ?? string.Empty,
                    StripeSubscriptionId = session.SubscriptionId ?? string.Empty,
                    Status = "active",
                    StartDate = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();
        }

        private async Task HandleSubscriptionUpdatedAsync(
            Stripe.Subscription stripeSub)
        {
            var subscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => 
                    s.StripeSubscriptionId == stripeSub.Id);

            if (subscription == null) return;

            if (stripeSub.CancelAtPeriodEnd)
            {
                subscription.Status = "cancel_at_period_end";
                subscription.EndDate = stripeSub.GetPeriodEnd();
            }

            await _context.SaveChangesAsync();
        }

        private async Task HandleSubscriptionDeletedAsync(Stripe.Subscription stripeSub)
        {
            var subscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.StripeSubscriptionId == stripeSub.Id);

            if (subscription == null) return;

            subscription.Status = "canceled";
            subscription.EndDate = DateTime.UtcNow;

            var user = await _context.Users.FindAsync(subscription.UserId);
            if (user != null)
            {
                user.PlanId = 1;
                user.RateLimit = 100;
            }

            await _context.SaveChangesAsync();
        }
    }
}