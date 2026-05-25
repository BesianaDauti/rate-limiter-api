import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import api from "../../services/api";

function Logs() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get("/admin/logs");
      setLogs(response.data.data);
    } catch {
      setError("Failed to fetch logs");
    }
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return styles.status200;
    if (status === 429) return styles.status429;
    if (status >= 400) return styles.status400;
    return styles.statusDefault;
  };

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        <div style={styles.header}>
          <h2 style={styles.title}>Request Logs</h2>
          <button
            onClick={fetchLogs}
            style={styles.refreshBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
              e.currentTarget.style.boxShadow =
                "0 18px 38px rgba(31,125,83,0.42)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow =
                "0 12px 28px rgba(31,125,83,0.3)";
            }}
          >
            Refresh
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Method</th>
                <th style={styles.th}>Endpoint</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  style={styles.tr}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <td style={styles.td}>{log.id}</td>
                  <td style={styles.td}>{log.user?.email || "N/A"}</td>
                  <td style={styles.td}>
                    <span style={styles.method}>{log.method}</span>
                  </td>
                  <td style={styles.td}>{log.endpoint}</td>
                  <td style={styles.td}>
                    <span style={getStatusColor(log.statusCode)}>
                      {log.statusCode}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    maxWidth: "1350px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
    gap: "20px",
  },

  title: {
    fontSize: "2.4rem",
    fontWeight: "800",
    color: "#ffffff",
    margin: 0,
    letterSpacing: "-1px",
  },

  refreshBtn: {
    padding: "14px 22px",
    background: "linear-gradient(135deg, #1F7D53 0%, #255F38 100%)",
    color: "white",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "0.92rem",
    transition: "all 0.3s ease",
    boxShadow: "0 12px 28px rgba(31,125,83,0.3)",
    letterSpacing: "0.3px",
  },

  error: {
    padding: "16px 18px",
    backgroundColor: "rgba(254,226,226,0.95)",
    color: "#b91c1c",
    borderRadius: "16px",
    marginBottom: "18px",
    border: "1px solid #fecaca",
    fontWeight: "600",
    boxShadow: "0 10px 25px rgba(0,0,0,0.18)",
  },

  tableWrapper: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(18px)",
    borderRadius: "28px",
    border: "1px solid rgba(255,255,255,0.08)",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  thead: {
    background: `
      linear-gradient(
        135deg,
        rgba(31,125,83,0.95) 0%,
        rgba(37,95,56,0.95) 100%
      )
    `,
  },

  th: {
    padding: "20px 18px",
    color: "#ffffff",
    textAlign: "left",
    fontSize: "0.9rem",
    fontWeight: "700",
    letterSpacing: "0.5px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },

  tr: {
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    transition: "all 0.25s ease",
  },

  td: {
    padding: "18px",
    color: "rgba(255,255,255,0.82)",
    fontSize: "0.93rem",
    verticalAlign: "middle",
  },

  method: {
    padding: "7px 14px",
    background: "rgba(59,130,246,0.18)",
    color: "#93c5fd",
    borderRadius: "999px",
    fontSize: "0.78rem",
    fontWeight: "700",
    border: "1px solid rgba(147,197,253,0.18)",
    letterSpacing: "0.3px",
  },

  status200: {
    padding: "7px 14px",
    background: "rgba(34,197,94,0.14)",
    color: "#86efac",
    borderRadius: "999px",
    fontSize: "0.78rem",
    fontWeight: "700",
    border: "1px solid rgba(74,222,128,0.18)",
  },

  status429: {
    padding: "7px 14px",
    background: "rgba(250,204,21,0.14)",
    color: "#fde68a",
    borderRadius: "999px",
    fontSize: "0.78rem",
    fontWeight: "700",
    border: "1px solid rgba(250,204,21,0.18)",
  },

  status400: {
    padding: "7px 14px",
    background: "rgba(239,68,68,0.14)",
    color: "#fca5a5",
    borderRadius: "999px",
    fontSize: "0.78rem",
    fontWeight: "700",
    border: "1px solid rgba(248,113,113,0.18)",
  },

  statusDefault: {
    padding: "7px 14px",
    background: "rgba(255,255,255,0.08)",
    color: "#e2e8f0",
    borderRadius: "999px",
    fontSize: "0.78rem",
    fontWeight: "700",
    border: "1px solid rgba(255,255,255,0.08)",
  },
};

export default Logs;
