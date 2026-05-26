import { useState, useEffect, useCallback } from "react";
import Navbar from "../../components/Navbar";
import api from "../../services/api";

function Suspicious() {
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchActivities = useCallback(async () => {
    try {
      const response = await api.get("/admin/suspicious");
      setActivities(response.data.data);
    } catch {
      setError("Failed to fetch suspicious activities.");
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleResetRisk = async (userId, fullName) => {
    if (!userId) {
      setError("User ID missing");
      return;
    }

    if (!window.confirm(`Reset risk score for ${fullName}?`)) return;

    try {
      await api.put(`/admin/users/${userId}/reset-risk`);
      setSuccess(`Risk score reset for ${fullName}.`);
      fetchActivities();
    } catch {
      setError("Failed to reset risk score.");
    }
  };

  const getRiskColor = (score) => {
    if (score >= 80)
      return { bg: "#fee2e2", color: "#dc2626", label: "Critical" };
    if (score >= 50) return { bg: "#fef9c3", color: "#854d0e", label: "High" };
    if (score >= 25)
      return { bg: "#fff7ed", color: "#c2410c", label: "Medium" };
    return { bg: "#f0fdf4", color: "#166534", label: "Low" };
  };

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Suspicious Activities</h2>
            <p style={styles.subtitle}>
              Monitor and manage suspicious traffic patterns and abuse attempts.
            </p>
          </div>
          <button onClick={fetchActivities} style={styles.refreshBtn}>
            Refresh
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <h3 style={styles.statTitle}>Total Detected</h3>
            <p style={styles.statValue}>{activities.length}</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statTitle}>Auto-Banned</h3>
            <p style={{ ...styles.statValue, color: "#dc2626" }}>
              {activities.filter((a) => a.isAutoBanned).length}
            </p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statTitle}>Warnings</h3>
            <p style={{ ...styles.statValue, color: "#d97706" }}>
              {activities.filter((a) => !a.isAutoBanned).length}
            </p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statTitle}>Critical (80+)</h3>
            <p style={{ ...styles.statValue, color: "#7c3aed" }}>
              {activities.filter((a) => a.riskScore >= 80).length}
            </p>
          </div>
        </div>

        {/* Activities Table */}
        {activities.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>✅</p>
            <h3 style={styles.emptyTitle}>No Suspicious Activities</h3>
            <p style={styles.emptyDesc}>
              No suspicious traffic patterns have been detected yet.
            </p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>IP Address</th>
                  <th style={styles.th}>Reason</th>
                  <th style={styles.th}>Risk Score</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Detected At</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => {
                  const risk = getRiskColor(activity.riskScore);
                  return (
                    <tr key={activity.id} style={styles.tr}>
                      <td style={styles.td}>
                        {activity.user ? (
                          <div>
                            <p style={styles.userName}>
                              {activity.user.fullName}
                            </p>
                            <p style={styles.userEmail}>
                              {activity.user.email}
                            </p>
                          </div>
                        ) : (
                          <span style={styles.unknown}>Unknown</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <code style={styles.ip}>{activity.ipAddress}</code>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.reason}>{activity.reason}</span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.riskWrapper}>
                          <span
                            style={{
                              ...styles.riskBadge,
                              backgroundColor: risk.bg,
                              color: risk.color,
                            }}
                          >
                            {activity.riskScore}/100
                          </span>
                          <span
                            style={{
                              ...styles.riskLabel,
                              color: risk.color,
                            }}
                          >
                            {risk.label}
                          </span>
                          {/* Risk Score Bar */}
                          <div style={styles.riskBarBg}>
                            <div
                              style={{
                                ...styles.riskBarFill,
                                width: `${activity.riskScore}%`,
                                backgroundColor: risk.color,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        {activity.isAutoBanned ? (
                          <span style={styles.bannedBadge}>🚫 Auto-Banned</span>
                        ) : (
                          <span style={styles.warningBadge}>⚠️ Warning</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <span style={styles.timestamp}>
                          {new Date(activity.detectedAt).toLocaleString()}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {activity.user && (
                          <button
                            onClick={() =>
                              handleResetRisk(
                                activity.userId ?? activity.user?.id,
                                activity.user?.fullName ?? "User",
                              )
                            }
                            style={styles.resetBtn}
                          >
                            Reset Risk
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#f1f5f9" },
  content: { padding: "32px", maxWidth: "1400px", margin: "0 auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
  },
  title: { fontSize: "1.8rem", color: "#1e293b", margin: "0 0 4px" },
  subtitle: { color: "#64748b", margin: 0, fontSize: "0.9rem" },
  refreshBtn: {
    padding: "10px 20px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  error: {
    padding: "12px",
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    borderRadius: "8px",
    marginBottom: "16px",
  },
  success: {
    padding: "12px",
    backgroundColor: "#f0fdf4",
    color: "#166534",
    borderRadius: "8px",
    marginBottom: "16px",
  },

  // Stats
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    textAlign: "center",
  },
  statTitle: {
    margin: "0 0 8px",
    color: "#64748b",
    fontSize: "0.85rem",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  statValue: {
    margin: 0,
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#1e293b",
  },

  // Empty State
  emptyState: {
    backgroundColor: "white",
    padding: "60px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  emptyIcon: { fontSize: "3rem", margin: "0 0 16px" },
  emptyTitle: { fontSize: "1.3rem", color: "#1e293b", margin: "0 0 8px" },
  emptyDesc: { color: "#64748b", margin: 0 },

  // Table
  tableWrapper: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    overflow: "auto",
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "900px" },
  thead: { backgroundColor: "#1e293b" },
  th: {
    padding: "14px 16px",
    color: "white",
    textAlign: "left",
    fontSize: "0.85rem",
    fontWeight: "600",
  },
  tr: { borderBottom: "1px solid #e2e8f0" },
  td: {
    padding: "12px 16px",
    color: "#374151",
    fontSize: "0.9rem",
    verticalAlign: "middle",
  },
  userName: {
    margin: "0 0 2px",
    fontWeight: "600",
    color: "#1e293b",
    fontSize: "0.9rem",
  },
  userEmail: { margin: 0, color: "#64748b", fontSize: "0.8rem" },
  unknown: { color: "#94a3b8", fontStyle: "italic" },
  ip: {
    backgroundColor: "#f1f5f9",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "0.85rem",
    color: "#475569",
  },
  reason: { fontSize: "0.85rem", color: "#374151" },

  // Risk
  riskWrapper: { display: "flex", flexDirection: "column", gap: "4px" },
  riskBadge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "0.8rem",
    fontWeight: "700",
    width: "fit-content",
  },
  riskLabel: { fontSize: "0.75rem", fontWeight: "600" },
  riskBarBg: {
    width: "100%",
    height: "4px",
    backgroundColor: "#e2e8f0",
    borderRadius: "999px",
  },
  riskBarFill: {
    height: "4px",
    borderRadius: "999px",
    transition: "width 0.3s ease",
  },

  // Badges
  bannedBadge: {
    padding: "4px 10px",
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    borderRadius: "999px",
    fontSize: "0.8rem",
    fontWeight: "600",
  },
  warningBadge: {
    padding: "4px 10px",
    backgroundColor: "#fef9c3",
    color: "#854d0e",
    borderRadius: "999px",
    fontSize: "0.8rem",
    fontWeight: "600",
  },
  timestamp: { fontSize: "0.85rem", color: "#64748b" },
  resetBtn: {
    padding: "6px 12px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: "600",
  },
};

export default Suspicious;
