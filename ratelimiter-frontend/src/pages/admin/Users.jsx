import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import api from "../../services/api";

function Users() {
  const [users, setUsers] = useState([]);
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
      setError("Failed to fetch users");
    }
  };

  const handleBlock = async (id, isBlocked) => {
    try {
      await api.put(`/admin/users/${id}/block`, { isBlocked: !isBlocked });
      setSuccess(`User ${!isBlocked ? "blocked" : "unlocked"} successfully`);
      fetchUsers();
    } catch {
      setError("Failed to update user");
    }
  };

  const handlePlanChange = async (userId, currentPlanId) => {
    const planId = prompt(
      `Enter plan ID (1=Free, 2=Pro, 3=Enterprise):`,
      currentPlanId,
    );
    if (!planId) return;
    try {
      await api.put(`/plans/users/${userId}`, { planId: parseInt(planId) });
      setSuccess("Plan updated successfully.");
      fetchUsers();
    } catch {
      setError("Failed to update plan.");
    }
  };

  const handleRateLimit = async (id, currentLimit) => {
    const newLimit = prompt(
      `Enter new rate limit (current> ${currentLimit})>`,
      currentLimit,
    );
    if (!newLimit) return;

    try {
      await api.put(`/admin/users/${id}/ratelimit`, {
        newLimit: parseInt(newLimit),
      });
      setSuccess("Rate limit updated successfully");
      fetchUsers();
    } catch {
      setError("Failed to update rate limit");
    }
  };

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        <h2 style={styles.title}>Users Management</h2>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Full Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Rate Limit</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  style={styles.tr}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <td style={styles.td}>{user.id}</td>
                  <td style={styles.td}>{user.fullName}</td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>
                    <span
                      style={
                        user.role === "Admin"
                          ? styles.badgeAdmin
                          : styles.badgeUser
                      }
                    >
                      {user.role}
                    </span>
                  </td>
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
                  <td style={styles.td}>
                    <button
                      onClick={() => handleRateLimit(user.id, user.rateLimit)}
                      style={styles.btnEdit}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 16px 30px rgba(59,130,246,0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 10px 20px rgba(59,130,246,0.25)";
                      }}
                    >
                      Edit Limit
                    </button>
                    <button
                      onClick={() => handlePlanChange(user.id, user.planId)}
                      style={styles.btnPlan}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 16px 30px rgba(124,58,237,0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 10px 20px rgba(124,58,237,0.25)";
                      }}
                    >
                      Change Plan
                    </button>
                    <button
                      onClick={() => handleBlock(user.id, user.isBlocked)}
                      style={
                        user.isBlocked ? styles.btnUnblock : styles.btnBlock
                      }
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";

                        e.currentTarget.style.boxShadow = user.isBlocked
                          ? "0 16px 30px rgba(34,197,94,0.4)"
                          : "0 16px 30px rgba(239,68,68,0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";

                        e.currentTarget.style.boxShadow = user.isBlocked
                          ? "0 10px 20px rgba(34,197,94,0.25)"
                          : "0 10px 20px rgba(239,68,68,0.25)";
                      }}
                    >
                      {user.isBlocked ? "Unblock" : "Block"}
                    </button>
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

  title: {
    fontSize: "2.4rem",
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: "28px",
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
    boxShadow: "0 10px 25px rgba(0,0,0,0.18)",
  },

  success: {
    padding: "16px 18px",
    background: "rgba(34,197,94,0.12)",
    color: "#dcfce7",
    borderRadius: "16px",
    marginBottom: "18px",
    border: "1px solid rgba(74,222,128,0.18)",
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

  badgeAdmin: {
    padding: "7px 14px",
    background: "rgba(59,130,246,0.18)",
    color: "#93c5fd",
    borderRadius: "999px",
    fontSize: "0.78rem",
    fontWeight: "700",
    border: "1px solid rgba(147,197,253,0.18)",
  },

  badgeUser: {
    padding: "7px 14px",
    background: "rgba(255,255,255,0.08)",
    color: "#e2e8f0",
    borderRadius: "999px",
    fontSize: "0.78rem",
    fontWeight: "700",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  badgeActive: {
    padding: "7px 14px",
    background: "rgba(34,197,94,0.14)",
    color: "#86efac",
    borderRadius: "999px",
    fontSize: "0.78rem",
    fontWeight: "700",
    border: "1px solid rgba(74,222,128,0.18)",
  },

  badgeBlocked: {
    padding: "7px 14px",
    background: "rgba(239,68,68,0.14)",
    color: "#fca5a5",
    borderRadius: "999px",
    fontSize: "0.78rem",
    fontWeight: "700",
    border: "1px solid rgba(248,113,113,0.18)",
  },

  btnEdit: {
    padding: "10px 16px",
    background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    marginRight: "10px",
    fontSize: "0.8rem",
    fontWeight: "700",
    transition: "all 0.3s ease",
    boxShadow: "0 10px 20px rgba(59,130,246,0.25)",
  },

  btnPlan: {
    padding: "10px 16px",
    background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    marginRight: "10px",
    fontSize: "0.8rem",
    fontWeight: "700",
    transition: "all 0.3s ease",
    boxShadow: "0 10px 20px rgba(124,58,237,0.25)",
  },

  btnBlock: {
    padding: "10px 16px",
    background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: "700",
    transition: "all 0.3s ease",
    boxShadow: "0 10px 20px rgba(239,68,68,0.25)",
  },

  btnUnblock: {
    padding: "10px 16px",
    background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: "700",
    transition: "all 0.3s ease",
    boxShadow: "0 10px 20px rgba(34,197,94,0.25)",
  },
};

export default Users;
