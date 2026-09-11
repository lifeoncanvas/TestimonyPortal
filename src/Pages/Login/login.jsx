import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import "./styles.css";
import api from "../../services/axiosConfig";
import kingsChatWebSdk from "kingschat-web-sdk";
import "kingschat-web-sdk/dist/stylesheets/style.min.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [kingschatLoading, setKingschatLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState(null); // null | 'email' | 'phone'

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", {
        email: form.email,
        password: form.password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      if (res.data.user && res.data.user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/profile");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  // ─── KingsChat SDK flow (same approach as Reporting Portal) ───────────────
  const handleKingschatAuth = () => {
    setError("");
    setKingschatLoading(true);

    const clientId = (
      window.ENV?.KINGSCHAT_CLIENT_ID ||
      process.env.REACT_APP_KINGSCHAT_CLIENT_ID ||
      "4e67fd93-25ee-458b-9fde-6bcf6a1c5e9a"
    ).trim();

    const loginOptions = {
      clientId,
      scopes: ["authenticate", "profile"],
    };

    kingsChatWebSdk
      .login(loginOptions)
      .then(async (tokenResponse) => {
        // SDK returns { accessToken, user: { ... } }
        const { accessToken, user: kcUser } = tokenResponse;

        try {
          // Send the accessToken to our backend to verify + create/find user
          const res = await api.post("/api/auth/kingschat/token", {
            token: accessToken,
            email:     kcUser?.email     || null,
            firstName: kcUser?.first_name || kcUser?.firstName || null,
            lastName:  kcUser?.last_name  || kcUser?.lastName  || null,
            username:  kcUser?.username   || null,
          });

          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));

          if (res.data.user && res.data.user.role === "ADMIN") {
            navigate("/admin");
          } else {
            navigate("/profile");
          }
        } catch (err) {
          setError(err.response?.data?.message || "KingsChat login failed on the server.");
          setKingschatLoading(false);
        }
      })
      .catch((err) => {
        console.error("KingsChat SDK error:", err);
        setError("KingsChat login was cancelled or failed. Please try again.");
        setKingschatLoading(false);
      });
  };

  const toggleMethod = (method) => {
    setLoginMethod((prev) => (prev === method ? null : method));
  };

  return (
    <div className="login-page">
      <div className="auth-card">

        {/* Loading overlay while KingsChat session resolves */}
        {kingschatLoading && (
          <div style={{
            position: "absolute", inset: 0, borderRadius: "24px",
            background: "rgba(10,10,22,0.93)", backdropFilter: "blur(8px)",
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: "18px", zIndex: 10,
          }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "50%",
              border: "3px solid rgba(201,169,110,0.2)",
              borderTopColor: "#c9a96e",
              animation: "kcSpin 0.8s linear infinite",
            }} />
            <p style={{ color: "#f0ecf8", fontWeight: 700, fontSize: "15px", margin: 0 }}>
              Connecting to KingsChat...
            </p>
            <p style={{ color: "#9a95a8", fontSize: "12px", margin: 0 }}>
              Complete sign-in in the popup window
            </p>
            <style>{`@keyframes kcSpin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        <div className="auth-logo">
          <span className="logo-icon">✨</span>
          <h2>My Miracle Story</h2>
        </div>
        <h1>Welcome Back</h1>
        <p className="auth-sub">Sign in to your account</p>

        {error && <div className="auth-error"><span>⚠️</span> {error}</div>}

        <div className="auth-buttons-stack" style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>

          {/* ── KingsChat ── */}
          <button
            type="button"
            className="kc-login-btn"
            style={{
              backgroundColor: "#5476ea", color: "white", padding: "15px",
              borderRadius: "10px", border: "none", fontWeight: "bold",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              cursor: "pointer", width: "100%",
              opacity: (kingschatLoading || loading) ? 0.6 : 1,
            }}
            onClick={handleKingschatAuth}
            disabled={kingschatLoading || loading}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img
                src="https://kingschat.online/favicon.ico"
                alt=""
                style={{ width: "18px", height: "18px", opacity: 0.9 }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
              {kingschatLoading ? "CONNECTING..." : "SIGN IN WITH KINGSCHAT"}
            </span>
            <span>→</span>
          </button>

          {/* ── Email ── */}
          <div className="method-dropdown">
            <button
              type="button"
              className="email-login-btn"
              style={{
                backgroundColor: "#292c53", color: "white", padding: "15px",
                borderRadius: "10px", border: "none", fontWeight: "bold",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                cursor: "pointer", width: "100%",
              }}
              onClick={() => toggleMethod("email")}
              disabled={loading}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ display: "inline-block", width: "18px", height: "18px", backgroundColor: "white", borderRadius: "3px" }} />
                SIGN IN WITH EMAIL
              </span>
              <span>{loginMethod === "email" ? "▲" : "▼"}</span>
            </button>

            {loginMethod === "email" && (
              <form onSubmit={handleSubmit} style={{ marginTop: "15px", padding: "10px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }}>
                <div className="auth-field">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="auth-field">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div style={{ textAlign: "right", marginBottom: "15px" }}>
                  <span
                    onClick={() => navigate("/forgot-password")}
                    style={{ cursor: "pointer", color: "#c9a96e", fontSize: "0.9rem" }}
                  >
                    Forgot Password?
                  </span>
                </div>
                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </form>
            )}
          </div>

          {/* ── Phone ── */}
          <div className="method-dropdown">
            <button
              type="button"
              className="phone-login-btn"
              style={{
                backgroundColor: "#567030", color: "white", padding: "15px",
                borderRadius: "10px", border: "none", fontWeight: "bold",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                cursor: "pointer", width: "100%",
              }}
              onClick={() => toggleMethod("phone")}
              disabled={loading}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "1.2rem" }}>📞</span>
                SIGN IN WITH PHONE
              </span>
              <span>{loginMethod === "phone" ? "▲" : "▼"}</span>
            </button>

            {loginMethod === "phone" && (
              <div style={{ marginTop: "15px", padding: "20px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", textAlign: "center", color: "#9a95a8" }}>
                Phone login coming soon
              </div>
            )}
          </div>
        </div>

        <p className="auth-switch" style={{ marginTop: "30px" }}>
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")} style={{ color: "#5476ea", fontWeight: "bold", cursor: "pointer" }}>
            Sign up here →
          </span>
        </p>
      </div>
    </div>
  );
}
