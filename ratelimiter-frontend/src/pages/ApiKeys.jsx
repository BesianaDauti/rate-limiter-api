import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";

function ApiKeys() {
  const [keys, setKeys] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newKey, setNewKey] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    scopes: "read",
    expiresAt: "",
  });

  const fetchKeys = async () => {
    try {
      const response = await api.get("./keys");
      setKeys(response.data.data);
    } catch {
      setError("Failed to fetch API keys");
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setNewKey(null);

    try {
      const payload = {
        name: formData.name,
        scopes: formData.scopes,
        expiresAt: formData.expiresAt
          ? new Date(formData.expiresAt).toISOString()
          : null,
      };

      const response = await api.post("/keys", payload);
      setNewKey(response.data.data);
      setSuccess(
        "API key created successfully. Copy it now - it will not be shown again",
      );
      setShowForm(false);
      setFormData({ name: "", scopes: "read", expiresAt: "" });
      fetchKeys();
    } catch (_err) {
      setError(_err.response?.data?.message || "Failed to create API key");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id) => {
    if (!window.confirm("Are you sure you want to revoke this key?")) return;
    try {
      await api.put(`/keys/${id}/revoke`);
      setSuccess("API key revoked successfully.");
      fetchKeys();
    } catch {
      setError("Failed to revoke API key.");
    }
  };

  const handleRegenerate = async (id) => {
    if (
      !window.confirm(
        "Are you sure? The old key will stop working immediately.",
      )
    )
      return;
    try {
      const response = await api.put(`/keys/${id}/regenerate`);
      setNewKey(response.data.data);
      setSuccess(
        "API key regenerated. Copy it now — it will not be shown again!",
      );
      fetchKeys();
    } catch {
      setError("Failed to regenerate API key.");
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this key permanently?")
    )
      return;
    try {
      await api.delete(`/keys/${id}`);
      setSuccess("API key deleted successfully.");
      fetchKeys();
    } catch {
      setError("Failed to delete API key.");
    }
  };

  const handleCopy = (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setSuccess("API key copied to clipboard!");
    } catch {
      setError("Failed to copy. Please copy manually.");
    }
  };

  const maskKey = (key) => {
    return key.substring(0, 12) + "••••••••••••••••••••" + key.slice(-4);
  };

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>API Keys</h2>
            <p style={styles.subtitle}>
              Manage your API keys. Maximum 5 active keys allowed.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={styles.createBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow =
                "0 20px 40px rgba(31,125,83,0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 15px 35px rgba(31,125,83,0.32)";
            }}
          >
            {showForm ? "Cancel" : "+ Create New Key"}
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        {newKey && (
          <div style={styles.newKeyBox}>
            <h3 style={styles.newKeyTitle}>⚠️ Save Your API Key</h3>
            <p style={styles.newKeyDesc}>
              This is the only time your full API key will be shown. Copy it
              now!
            </p>
            <div style={styles.keyDisplay}>
              <code style={styles.keyCode}>{newKey.key}</code>
              <button
                onClick={() => handleCopy(newKey.key)}
                style={styles.copyBtn}
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {showForm && (
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>Create New API Key</h3>
            <form onSubmit={handleCreate}>
              <div style={styles.field}>
                <label style={styles.label}>Key Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  style={styles.input}
                  placeholder="e.g. Production App, Mobile App"
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Scopes</label>
                <select
                  value={formData.scopes}
                  onChange={(e) =>
                    setFormData({ ...formData, scopes: e.target.value })
                  }
                  style={styles.select}
                >
                  <option value="read" style={styles.option}>
                    Read Only
                  </option>

                  <option value="write" style={styles.option}>
                    Read & Write
                  </option>

                  <option value="admin" style={styles.option}>
                    Full Access
                  </option>
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Expiration Date (Optional)</label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) =>
                    setFormData({ ...formData, expiresAt: e.target.value })
                  }
                  style={styles.input}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <button type="submit" style={styles.submitBtn} disabled={loading}>
                {loading ? "Creating..." : "Create API Key"}
              </button>
            </form>
          </div>
        )}

        <div style={styles.keysList}>
          {keys.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No API keys yet. Create your first key to get started.</p>
            </div>
          ) : (
            keys.map((key) => (
              <div key={key.id} style={styles.keyCard}>
                <div style={styles.keyHeader}>
                  <div>
                    <h3 style={styles.keyName}>{key.name}</h3>
                    <code style={styles.keyMasked}>{maskKey(key.key)}</code>
                  </div>
                  <span
                    style={
                      key.isActive ? styles.badgeActive : styles.badgeInactive
                    }
                  >
                    {key.isActive ? "Active" : "Revoked"}
                  </span>
                </div>

                <div style={styles.keyMeta}>
                  <span style={styles.metaItem}>
                    <strong>Scope:</strong> {key.scopes}
                  </span>
                  <span style={styles.metaItem}>
                    <strong>Created:</strong>{" "}
                    {new Date(key.createdAt).toLocaleDateString()}
                  </span>
                  <span style={styles.metaItem}>
                    <strong>Expires:</strong>{" "}
                    {key.expiresAt
                      ? new Date(key.expiresAt).toLocaleDateString()
                      : "Never"}
                  </span>
                  <span style={styles.metaItem}>
                    <strong>Last Used:</strong>{" "}
                    {key.lastUsedAt
                      ? new Date(key.lastUsedAt).toLocaleString()
                      : "Never"}
                  </span>
                </div>

                {key.isActive && (
                  <div style={styles.keyActions}>
                    <button
                      onClick={() => handleRegenerate(key.id)}
                      style={styles.btnRegenerate}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      Regenerate
                    </button>
                    <button
                      onClick={() => handleRevoke(key.id)}
                      style={styles.btnRevoke}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      Revoke
                    </button>
                    <button
                      onClick={() => handleDelete(key.id)}
                      style={styles.btnDelete}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))
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
    maxWidth: "1100px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "32px",
  },

  title: {
    fontSize: "2.5rem",
    fontWeight: "800",
    color: "#ffffff",
    margin: "0 0 8px",
    letterSpacing: "-1px",
  },

  subtitle: {
    color: "rgba(255,255,255,0.68)",
    margin: 0,
    fontSize: "1rem",
    lineHeight: "1.7",
  },

  createBtn: {
    padding: "15px 24px",
    background: "linear-gradient(135deg, #1F7D53 0%, #255F38 100%)",
    color: "white",
    border: "none",
    borderRadius: "16px",
    cursor: "pointer",
    fontWeight: "700",
    whiteSpace: "nowrap",
    fontSize: "0.95rem",
    transition: "all 0.3s ease",
    boxShadow: "0 15px 35px rgba(31,125,83,0.32)",
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

  newKeyBox: {
    padding: "28px",
    background: "rgba(250,204,21,0.08)",
    border: "1px solid rgba(250,204,21,0.2)",
    borderRadius: "24px",
    marginBottom: "28px",
    backdropFilter: "blur(16px)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
  },

  newKeyTitle: {
    margin: "0 0 10px",
    color: "#fde68a",
    fontSize: "1.25rem",
    fontWeight: "800",
  },

  newKeyDesc: {
    margin: "0 0 18px",
    color: "rgba(255,255,255,0.72)",
    fontSize: "0.95rem",
    lineHeight: "1.7",
  },

  keyDisplay: {
    display: "flex",
    gap: "14px",
    alignItems: "center",
    flexWrap: "wrap",
  },

  keyCode: {
    flex: 1,
    padding: "16px",
    background: "rgba(0,0,0,0.3)",
    color: "#86efac",
    borderRadius: "14px",
    fontSize: "0.88rem",
    wordBreak: "break-all",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  copyBtn: {
    padding: "14px 20px",
    background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
    color: "white",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    fontWeight: "700",
    whiteSpace: "nowrap",
    transition: "all 0.3s ease",
    boxShadow: "0 12px 28px rgba(245,158,11,0.28)",
  },

  formCard: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(18px)",
    padding: "32px",
    borderRadius: "28px",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    marginBottom: "28px",
  },

  formTitle: {
    margin: "0 0 24px",
    color: "#ffffff",
    fontSize: "1.5rem",
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
    fontSize: "0.95rem",
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
  select: {
    width: "100%",
    padding: "16px 18px",
    border: "1.5px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    fontSize: "1rem",
    boxSizing: "border-box",
    outline: "none",
    background: "rgba(255,255,255,0.06)",
    color: "#ffffff",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
  },

  option: {
    backgroundColor: "#18230F",
    color: "#ffffff",
  },

  submitBtn: {
    padding: "15px 28px",
    background: "linear-gradient(135deg, #1F7D53 0%, #255F38 100%)",
    color: "white",
    border: "none",
    borderRadius: "16px",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 15px 35px rgba(31,125,83,0.35)",
  },

  keysList: {
    display: "grid",
    gap: "22px",
  },

  emptyState: {
    padding: "50px",
    textAlign: "center",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "28px",
    color: "rgba(255,255,255,0.68)",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(14px)",
  },

  keyCard: {
    background: "rgba(255,255,255,0.05)",
    padding: "28px",
    borderRadius: "28px",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 18px 50px rgba(0,0,0,0.24)",
    transition: "all 0.35s ease",
  },

  keyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "18px",
    gap: "18px",
  },

  keyName: {
    margin: "0 0 8px",
    color: "#ffffff",
    fontSize: "1.15rem",
    fontWeight: "700",
  },

  keyMasked: {
    fontSize: "0.88rem",
    color: "#86efac",
    background: "rgba(255,255,255,0.06)",
    padding: "8px 12px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  badgeActive: {
    padding: "7px 14px",
    background: "rgba(34,197,94,0.14)",
    color: "#86efac",
    borderRadius: "999px",
    fontSize: "0.8rem",
    fontWeight: "700",
    border: "1px solid rgba(74,222,128,0.18)",
  },

  badgeInactive: {
    padding: "7px 14px",
    background: "rgba(239,68,68,0.14)",
    color: "#fca5a5",
    borderRadius: "999px",
    fontSize: "0.8rem",
    fontWeight: "700",
    border: "1px solid rgba(248,113,113,0.18)",
  },

  keyMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "20px",
    padding: "18px",
    background: "rgba(255,255,255,0.04)",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.06)",
  },

  metaItem: {
    fontSize: "0.88rem",
    color: "rgba(255,255,255,0.72)",
  },

  keyActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  btnRegenerate: {
    padding: "11px 18px",
    background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "700",
    transition: "all 0.3s ease",
    boxShadow: "0 10px 22px rgba(245,158,11,0.25)",
  },

  btnRevoke: {
    padding: "11px 18px",
    background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "700",
    transition: "all 0.3s ease",
    boxShadow: "0 10px 22px rgba(239,68,68,0.25)",
  },

  btnDelete: {
    padding: "11px 18px",
    background: "linear-gradient(135deg, #4b5563 0%, #6b7280 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "700",
    transition: "all 0.3s ease",
    boxShadow: "0 10px 22px rgba(107,114,128,0.22)",
  },
};

export default ApiKeys;
