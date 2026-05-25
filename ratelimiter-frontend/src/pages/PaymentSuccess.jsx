import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function PaymentSuccess() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate("/dashboard");
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div style={styles.container}>
      <div
        style={styles.card}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-10px)";
          e.currentTarget.style.boxShadow = "0 35px 90px rgba(0,0,0,0.45)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 25px 70px rgba(0,0,0,0.35)";
        }}
      >
        <div style={styles.icon}>✅</div>
        <h2 style={styles.title}>Payment Successful!</h2>
        <p style={styles.desc}>
          Your subscription has been activated. Your new rate limits are now
          active.
        </p>
        <p style={styles.countdown}>
          Redirecting to dashboard in <strong>{countdown}</strong> seconds...
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          style={styles.button}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
            e.currentTarget.style.boxShadow =
              "0 22px 45px rgba(31,125,83,0.45)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.boxShadow =
              "0 15px 35px rgba(31,125,83,0.35)";
          }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px",
    background: `
      radial-gradient(circle at top left, rgba(31,125,83,0.22), transparent 25%),
      radial-gradient(circle at bottom right, rgba(39,57,28,0.28), transparent 30%),
      linear-gradient(135deg, #18230F 0%, #27391C 45%, #255F38 100%)
    `,
    fontFamily: "'Inter', sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "560px",
    padding: "60px 55px",
    borderRadius: "32px",
    textAlign: "center",
    background: "rgba(24,35,15,0.22)",
    backdropFilter: "blur(22px)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 25px 70px rgba(0,0,0,0.35)",
    transition: "all 0.35s ease",
  },

  icon: {
    fontSize: "5rem",
    marginBottom: "20px",
    filter: "drop-shadow(0 10px 25px rgba(74,222,128,0.35))",
  },

  title: {
    fontSize: "2.4rem",
    color: "#ffffff",
    margin: "0 0 16px",
    fontWeight: "800",
    letterSpacing: "-1px",
  },

  desc: {
    color: "rgba(255,255,255,0.72)",
    margin: "0 0 20px",
    lineHeight: "1.8",
    fontSize: "1rem",
  },

  countdown: {
    color: "#4ade80",
    margin: "0 0 30px",
    fontSize: "0.96rem",
    background: "rgba(255,255,255,0.05)",
    padding: "14px 18px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.05)",
  },

  button: {
    padding: "16px 34px",
    background: "linear-gradient(135deg, #1F7D53 0%, #255F38 100%)",
    color: "white",
    border: "none",
    borderRadius: "16px",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 15px 35px rgba(31,125,83,0.35)",
    letterSpacing: "0.3px",
  },
};

export default PaymentSuccess;
