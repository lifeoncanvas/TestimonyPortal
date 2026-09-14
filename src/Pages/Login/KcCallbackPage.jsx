import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import api from "../../services/axiosConfig";

/**
 * Handles /kc-callback after KingsChat OAuth2 login.
 * Reads token + name from URL, stores token, fetches full profile,
 * shows "Welcome, [Name]!" then redirects to dashboard.
 */
export default function KcCallbackPage() {
  const location = useLocation();
  const [userName, setUserName] = useState("Friend");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const rawToken = params.get("token");
    const rawName = params.get("name");
    const redirect = params.get("redirect") || "/profile";

    if (!rawToken) {
      setError("Login failed — no token received. Please try again.");
      setTimeout(() => { window.location.replace("/login"); }, 3000);
      return;
    }

    const token = decodeURIComponent(rawToken);
    const decodedName = rawName ? decodeURIComponent(rawName) : "Friend";
    setUserName(decodedName);

    // 1. Store token first so API calls work
    localStorage.setItem("token", token);

    // 2. Fetch full user profile from backend
    api.get("/api/users/me")
      .then((res) => {
        const fullUser = res.data;
        localStorage.setItem("user", JSON.stringify(fullUser));
        if (fullUser?.name) setUserName(fullUser.name);
      })
      .catch(() => {
        // Fallback: store minimal user from URL params
        const role = redirect === "/admin" ? "ADMIN" : "USER";
        localStorage.setItem("user", JSON.stringify({ name: decodedName, role }));
      })
      .finally(() => {
        // 3. Redirect to dashboard after 1.8s
        setTimeout(() => {
          window.location.replace(redirect);
        }, 1800);
      });

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
        {/* Animated success icon */}
        <div style={styles.iconWrap}>
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <circle cx="22" cy="22" r="22" fill="rgba(201,169,110,0.18)" />
            <path
              d="M13 22l7 7 11-13"
              stroke="#c9a96e"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 35,
                strokeDashoffset: 35,
                animation: "drawCheck 0.5s ease forwards 0.3s",
              }}
            />
          </svg>
        </div>

        <h1 style={styles.welcome}>
          Welcome, <span style={styles.name}>{userName}</span>! 🎉
        </h1>
        <p style={styles.sub}>You've successfully signed in with KingsChat.</p>

        {/* Animated progress bar */}
        <div style={styles.progressWrap}>
          <div style={styles.progressBar} />
        </div>
        <p style={{ ...styles.sub, color: "#5c576c", fontSize: "12px", marginTop: "10px" }}>
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
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 30px rgba(201,169,110,0.15); }
          50%       { box-shadow: 0 0 50px rgba(201,169,110,0.35); }
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
    background:
      "radial-gradient(circle at 10% 20%, rgba(120,80,220,0.12) 0%, rgba(10,10,22,0.98) 80%), linear-gradient(135deg, #060612 0%, #0d0d21 100%)",
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
    width: "88px",
    height: "88px",
    borderRadius: "50%",
    background: "rgba(201,169,110,0.08)",
    border: "2px solid rgba(201,169,110,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 28px",
    animation: "glowPulse 2s ease infinite",
  },
  welcome: {
    margin: "0 0 10px",
    fontFamily: "'Outfit', sans-serif",
    fontSize: "30px",
    fontWeight: "800",
    color: "#f0ecf8",
    letterSpacing: "-0.5px",
  },
  title: {
    margin: "0 0 10px",
    fontFamily: "'Outfit', sans-serif",
    fontSize: "24px",
    fontWeight: "700",
    color: "#f0ecf8",
  },
  name: {
    background: "linear-gradient(135deg, #e5c07b 0%, #b89758 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
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
  },
  progressBar: {
    height: "100%",
    background: "linear-gradient(90deg, #e5c07b 0%, #b89758 100%)",
    borderRadius: "2px",
    animation: "fillBar 1.8s ease forwards",
  },
};
