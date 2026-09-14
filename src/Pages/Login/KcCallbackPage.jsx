import { useEffect, useState } from "react";
import { useLocation } from "react-router";

/**
 * Handles the /kc-callback route.
 * The backend redirects here after a successful KingsChat login with:
 *   ?token=JWT&name=UserName&redirect=/profile (or /admin)
 *
 * This page:
 * 1. Reads the token + user info from the URL
 * 2. Stores them in localStorage
 * 3. Shows a "Welcome, [name]!" message briefly
 * 4. Redirects to the dashboard (/profile or /admin)
 */
export default function KcCallbackPage() {
  const location = useLocation();
  const [userName, setUserName] = useState("Friend");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const name = params.get("name");
    const redirect = params.get("redirect") || "/profile";

    if (!token) {
      setError("Login failed — no token received. Please try again.");
      setTimeout(() => { window.location.replace("/login"); }, 3000);
      return;
    }

    // Decode name
    const decodedName = name ? decodeURIComponent(name) : "Friend";
    setUserName(decodedName);

    // Build minimal user object from URL params
    const role = redirect === "/admin" ? "ADMIN" : "USER";
    const userObj = { name: decodedName, role };

    // Store in localStorage
    localStorage.setItem("token", decodeURIComponent(token));
    localStorage.setItem("user", JSON.stringify(userObj));

    // Show welcome message briefly then redirect
    setTimeout(() => {
      window.location.replace(redirect);
    }, 1800);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
          <h2 style={styles.title}>Sign-in Failed</h2>
          <p style={styles.sub}>{error}</p>
          <p style={{ ...styles.sub, color: "#5c576c", fontSize: "13px" }}>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Animated checkmark */}
        <div style={styles.iconWrap}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="20" fill="rgba(201,169,110,0.15)" />
            <path
              d="M12 20l6 6 10-12"
              stroke="#c9a96e"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animation: "drawCheck 0.4s ease forwards 0.3s", strokeDasharray: 30, strokeDashoffset: 30 }}
            />
          </svg>
        </div>

        <h1 style={styles.welcome}>
          Welcome, <span style={styles.name}>{userName}</span>! 🎉
        </h1>
        <p style={styles.sub}>You've successfully signed in with KingsChat.</p>

        {/* Progress bar */}
        <div style={styles.progressWrap}>
          <div style={styles.progressBar} />
        </div>
        <p style={{ ...styles.sub, color: "#5c576c", fontSize: "12px", marginTop: "12px" }}>
          Taking you to your dashboard...
        </p>
      </div>

      <style>{`
        @keyframes authFadeIn {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }
        @keyframes fillBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "radial-gradient(circle at 10% 20%, rgba(120,80,220,0.12) 0%, rgba(10,10,22,0.98) 80%), linear-gradient(135deg, #060612 0%, #0d0d21 100%)",
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: "24px",
  },
  card: {
    background: "rgba(20,20,38,0.65)",
    borderRadius: "24px",
    padding: "48px 40px",
    maxWidth: "420px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 24px 64px rgba(0,0,0,0.55), inset 0 1px 1px rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(24px)",
    animation: "authFadeIn 0.5s cubic-bezier(0.16,1,0.3,1)",
  },
  iconWrap: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "rgba(201,169,110,0.1)",
    border: "1px solid rgba(201,169,110,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
    boxShadow: "0 0 40px rgba(201,169,110,0.15)",
    animation: "pulse 2s ease infinite",
  },
  welcome: {
    margin: "0 0 10px",
    fontFamily: "'Outfit', sans-serif",
    fontSize: "28px",
    fontWeight: "800",
    color: "#f0ecf8",
    letterSpacing: "-0.5px",
  },
  name: {
    background: "linear-gradient(135deg, #e5c07b 0%, #b89758 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  sub: {
    color: "#9a95a8",
    fontSize: "14px",
    margin: "0 0 24px",
    fontWeight: "500",
    lineHeight: "1.6",
  },
  progressWrap: {
    height: "4px",
    background: "rgba(255,255,255,0.06)",
    borderRadius: "2px",
    overflow: "hidden",
    margin: "0 0 0",
  },
  progressBar: {
    height: "100%",
    background: "linear-gradient(135deg, #e5c07b 0%, #b89758 100%)",
    borderRadius: "2px",
    animation: "fillBar 1.8s ease forwards",
  },
};
