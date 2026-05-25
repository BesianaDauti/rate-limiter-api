import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";

function MyLogs() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterMethod, setFilterMethod] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get("/data/my-stats");
      setStats(response.data.data);
    } catch {}
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/data/my-logs?page=${page}&pageSize=15`;
      if (filterMethod) url += `&method=${filterMethod}`;
      if (filterStatus) url += `&statusCode=${filterStatus}`;

      const response = await api.get(url);
      setLogs(response.data.data.logs);
      setTotalPages(response.data.data.totalPages);
      setTotal(response.data.data.total);
    } catch {
      setError("Failed to fetch logs.");
    } finally {
      setLoading(false);
    }
  }, [page, filterMethod, filterStatus]);

  useEffect(() => {
    fetchStats();
    fetchLogs();
  }, [fetchStats, fetchLogs]);

  const getStatusStyle = (code) => {
    if (code >= 200 && code < 300) return { bg: "dcfce7", color: "166534" };
    if (code === 429) return { bg: "fef9c3", color: "854d0e" };
    if (code >= 400) return { bg: "fee2e2", color: "dc2626" };
    return { bg: "f1f5f9", color: "475569" };
  };

  const getMethodStyle = (method) => {
    const colors = {
      GET: { bg: "dbeafe", color: "1d4ed8" },
      POST: { bg: "dcfce7", color: "166534" },
      PUT: { bg: "fef9c3", color: "854d0e" },
      DELETE: { bg: "fee2e2", color: "dc2626" },
    };
    return colors[method] || { bg: "f1f5f9", color: "475569" };
  };

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        <h2 style={styles.title}>My Request Logs</h2>
        <p style={styles.subtitle}>
          View all requests made with your API Keys and JWT token.
        </p>

        {error && <div style={styles.error}>⚠️ {error}</div>}

        {stats && (
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Total Requests</p>
              <p style={styles.statValue}>
                {stats.totalRequests.toLocaleString()}
              </p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Today</p>
              <p style={{ ...styles.statValue, color: "#3b82f6" }}>
                {stats.requestsToday}
              </p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>This Week</p>
              <p style={{ ...styles.statValue, color: "#7c3aed" }}>
                {stats.requestsThisWeek}
              </p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Blocked (429)</p>
              <p style={{ ...styles.statValue, color: "#ef4444" }}>
                {stats.blockedRequests}
              </p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Success Rate</p>
              <p
                style={{
                  ...styles.statValue,
                  color:
                    stats.successRate > 90
                      ? "#22c55e"
                      : stats.successRate > 70
                        ? "#f59e0b"
                        : "#ef4444",
                }}
              >
                {stats.successRate}%
              </p>
            </div>
          </div>
        )}

        {stats?.topEndpoints?.length > 0 && (
          <div style={styles.topEndpoints}>
            <h3 style={styles.sectionTitle}>Top Endpoints</h3>
            <div style={styles.endpointList}>
              {stats.topEndpoints.map((ep, i) => (
                <div key={i} style={styles.endpointItem}>
                  <code style={styles.endpointPath}>{ep.endpoint}</code>
                  <span style={styles.endpointCount}>{ep.count} requests</span>
                  <div style={styles.barBg}>
                    <div
                      style={{
                        ...styles.barFill,
                        width: `${(ep.count / stats.topEndpoints[0].count) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={styles.filters}>
          <select
            value={filterMethod}
            onChange={(e) => {
              setFilterMethod(e.target.value);
              setPage(1);
            }}
            style={styles.select}
          >
            <option value="">All Methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            style={styles.select}
          >
            <option value="">All Status Codes</option>
            <option value="200">200 — Success</option>
            <option value="401">401 — Unauthorized</option>
            <option value="429">429 — Rate Limited</option>
          </select>

          <span style={styles.totalCount}>{total} total logs</span>

          <button onClick={fetchLogs} style={styles.refreshBtn}>
            Refresh
          </button>
        </div>

        <div style={styles.tableWrapper}>
          {loading ? (
            <div style={styles.loading}>Loading...</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Method</th>
                  <th style={styles.th}>Endpoint</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Source</th>
                  <th style={styles.th}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={styles.empty}>
                      No logs found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const statusStyle = getStatusStyle(log.statusCode);
                    const methodStyle = getMethodStyle(log.method);
                    return (
                      <tr key={log.id} style={styles.tr}>
                        <td style={styles.td}>
                          <span
                            style={{
                              padding: "3px 10px",
                              backgroundColor: `#${methodStyle.bg}`,
                              color: `#${methodStyle.color}`,
                              borderRadius: "999px",
                              fontSize: "0.8rem",
                              fontWeight: "700",
                            }}
                          >
                            {log.method}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <code style={styles.endpoint}>{log.endpoint}</code>
                        </td>
                        <td style={styles.td}>
                          <span
                            style={{
                              padding: "3px 10px",
                              backgroundColor: `#${statusStyle.bg}`,
                              color: `#${statusStyle.color}`,
                              borderRadius: "999px",
                              fontSize: "0.8rem",
                              fontWeight: "700",
                            }}
                          >
                            {log.statusCode}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.sourceBadge}>{log.source}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.timestamp}>
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={styles.pageBtn}
            >
              ← Previous
            </button>
            <span style={styles.pageInfo}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={styles.pageBtn}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#f1f5f9" },
  content: { padding: "32px", maxWidth: "1200px", margin: "0 auto" },
  title: { fontSize: "1.8rem", color: "#1e293b", margin: "0 0 4px" },
  subtitle: { color: "#64748b", margin: "0 0 24px", fontSize: "0.9rem" },
  error: {
    padding: "12px",
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    borderRadius: "8px",
    marginBottom: "16px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },
  statCard: {
    backgroundColor: "white",
    padding: "16px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    textAlign: "center",
  },
  statLabel: {
    margin: "0 0 6px",
    color: "#64748b",
    fontSize: "0.78rem",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  statValue: {
    margin: 0,
    fontSize: "1.8rem",
    fontWeight: "800",
    color: "#1e293b",
  },

  topEndpoints: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    marginBottom: "20px",
  },
  sectionTitle: {
    margin: "0 0 16px",
    color: "#1e293b",
    fontSize: "1rem",
    fontWeight: "700",
  },
  endpointList: { display: "grid", gap: "10px" },
  endpointItem: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "8px",
    alignItems: "center",
  },
  endpointPath: {
    backgroundColor: "#f1f5f9",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "0.85rem",
    color: "#1e293b",
  },
  endpointCount: {
    color: "#64748b",
    fontSize: "0.82rem",
    whiteSpace: "nowrap",
  },
  barBg: {
    gridColumn: "1/-1",
    height: "4px",
    backgroundColor: "#e2e8f0",
    borderRadius: "999px",
  },
  barFill: {
    height: "4px",
    backgroundColor: "#3b82f6",
    borderRadius: "999px",
    transition: "width 0.3s",
  },

  filters: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  select: {
    padding: "8px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.9rem",
    backgroundColor: "white",
    color: "#1e293b",
    outline: "none",
  },
  totalCount: { color: "#64748b", fontSize: "0.85rem", marginLeft: "auto" },
  refreshBtn: {
    padding: "8px 16px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.85rem",
  },

  tableWrapper: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  loading: { padding: "40px", textAlign: "center", color: "#64748b" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { backgroundColor: "#1e293b" },
  th: {
    padding: "12px 16px",
    color: "white",
    textAlign: "left",
    fontSize: "0.82rem",
    fontWeight: "600",
  },
  tr: { borderBottom: "1px solid #e2e8f0" },
  td: { padding: "10px 16px", color: "#374151", fontSize: "0.88rem" },
  empty: { padding: "40px", textAlign: "center", color: "#94a3b8" },
  endpoint: {
    backgroundColor: "#f1f5f9",
    padding: "3px 8px",
    borderRadius: "4px",
    fontSize: "0.82rem",
    color: "#475569",
  },
  sourceBadge: {
    padding: "3px 10px",
    backgroundColor: "#ede9fe",
    color: "#5b21b6",
    borderRadius: "999px",
    fontSize: "0.78rem",
    fontWeight: "600",
  },
  timestamp: { color: "#64748b", fontSize: "0.82rem" },

  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
    marginTop: "20px",
  },
  pageBtn: {
    padding: "8px 16px",
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.9rem",
    color: "#1e293b",
  },
  pageInfo: { color: "#64748b", fontSize: "0.9rem" },
};

export default MyLogs;
