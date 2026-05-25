import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <div style={styles.brand}>
          <span style={styles.brandIcon}>⚡</span>
          <span style={styles.brandName}>RateLimiter Pro</span>
        </div>
        <div style={styles.navLinks}>
          <button
            onClick={() => navigate("/login")}
            style={styles.loginBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            style={styles.registerBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px) scale(1.03)";
              e.currentTarget.style.backgroundColor = "#249c67";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.backgroundColor = "#1F7D53";
            }}
          >
            Get Started Free
          </button>
        </div>
      </nav>
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>🛡️ API Protection Platform</div>
          <h1 style={styles.heroTitle}>
            Protect Your API from{" "}
            <span style={styles.highlight}>Abuse & Overload</span>
          </h1>
          <p style={styles.heroDesc}>
            RateLimiter Pro helps developers and companies protect their APIs
            with per-user rate limiting, real-time monitoring, API key
            management, and abuse detection — all in one platform.
          </p>
          <div style={styles.heroBtns}>
            <button
              onClick={() => navigate("/register")}
              style={styles.primaryBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  "translateY(-3px) scale(1.03)";
                e.currentTarget.style.boxShadow =
                  "0 18px 40px rgba(31,125,83,0.45)";
                e.currentTarget.style.backgroundColor = "#249c67";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 12px 28px rgba(31,125,83,0.35)";
                e.currentTarget.style.backgroundColor = "#1F7D53";
              }}
            >
              Get Your Free API Key →
            </button>
            <button
              onClick={() => navigate("/login")}
              style={styles.secondaryBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.backgroundColor =
                  "rgba(255,255,255,0.16)";
                e.currentTarget.style.border =
                  "1px solid rgba(255,255,255,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.backgroundColor =
                  "rgba(255,255,255,0.08)";
                e.currentTarget.style.border =
                  "1px solid rgba(255,255,255,0.12)";
              }}
            >
              Sign In
            </button>
          </div>
        </div>

        <div style={styles.codeBox}>
          <div style={styles.codeHeader}>
            <span style={styles.codeDot} />
            <span style={styles.codeDot} />
            <span style={styles.codeDot} />
            <span style={styles.codeTitle}>API Request Example</span>
          </div>
          <pre style={styles.code}>{`// Use your API Key in any app
const response = await fetch(
  'https://api.ratelimiter.pro/data',
  {
    headers: {
      'X-API-Key': 'rl_live_xxxxxxxxxxxx'
    }
  }
);

// Rate limit exceeded response
{
  "error": "Rate limit exceeded",
  "remaining": 0,
  "resetInSeconds": 45
}`}</pre>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>How It Works</h2>
        <p style={styles.sectionDesc}>Three simple steps to protect your API</p>
        <div style={styles.stepsGrid}>
          {[
            {
              step: "01",
              icon: "📝",
              title: "Register & Get API Key",
              desc: "Create a free account and generate your first API key in seconds. No credit card required.",
            },
            {
              step: "02",
              icon: "🔌",
              title: "Integrate in Your App",
              desc: "Add your API key to any application — works with any language or framework.",
            },
            {
              step: "03",
              icon: "📊",
              title: "Monitor & Protect",
              desc: "Track usage, set limits, block abusers, and get alerts — all from your dashboard.",
            },
          ].map((item) => (
            <div
              key={item.step}
              style={styles.stepCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow =
                  "0 20px 45px rgba(0,0,0,0.35)";
                e.currentTarget.style.border =
                  "1px solid rgba(74,222,128,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
                e.currentTarget.style.border =
                  "1px solid rgba(255,255,255,0.08)";
              }}
            >
              <div style={styles.stepNumber}>{item.step}</div>
              <div style={styles.stepIcon}>{item.icon}</div>
              <h3 style={styles.stepTitle}>{item.title}</h3>
              <p style={styles.stepDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ ...styles.section, backgroundColor: "#f8fafc" }}>
        <h2 style={styles.sectionTitle}>Everything You Need</h2>
        <div style={styles.featuresGrid}>
          {[
            {
              icon: "⚡",
              title: "Rate Limiting",
              desc: "Per-user request limits with sliding window algorithm. Block abuse automatically.",
            },
            {
              icon: "🔑",
              title: "API Key Management",
              desc: "Create, revoke, and regenerate API keys. Set expiration dates and scopes.",
            },
            {
              icon: "📈",
              title: "Real-time Monitoring",
              desc: "Track requests, response times, and blocked attempts in real-time.",
            },
            {
              icon: "🚫",
              title: "Abuse Protection",
              desc: "Automatic detection of suspicious traffic patterns and IP blocking.",
            },
            {
              icon: "👨‍💼",
              title: "Admin Dashboard",
              desc: "Full control over all users, logs, and rate limits from one panel.",
            },
            {
              icon: "💳",
              title: "Flexible Plans",
              desc: "Start free, upgrade when you need more. Cancel anytime.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              style={styles.featureCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow =
                  "0 20px 45px rgba(0,0,0,0.35)";
                e.currentTarget.style.border =
                  "1px solid rgba(74,222,128,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
                e.currentTarget.style.border =
                  "1px solid rgba(255,255,255,0.08)";
              }}
            >
              <span style={styles.featureIcon}>{feature.icon}</span>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureDesc}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Simple Pricing</h2>
        <p style={styles.sectionDesc}>Start free, scale as you grow</p>
        <div style={styles.pricingGrid}>
          {[
            {
              name: "Free",
              price: "€0",
              requests: "100 req/min",
              color: "#22c55e",
              features: [
                "API Key Management",
                "Request Logging",
                "Basic Dashboard",
              ],
            },
            {
              name: "Pro",
              price: "€29",
              requests: "1,000 req/min",
              color: "#3b82f6",
              features: [
                "Everything in Free",
                "Priority Support",
                "Advanced Analytics",
              ],
              popular: true,
            },
            {
              name: "Enterprise",
              price: "€199",
              requests: "Unlimited",
              color: "#7c3aed",
              features: [
                "Everything in Pro",
                "Custom Rate Limits",
                "Dedicated Support",
              ],
            },
          ].map((plan) => (
            <div
              key={plan.name}
              style={{
                ...styles.pricingCard,
                borderTop: `4px solid ${plan.color}`,
                transform: plan.popular ? "scale(1.05)" : "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow =
                  "0 20px 45px rgba(0,0,0,0.35)";
                e.currentTarget.style.border =
                  "1px solid rgba(74,222,128,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
                e.currentTarget.style.border =
                  "1px solid rgba(255,255,255,0.08)";
              }}
            >
              {plan.popular && (
                <div
                  style={{
                    ...styles.popularBadge,
                    backgroundColor: plan.color,
                  }}
                >
                  Most Popular
                </div>
              )}
              <h3 style={styles.pricingName}>{plan.name}</h3>
              <p style={styles.pricingPrice}>
                {plan.price}
                <span style={styles.pricingPeriod}>/month</span>
              </p>
              <p
                style={{
                  color: plan.color,
                  fontWeight: "600",
                  marginBottom: "16px",
                }}
              >
                {plan.requests}
              </p>
              <ul style={styles.pricingFeatures}>
                {plan.features.map((f) => (
                  <li key={f} style={styles.pricingFeature}>
                    ✓ {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate("/register")}
                style={{ ...styles.pricingBtn, backgroundColor: plan.color }}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to Protect Your API?</h2>
        <p style={styles.ctaDesc}>
          Join developers who trust RateLimiter Pro to keep their APIs safe and
          reliable.
        </p>
        <button onClick={() => navigate("/register")} style={styles.ctaBtn}>
          Get Started for Free →
        </button>
      </section>

      <footer style={styles.footer}>
        <p style={styles.footerText}>
          © 2026 RateLimiter Pro. Built with ASP.NET Core & React.
        </p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#18230F",
    fontFamily: "Inter, system-ui, sans-serif",
  },

  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 48px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    backgroundColor: "#18230F",
    position: "sticky",
    top: 0,
    zIndex: 100,
    backdropFilter: "blur(10px)",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  brandIcon: {
    fontSize: "1.5rem",
  },

  brandName: {
    fontSize: "1.3rem",
    fontWeight: "800",
    color: "#ffffff",
  },

  navLinks: {
    display: "flex",
    gap: "12px",
  },

  loginBtn: {
    padding: "8px 20px",
    backgroundColor: "transparent",
    color: "#ffffff",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },

  registerBtn: {
    padding: "8px 20px",
    backgroundColor: "#1F7D53",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
    boxShadow: "0 8px 24px rgba(31,125,83,0.35)",
  },

  // Hero
  hero: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "48px",
    padding: "80px 48px",
    alignItems: "center",
    background:
      "linear-gradient(135deg, #18230F 0%, #27391C 50%, #255F38 100%)",
  },

  heroContent: {
    maxWidth: "560px",
  },

  heroBadge: {
    display: "inline-block",
    padding: "6px 14px",
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "#d1fae5",
    borderRadius: "999px",
    fontSize: "0.85rem",
    fontWeight: "600",
    marginBottom: "20px",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  heroTitle: {
    fontSize: "clamp(2rem, 4vw, 3rem)",
    fontWeight: "800",
    color: "#ffffff",
    lineHeight: "1.15",
    margin: "0 0 20px",
  },

  highlight: {
    color: "#4ade80",
  },

  heroDesc: {
    fontSize: "1.05rem",
    color: "rgba(255,255,255,0.78)",
    lineHeight: "1.7",
    margin: "0 0 32px",
  },

  heroBtns: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },

  primaryBtn: {
    padding: "14px 28px",
    backgroundColor: "#1F7D53",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 12px 28px rgba(31,125,83,0.35)",
  },

  secondaryBtn: {
    padding: "14px 28px",
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "#ffffff",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  // Code Box
  codeBox: {
    backgroundColor: "#101812",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  codeHeader: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "12px 16px",
    backgroundColor: "#0d1409",
  },

  codeDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    backgroundColor: "#1F7D53",
    display: "inline-block",
  },

  codeTitle: {
    color: "#cbd5e1",
    fontSize: "0.85rem",
    marginLeft: "8px",
  },

  code: {
    margin: 0,
    padding: "24px",
    color: "#86efac",
    fontSize: "0.85rem",
    lineHeight: "1.7",
    overflowX: "auto",
  },

  // Sections
  section: {
    padding: "80px 48px",
    background:
      "linear-gradient(135deg, #1b2912 0%, #223417 50%, #2a4420 100%)",
  },

  sectionTitle: {
    fontSize: "2rem",
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    margin: "0 0 12px",
  },

  sectionDesc: {
    color: "rgba(255,255,255,0.72)",
    textAlign: "center",
    margin: "0 0 48px",
    fontSize: "1.05rem",
  },

  // Steps
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "24px",
  },

  stepCard: {
    padding: "32px",
    background:
      "linear-gradient(145deg, rgba(39,57,28,0.95), rgba(31,125,83,0.22))",
    borderRadius: "18px",
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    backdropFilter: "blur(10px)",
    transition: "all 0.3s ease",
  },

  stepNumber: {
    fontSize: "0.8rem",
    fontWeight: "800",
    color: "#4ade80",
    letterSpacing: "0.1em",
    marginBottom: "12px",
  },

  stepIcon: {
    fontSize: "2.5rem",
    marginBottom: "16px",
  },

  stepTitle: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#ffffff",
    margin: "0 0 8px",
  },

  stepDesc: {
    color: "rgba(255,255,255,0.72)",
    fontSize: "0.9rem",
    lineHeight: "1.6",
    margin: 0,
  },

  // Features
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "24px",
  },

  featureCard: {
    padding: "28px",
    background:
      "linear-gradient(145deg, rgba(39,57,28,0.96), rgba(31,125,83,0.18))",
    borderRadius: "18px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    border: "1px solid rgba(255,255,255,0.08)",
    transition: "all 0.3s ease",
  },

  featureIcon: {
    fontSize: "2rem",
    display: "block",
    marginBottom: "12px",
  },

  featureTitle: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#ffffff",
    margin: "0 0 8px",
  },

  featureDesc: {
    color: "rgba(255,255,255,0.72)",
    fontSize: "0.9rem",
    lineHeight: "1.6",
    margin: 0,
  },

  // Pricing
  pricingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "24px",
    alignItems: "start",
  },

  pricingCard: {
    background:
      "linear-gradient(145deg, rgba(39,57,28,0.96), rgba(31,125,83,0.2))",
    padding: "32px",
    borderRadius: "18px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    position: "relative",
    border: "1px solid rgba(255,255,255,0.08)",
    transition: "all 0.3s ease",
  },

  popularBadge: {
    position: "absolute",
    top: "-12px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "4px 16px",
    borderRadius: "999px",
    color: "white",
    fontSize: "0.8rem",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  pricingName: {
    fontSize: "1.3rem",
    fontWeight: "700",
    color: "#ffffff",
    margin: "0 0 8px",
  },

  pricingPrice: {
    fontSize: "2.5rem",
    fontWeight: "800",
    color: "#ffffff",
    margin: "0 0 4px",
  },

  pricingPeriod: {
    fontSize: "1rem",
    color: "rgba(255,255,255,0.65)",
    fontWeight: "400",
  },

  pricingFeatures: {
    listStyle: "none",
    padding: 0,
    margin: "0 0 24px",
    display: "grid",
    gap: "8px",
  },

  pricingFeature: {
    color: "rgba(255,255,255,0.75)",
    fontSize: "0.9rem",
  },

  pricingBtn: {
    width: "100%",
    padding: "12px",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.25s ease",
  },

  // CTA
  cta: {
    padding: "80px 48px",
    background:
      "linear-gradient(135deg, #18230F 0%, #27391C 50%, #255F38 100%)",
    textAlign: "center",
  },

  ctaTitle: {
    fontSize: "2rem",
    fontWeight: "800",
    color: "white",
    margin: "0 0 16px",
  },

  ctaDesc: {
    color: "rgba(255,255,255,0.72)",
    margin: "0 0 32px",
    fontSize: "1.05rem",
  },

  ctaBtn: {
    padding: "16px 40px",
    backgroundColor: "#1F7D53",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "1.1rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.25s ease",
    boxShadow: "0 12px 28px rgba(31,125,83,0.35)",
  },

  // Footer
  footer: {
    padding: "24px 48px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    textAlign: "center",
    backgroundColor: "#11180d",
  },

  footerText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: "0.9rem",
    margin: 0,
  },
};

export default Landing;
