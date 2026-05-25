import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const fullName = localStorage.getItem("fullName");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("fullName");
    navigate("/");
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <Link
          to="/dashboard"
          style={styles.brandLink}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#4ade80";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#ffffff";
          }}
        >
          RateLimiter API
        </Link>
      </div>

      <div style={styles.links}>
        <Link
          to="/dashboard"
          style={styles.link}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
            e.currentTarget.style.color = "#ffffff";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.78)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Dashboard
        </Link>

        {role === "Admin" ? (
          <>
            <Link
              to="/admin/users"
              style={styles.link}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,0.78)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Users
            </Link>

            <Link
              to="/admin/logs"
              style={styles.link}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,0.78)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Logs
            </Link>

            <Link
              to="/admin/override"
              style={styles.link}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,0.78)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Override
            </Link>
            <Link
              to="/admin/suspicious"
              style={styles.link}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,0.78)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Suspicious
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/api-keys"
              style={styles.link}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,0.78)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              API Keys
            </Link>

            <Link
              to="/plans"
              style={styles.link}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,0.78)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Plans
            </Link>
            <Link
              to="/my-logs"
              style={styles.link}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,0.78)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              My Logs
            </Link>
          </>
        )}

        <span style={styles.username}>{fullName}</span>

        <button
          onClick={handleLogout}
          style={styles.button}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px) scale(1.03)";
            e.currentTarget.style.boxShadow = "0 15px 35px rgba(239,68,68,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.boxShadow =
              "0 10px 25px rgba(239,68,68,0.28)";
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 42px",
    minHeight: "88px",
    width: "100%",
    boxSizing: "border-box",

    background: `
      linear-gradient(
        135deg,
        #18230F 0%,
        #27391C 45%,
        #255F38 100%
      )
    `,

    borderBottom: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 10px 35px rgba(0,0,0,0.28)",
    backdropFilter: "blur(12px)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },

  brand: {
    fontSize: "1.45rem",
    fontWeight: "800",
    letterSpacing: "0.4px",
  },

  brandLink: {
    color: "#ffffff",
    textDecoration: "none",
    transition: "all 0.3s ease",
  },

  links: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },

  link: {
    color: "rgba(255,255,255,0.78)",
    textDecoration: "none",
    fontSize: "0.98rem",
    fontWeight: "600",
    padding: "10px 16px",
    borderRadius: "12px",
    transition: "all 0.25s ease",
    backgroundColor: "transparent",
  },

  username: {
    color: "#86efac",
    fontSize: "0.96rem",
    fontWeight: "700",
    padding: "10px 16px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  button: {
    padding: "12px 20px",
    background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
    color: "white",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "0.95rem",
    transition: "all 0.3s ease",
    boxShadow: "0 10px 25px rgba(239,68,68,0.28)",
  },
};

export default Navbar;
