import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import api from "../../services/api";

function Override() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [newLimit, setNewLimit] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/admin/users");
      setUsers(response.data.data);
    } catch {
      setError("Failed to fetch users.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await api.put(`/admin/users/${selectedUser}/ratelimit`, {
        newLimit: parseInt(newLimit),
      });
      setSuccess(`Rate limit updated to ${newLimit} requests/minute.`);
      setNewLimit("");
      fetchUsers();
    } catch {
      setError("Failed to update rate limit.");
    }
  };

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        <h2 style={styles.title}>Rate Limit Override</h2>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Override User Rate Limit</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>Select User</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                style={styles.input}
                required
              >
                <option value="">-- Select a user --</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} ({user.email}) — Current: {user.rateLimit}
                    /min
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                New Rate Limit (requests/minute)
              </label>
              <input
                type="number"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                style={styles.input}
                placeholder="e.g. 200"
                min="1"
                max="10000"
                required
              />
            </div>

            <button type="submit" style={styles.button}>
              Update Rate Limit
            </button>
          </form>
        </div>

        <div style={styles.tableWrapper}>
          <h3 style={styles.tableTitle}>Current Rate Limits</h3>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Rate Limit</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={styles.tr}>
                  <td style={styles.td}>{user.fullName}</td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>{user.rateLimit}/min</td>
                  <td style={styles.td}>
                    <span
                      style={
                        user.isBlocked
                          ? styles.badgeBlocked
                          : styles.badgeActive
                      }
                    >
                      {user.isBlocked ? "Blocked" : "Active"}
                    </span>
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
      radial-gradient(circle at top left, rgba(31,125,83,0.18), transparent 25%),
      radial-gradient(circle at bottom right, rgba(39,57,28,0.22), transparent 30%),
      linear-gradient(135deg, #18230F 0%, #27391C 45%, #255F38 100%)
    `,
    paddingBottom: "40px",
  },

  content: {
    padding: "42px 32px",
    maxWidth: "1000px",
    margin: "0 auto",
  },

  title: {
    fontSize: "2.3rem",
    color: "#ffffff",
    marginBottom: "30px",
    fontWeight: "800",
    letterSpacing: "-1px",
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

  card: {
    background: "rgba(24,35,15,0.28)",
    backdropFilter: "blur(18px)",
    padding: "34px",
    borderRadius: "30px",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 18px 45px rgba(0,0,0,0.25)",
    marginBottom: "28px",
    transition: "all 0.35s ease",
  },

  cardTitle: {
    margin: "0 0 24px",
    color: "#ffffff",
    fontSize: "1.35rem",
    fontWeight: "700",
  },

  field: {
    marginBottom: "22px",
  },

  label: {
    display: "block",
    marginBottom: "10px",
    color: "#f8fafc",
    fontWeight: "700",
    fontSize: "0.94rem",
    letterSpacing: "0.2px",
  },

  input: {
    width: "100%",
    padding: "16px 18px",
    border: "1.5px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    fontSize: "1rem",
    boxSizing: "border-box",
    outline: "none",
    backgroundColor: "rgba(255,255,255,0.06)",
    color: "#ffffff",
    transition: "all 0.25s ease",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
  },

  option: {
    backgroundColor: "#18230F",
    color: "#ffffff",
  },

  button: {
    padding: "16px 26px",
    background: "linear-gradient(135deg, #1F7D53 0%, #255F38 100%)",
    color: "white",
    border: "none",
    borderRadius: "16px",
    fontSize: "0.98rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 15px 35px rgba(31,125,83,0.35)",
    letterSpacing: "0.3px",
  },

  tableWrapper: {
    background: "rgba(24,35,15,0.28)",
    backdropFilter: "blur(18px)",
    borderRadius: "30px",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 18px 45px rgba(0,0,0,0.25)",
    padding: "30px",
    overflow: "hidden",
  },

  tableTitle: {
    margin: "0 0 22px",
    color: "#ffffff",
    fontSize: "1.3rem",
    fontWeight: "700",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  thead: {
    background: "rgba(255,255,255,0.05)",
  },

  th: {
    padding: "16px",
    color: "#ffffff",
    textAlign: "left",
    fontSize: "0.86rem",
    fontWeight: "700",
    letterSpacing: "0.3px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },

  tr: {
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    transition: "all 0.25s ease",
  },

  td: {
    padding: "16px",
    color: "rgba(255,255,255,0.82)",
    fontSize: "0.92rem",
  },

  badgeActive: {
    padding: "6px 12px",
    backgroundColor: "rgba(34,197,94,0.18)",
    color: "#4ade80",
    borderRadius: "999px",
    fontSize: "0.8rem",
    fontWeight: "700",
    border: "1px solid rgba(74,222,128,0.2)",
  },

  badgeBlocked: {
    padding: "6px 12px",
    backgroundColor: "rgba(239,68,68,0.18)",
    color: "#f87171",
    borderRadius: "999px",
    fontSize: "0.8rem",
    fontWeight: "700",
    border: "1px solid rgba(248,113,113,0.2)",
  },
};

export default Override;
