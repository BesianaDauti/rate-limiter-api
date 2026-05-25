import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";

function Plans() {
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingPlanId, setLoadingPlanId] = useState(null);

  const fetchPlans = useCallback(async () => {
    try {
      const response = await api.get("/plans");
      setPlans(response.data.data);
    } catch {
      setError("Failed to fetch plans.");
    }
  }, []);

  const fetchCurrentPlan = useCallback(async () => {
    try {
      const response = await api.get("/plans/my-plan");
      setCurrentPlan(response.data.data);
    } catch {
      setError("Failed to fetch current plan.");
    }
  }, []);

  useEffect(() => {
    fetchPlans();
    fetchCurrentPlan();
  }, [fetchPlans, fetchCurrentPlan]);

  const handleUpgrade = async (planId, planName) => {
    setLoadingPlanId(planId);
    setError("");
    setSuccess("");
    try {
      const response = await api.post(`/payment/checkout/${planId}`);
      const checkoutUrl = response.data.data;
      window.location.href = checkoutUrl;
    } catch {
      setError(`Failed to create checkout session for ${planName} plan.`);
      setLoadingPlanId(null);
    }
  };

  const handleDowngrade = async () => {
    if (
      !window.confirm(
        "Your Pro access will continue until the end of the billing period.",
      )
    )
      return;

    setError("");
    setSuccess("");
    try {
      await api.post("/payment/cancel");
      setSuccess(
        "Subscription canceled. You will have Pro access until the end of your billing period.",
      );
      await fetchCurrentPlan();
    } catch {
      setError("Failed to cancel subscription.");
    }
  };

  const getPlanColor = (name) => {
    switch (name) {
      case "Free":
        return { border: "#22c55e", badge: "#dcfce7", badgeText: "#166534" };
      case "Pro":
        return { border: "#3b82f6", badge: "#dbeafe", badgeText: "#1d4ed8" };
      case "Enterprise":
        return { border: "#7c3aed", badge: "#ede9fe", badgeText: "#5b21b6" };
      default:
        return { border: "#94a3b8", badge: "#f1f5f9", badgeText: "#475569" };
    }
  };

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        <h2 style={styles.title}>Subscription Plans</h2>
        <p style={styles.subtitle}>Choose the plan that fits your needs.</p>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        {currentPlan && (
          <div style={styles.currentPlanBox}>
            <div>
              <span style={styles.currentPlanLabel}>Your Current Plan</span>
              <h3 style={styles.currentPlanName}>{currentPlan.name}</h3>
            </div>
            <div>
              <p style={styles.currentPlanDesc}>
                {currentPlan.requestsPerMinute >= 999999
                  ? "Unlimited"
                  : currentPlan.requestsPerMinute.toLocaleString()}{" "}
                requests/minute
              </p>
            </div>
            {currentPlan.name !== "Free" && (
              <button
                onClick={handleDowngrade}
                style={styles.cancelBtn}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.filter = "brightness(1.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.filter = "brightness(1)";
                }}
              >
                Cancel Subscription
              </button>
            )}
          </div>
        )}

        <div style={styles.grid}>
          {plans.map((plan) => {
            const colors = getPlanColor(plan.name);
            const isCurrent = currentPlan?.id === plan.id;
            const isLoading = loadingPlanId === plan.id;

            return (
              <div
                key={plan.id}
                style={{
                  ...styles.planCard,
                  borderTop: `4px solid ${colors.border}`,
                  boxShadow: isCurrent
                    ? `0 0 0 2px ${colors.border}`
                    : "0 2px 8px rgba(0,0,0,0.08)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-10px)";
                  e.currentTarget.style.boxShadow =
                    "0 28px 65px rgba(0,0,0,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = isCurrent
                    ? `0 0 0 2px ${colors.border}`
                    : "0 18px 45px rgba(0,0,0,0.22)";
                }}
              >
                {isCurrent && (
                  <div
                    style={{
                      ...styles.currentBadge,
                      backgroundColor: colors.badge,
                      color: colors.badgeText,
                    }}
                  >
                    ✓ Current Plan
                  </div>
                )}

                <h3 style={styles.planName}>{plan.name}</h3>
                <p style={styles.planPrice}>
                  {plan.price === 0 ? (
                    <span style={styles.free}>Free</span>
                  ) : (
                    <>
                      <span style={styles.price}>€{plan.price}</span>
                      <span style={styles.period}>/month</span>
                    </>
                  )}
                </p>

                <p style={styles.planDesc}>{plan.description}</p>

                <div style={styles.planFeatures}>
                  <div style={styles.feature}>
                    <span style={styles.featureIcon}>✓</span>
                    <span>
                      {plan.requestsPerMinute >= 999999
                        ? "Unlimited"
                        : plan.requestsPerMinute.toLocaleString()}{" "}
                      requests/minute
                    </span>
                  </div>
                  <div style={styles.feature}>
                    <span style={styles.featureIcon}>✓</span>
                    <span>API Key Management</span>
                  </div>
                  <div style={styles.feature}>
                    <span style={styles.featureIcon}>✓</span>
                    <span>Request Logging</span>
                  </div>
                  {plan.name !== "Free" && (
                    <div style={styles.feature}>
                      <span style={styles.featureIcon}>✓</span>
                      <span>Priority Support</span>
                    </div>
                  )}
                  {plan.name === "Enterprise" && (
                    <div style={styles.feature}>
                      <span style={styles.featureIcon}>✓</span>
                      <span>Custom Rate Limits</span>
                    </div>
                  )}
                </div>

                {isCurrent ? (
                  <button style={styles.currentBtn} disabled>
                    Current Plan
                  </button>
                ) : (
                  <button
                    style={{
                      ...styles.selectBtn,
                      backgroundColor: isLoading ? "#94a3b8" : colors.border,
                    }}
                    onClick={() => handleUpgrade(plan.id, plan.name)}
                    disabled={isLoading}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.filter = "brightness(1.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.filter = "brightness(1)";
                    }}
                  >
                    {isLoading
                      ? "Redirecting..."
                      : plan.price === 0
                        ? "Downgrade to Free"
                        : `Upgrade to ${plan.name}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: `
      radial-gradient(circle at top left, rgba(31,125,83,0.18), transparent 25%),
      radial-gradient(circle at bottom right, rgba(39,57,28,0.22), transparent 30%),
      linear-gradient(135deg, #18230F 0%, #27391C 45%, #255F38 100%)
    `,
    paddingBottom: "40px",
  },

  content: {
    padding: "42px 32px",
    maxWidth: "1180px",
    margin: "0 auto",
  },

  title: {
    fontSize: "2.4rem",
    color: "#ffffff",
    margin: "0 0 10px",
    fontWeight: "800",
    letterSpacing: "-1px",
  },

  subtitle: {
    color: "rgba(255,255,255,0.72)",
    margin: "0 0 34px",
    fontSize: "1rem",
    lineHeight: "1.7",
  },

  error: {
    padding: "16px 18px",
    backgroundColor: "rgba(254,226,226,0.95)",
    color: "#b91c1c",
    borderRadius: "16px",
    marginBottom: "18px",
    border: "1px solid #fecaca",
    fontWeight: "600",
    backdropFilter: "blur(12px)",
  },

  success: {
    padding: "16px 18px",
    backgroundColor: "rgba(220,252,231,0.95)",
    color: "#166534",
    borderRadius: "16px",
    marginBottom: "18px",
    border: "1px solid #86efac",
    fontWeight: "600",
    backdropFilter: "blur(12px)",
  },

  currentPlanBox: {
    padding: "28px 30px",
    background: "rgba(24,35,15,0.35)",
    backdropFilter: "blur(18px)",
    borderRadius: "28px",
    marginBottom: "36px",
    display: "flex",
    alignItems: "center",
    gap: "22px",
    flexWrap: "wrap",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
  },

  currentPlanLabel: {
    fontSize: "0.82rem",
    color: "#4ade80",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    display: "block",
    marginBottom: "6px",
    fontWeight: "700",
  },

  currentPlanName: {
    margin: "0",
    fontSize: "2rem",
    fontWeight: "800",
    color: "#ffffff",
  },

  currentPlanDesc: {
    margin: "0",
    color: "rgba(255,255,255,0.7)",
    fontSize: "0.96rem",
    lineHeight: "1.6",
  },

  cancelBtn: {
    marginLeft: "auto",
    padding: "12px 20px",
    background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
    color: "white",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "0.9rem",
    transition: "all 0.3s ease",
    boxShadow: "0 12px 28px rgba(220,38,38,0.35)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "28px",
  },

  planCard: {
    background: "rgba(24,35,15,0.28)",
    backdropFilter: "blur(18px)",
    padding: "34px 30px",
    borderRadius: "30px",
    position: "relative",
    transition: "all 0.35s ease",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 18px 45px rgba(0,0,0,0.22)",
    overflow: "hidden",
  },

  currentBadge: {
    display: "inline-block",
    padding: "6px 14px",
    borderRadius: "999px",
    fontSize: "0.8rem",
    fontWeight: "700",
    marginBottom: "16px",
  },

  planName: {
    margin: "0 0 10px",
    fontSize: "1.7rem",
    color: "#ffffff",
    fontWeight: "800",
  },

  planPrice: {
    margin: "0 0 18px",
  },

  free: {
    fontSize: "2.5rem",
    fontWeight: "800",
    color: "#4ade80",
  },

  price: {
    fontSize: "2.5rem",
    fontWeight: "800",
    color: "#ffffff",
  },

  period: {
    fontSize: "1rem",
    color: "rgba(255,255,255,0.65)",
    marginLeft: "4px",
  },

  planDesc: {
    color: "rgba(255,255,255,0.72)",
    fontSize: "0.95rem",
    margin: "0 0 24px",
    lineHeight: "1.8",
  },

  planFeatures: {
    display: "grid",
    gap: "14px",
    marginBottom: "28px",
  },

  feature: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "0.95rem",
    color: "#f8fafc",
    background: "rgba(255,255,255,0.05)",
    padding: "12px 14px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.04)",
  },

  featureIcon: {
    color: "#4ade80",
    fontWeight: "800",
    fontSize: "1rem",
  },

  currentBtn: {
    width: "100%",
    padding: "15px",
    background: "rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.5)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    fontSize: "0.96rem",
    fontWeight: "700",
    cursor: "not-allowed",
  },

  selectBtn: {
    width: "100%",
    padding: "15px",
    color: "white",
    border: "none",
    borderRadius: "16px",
    fontSize: "0.96rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 15px 35px rgba(0,0,0,0.25)",
    letterSpacing: "0.3px",
  },
};

export default Plans;
