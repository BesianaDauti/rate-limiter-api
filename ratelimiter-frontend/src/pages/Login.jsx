import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const cardRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", formData);
      const { token, fullName, role } = response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("fullName", fullName);
      // localStorage.setItem("userId", id);

      if (role === "Admin") {
        navigate("/admin/users");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const message = err.response?.data?.message;
      setError(message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleMouseEnter = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = "translateY(-8px)";
      cardRef.current.style.boxShadow = "0 30px 80px rgba(0,0,0,0.35)";
    }
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = "translateY(0)";
      cardRef.current.style.boxShadow = "0 20px 60px rgba(0,0,0,0.25)";
    }
  };

  return (
    <div style={styles.container}>
      <div
        ref={cardRef}
        style={styles.card}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <h2 style={styles.title}>Login</h2>
        <p style={styles.subtitle}>RateLimiter API</p>

        {error && (
          <div style={styles.error}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              placeholder="email@example.com"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            style={styles.button}
            disabled={loading}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px) scale(1.01)";
              e.currentTarget.style.boxShadow =
                "0 20px 40px rgba(31,125,83,0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow =
                "0 15px 35px rgba(31,125,83,0.35)";
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={styles.registerText}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.registerLink}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    margin: "0",
    fontFamily: "'Inter', sans-serif",
    background: `
      radial-gradient(circle at top left, rgba(31,125,83,0.22), transparent 25%),
      radial-gradient(circle at bottom right, rgba(39,57,28,0.28), transparent 30%),
      linear-gradient(135deg, #18230F 0%, #27391C 45%, #255F38 100%)
    `,
  },
  card: {
    width: "100%",
    maxWidth: "620px",
    background: "rgba(24, 35, 15, 0.18)",
    backdropFilter: "blur(20px)",
    borderRadius: "30px",
    padding: "55px 60px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.12)",
    transition: "all 0.35s ease",
    cursor: "default",
  },
  title: {
    margin: "0",
    fontSize: "3rem",
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: "-1.5px",
    textAlign: "center",
  },
  subtitle: {
    margin: "14px 0 40px",
    color: "rgba(255,255,255,0.72)",
    fontSize: "1rem",
    textAlign: "center",
    lineHeight: "1.7",
  },
  error: {
    padding: "15px 18px",
    backgroundColor: "rgba(254,226,226,0.95)",
    color: "#b91c1c",
    borderRadius: "14px",
    marginBottom: "22px",
    fontSize: "0.94rem",
    border: "1px solid #fecaca",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  field: {
    marginBottom: "24px",
    width: "100%",
  },
  label: {
    display: "block",
    marginBottom: "10px",
    color: "#f8fafc",
    fontWeight: "700",
    fontSize: "0.96rem",
    letterSpacing: "0.2px",
  },
  input: {
    width: "100%",
    padding: "17px 18px",
    border: "1.5px solid rgba(255,255,255,0.12)",
    borderRadius: "16px",
    fontSize: "1rem",
    boxSizing: "border-box",
    outline: "none",
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "#ffffff",
    transition: "all 0.25s ease",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  button: {
    width: "100%",
    padding: "17px",
    marginTop: "16px",
    border: "none",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #1F7D53 0%, #255F38 100%)",
    color: "white",
    fontSize: "1.02rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 15px 35px rgba(31,125,83,0.35)",
    letterSpacing: "0.3px",
  },
  registerText: {
    textAlign: "center",
    marginTop: "32px",
    color: "rgba(255,255,255,0.72)",
    fontSize: "0.95rem",
    lineHeight: "1.7",
  },
  registerLink: {
    color: "#4ade80",
    textDecoration: "none",
    fontWeight: "700",
  },
};

export default Login;
