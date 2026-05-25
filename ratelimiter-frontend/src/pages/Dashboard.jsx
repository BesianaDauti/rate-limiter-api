import { useState, useEffect, useCallback, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import Navbar from "../components/Navbar";
import api from "../services/api";

function Dashboard() {
  const [status, setStatus] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [riskScore, setRiskScore] = useState(0);
  const [connected, setConnected] = useState(false);
  const connectionRef = useRef(null);
  const pollingRef = useRef(null);

  const fullName = localStorage.getItem("fullName");
  const userId = localStorage.getItem("userId");

  const fetchStatus = useCallback(async () => {
    try {
      const response = await api.get("/data/status");
      setStatus(response.data.data);
      setCountdown(response.data.data.resetInSeconds);
    } catch {
    }
  }, []);

  const fetchRiskScore = useCallback(async () => {
    try {
      const response = await api.get("/data/risk-score");
      setRiskScore(response.data.data);
    } catch {
    }
  }, []);

  const startPolling = useCallback(() => {
    fetchStatus();
    fetchRiskScore();
    pollingRef.current = setInterval(() => {
      fetchStatus();
      fetchRiskScore();
    }, 10000);
  }, [fetchStatus, fetchRiskScore]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(
        "http://ratelimiterapi-env.eba-ppdfdmbw.eu-north-1.elasticbeanstalk.com/hubs/dashboard",
        { accessTokenFactory: () => token }
      )
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on("StatusUpdate", (data) => {
      setStatus(data);
      setCountdown(data.resetInSeconds);
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    });

    connection.on("RiskScoreUpdate", (score) => {
      setRiskScore(score);
    });

    connection.start()
      .then(() => {
        setConnected(true);
        connection.invoke("JoinUserGroup", userId);
        fetchStatus();
        fetchRiskScore();
      })
      .catch(() => {
        startPolling();
      });

    connectionRef.current = connection;

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (connectionRef.current) {
        try {
          connectionRef.current.invoke("LeaveUserGroup", userId);
        } catch { /* ignore */ }
        connectionRef.current.stop();
      }
    };
  }, [userId, fetchStatus, fetchRiskScore, startPolling]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTestRequest = async () => {
    setLoading(true);
    setTestResult(null);
    setError("");
    try {
      const response = await api.get("/data/test");
      setTestResult(response.data.data);
      fetchStatus();
    } catch (err) {
      if (err.response?.status === 429) {
        const reset = err.response?.data?.resetInSeconds;
        setError(`Rate limit exceeded! Try again in ${reset} seconds.`);
      } else {
        setError(err.response?.data?.message || "Request failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getRemainingColor = () => {
    if (!status) return "#22c55e";
    const r = status.remainingRequests;
    if (r > 50) return "#22c55e";
    if (r > 20) return "#f59e0b";
    return "#ef4444";
  };

  const getRiskColor = () => {
    if (riskScore >= 80) return "#ef4444";
    if (riskScore >= 50) return "#f97316";
    if (riskScore >= 25) return "#f59e0b";
    return "#22c55e";
  };

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>

        <div style={styles.header}>
          <h2 style={styles.title}>Welcome, {fullName}!</h2>
          <div style={{
            ...styles.connectionBadge,
            backgroundColor: connected
              ? "rgba(34,197,94,0.15)"
              : "rgba(100,116,139,0.15)",
            border: `1px solid ${connected ? "rgba(34,197,94,0.3)" : "rgba(100,116,139,0.3)"}`
          }}>
            <span style={{
              width: "8px", height: "8px", borderRadius: "50%",
              backgroundColor: connected ? "#22c55e" : "#94a3b8",
              display: "inline-block", marginRight: "8px"
            }} />
            {connected ? "Live" : "Polling"}
          </div>
        </div>

        {error && <div style={styles.error}>⚠️ {error}</div>}

        {status && (
          <div style={styles.grid}>
            <div
              style={styles.card}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 25px 60px rgba(0,0,0,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 15px 40px rgba(0,0,0,0.22)";
              }}
            >
              <h3 style={styles.cardTitle}>Remaining Requests</h3>
              <p style={{ ...styles.cardValue, color: getRemainingColor() }}>
                {status.remainingRequests}
              </p>
              <p style={styles.cardSub}>per minute</p>
              <div style={styles.progressBg}>
                <div style={{
                  ...styles.progressFill,
                  width: `${Math.min(status.remainingRequests, 100)}%`,
                  backgroundColor: getRemainingColor()
                }} />
              </div>
            </div>

            <div
              style={styles.card}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 25px 60px rgba(0,0,0,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 15px 40px rgba(0,0,0,0.22)";
              }}
            >
              <h3 style={styles.cardTitle}>Reset In</h3>
              <p style={{ ...styles.cardValue, color: "#38bdf8" }}>
                {countdown}s
              </p>
              <p style={styles.cardSub}>seconds</p>
              <div style={styles.progressBg}>
                <div style={{
                  ...styles.progressFill,
                  width: `${(countdown / 60) * 100}%`,
                  backgroundColor: "#38bdf8"
                }} />
              </div>
            </div>

            <div
              style={styles.card}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 25px 60px rgba(0,0,0,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 15px 40px rgba(0,0,0,0.22)";
              }}
            >
              <h3 style={styles.cardTitle}>API Status</h3>
              <p style={{ ...styles.cardValue, color: "#22c55e", fontSize: "1.4rem" }}>
                Active ✅
              </p>
              <p style={styles.cardSub}>{status.message}</p>
            </div>

            <div
              style={styles.card}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 25px 60px rgba(0,0,0,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 15px 40px rgba(0,0,0,0.22)";
              }}
            >
              <h3 style={styles.cardTitle}>Risk Score</h3>
              <p style={{ ...styles.cardValue, color: getRiskColor() }}>
                {riskScore}/100
              </p>
              <p style={styles.cardSub}>
                {riskScore >= 80 ? "🚫 Critical" :
                 riskScore >= 50 ? "⚠️ High Risk" :
                 riskScore >= 25 ? "⚡ Medium" : "✅ Safe"}
              </p>
              <div style={styles.progressBg}>
                <div style={{
                  ...styles.progressFill,
                  width: `${riskScore}%`,
                  backgroundColor: getRiskColor()
                }} />
              </div>
            </div>
          </div>
        )}

        <div style={styles.textSection}>
          <h3 style={styles.sectionTitle}>Test API Request</h3>
          <p style={styles.sectionDesc}>
            Click the button below to send a test request and see rate limiting in action.
          </p>
          <button
            onClick={handleTestRequest}
            style={styles.button}
            disabled={loading}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 22px 45px rgba(31,125,83,0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 15px 35px rgba(31,125,83,0.35)";
            }}
          >
            {loading ? "Sending..." : "Send Test Request"}
          </button>

          {testResult && (
            <div style={styles.result}>
              <p><strong>Message:</strong> {testResult.message}</p>
              <p><strong>Email:</strong> {testResult.email}</p>
              <p><strong>Role:</strong> {testResult.role}</p>
              <p><strong>Time:</strong> {new Date(testResult.timestamp).toLocaleTimeString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: `
      radial-gradient(circle at top left, rgba(31,125,83,0.12), transparent 25%),
      radial-gradient(circle at bottom right, rgba(39,57,28,0.18), transparent 30%),
      linear-gradient(135deg, #10180c 0%, #18230F 35%, #27391C 100%)
    `,
    fontFamily: "'Inter', sans-serif",
  },
  content: {
    padding: "42px 32px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "800",
    color: "#ffffff",
    margin: 0,
    letterSpacing: "-1px",
  },
  connectionBadge: {
    display: "flex",
    alignItems: "center",
    padding: "6px 14px",
    borderRadius: "999px",
    fontSize: "0.85rem",
    color: "#ffffff",
    fontWeight: "600",
  },
  error: {
    padding: "16px 18px",
    backgroundColor: "rgba(254,226,226,0.95)",
    color: "#b91c1c",
    borderRadius: "16px",
    marginBottom: "22px",
    border: "1px solid #fecaca",
    fontWeight: "600",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "24px",
    marginBottom: "38px",
  },
  card: {
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(14px)",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "30px 24px",
    borderRadius: "26px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.22)",
    textAlign: "center",
    transition: "all 0.35s ease",
    cursor: "default",
  },
  cardTitle: {
    margin: "0 0 12px",
    color: "rgba(255,255,255,0.7)",
    fontSize: "0.95rem",
    fontWeight: "700",
    letterSpacing: "0.4px",
    textTransform: "uppercase",
  },
  cardValue: {
    margin: "0 0 6px",
    fontSize: "2rem",
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: "-1px",
  },
  cardSub: {
    margin: "0 0 12px",
    color: "rgba(255,255,255,0.55)",
    fontSize: "0.92rem",
    lineHeight: "1.6",
  },
  progressBg: {
    width: "100%",
    height: "5px",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: "999px",
  },
  progressFill: {
    height: "5px",
    borderRadius: "999px",
    transition: "width 0.5s ease",
  },
  textSection: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "34px",
    borderRadius: "28px",
    boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
  },
  sectionTitle: {
    margin: "0 0 12px",
    color: "#ffffff",
    fontSize: "1.6rem",
    fontWeight: "700",
    letterSpacing: "-0.5px",
  },
  sectionDesc: {
    color: "rgba(255,255,255,0.68)",
    marginBottom: "24px",
    lineHeight: "1.8",
    fontSize: "1rem",
    maxWidth: "700px",
  },
  button: {
    padding: "16px 28px",
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
  result: {
    marginTop: "24px",
    padding: "22px",
    background: "rgba(34,197,94,0.08)",
    borderRadius: "18px",
    border: "1px solid rgba(74,222,128,0.18)",
    color: "#dcfce7",
    fontSize: "0.96rem",
    lineHeight: "2",
    backdropFilter: "blur(10px)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  },
};

export default Dashboard;