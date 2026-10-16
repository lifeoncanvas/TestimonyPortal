import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import "./styles.css";
import api from "../../services/axiosConfig";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState("email");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // ── Email/password login ───────────────────────────────────────────────────
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
      if (res.data.user?.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  // ── Handle KingsChat error or code in URL ──────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const kcError = params.get("kc_error") || params.get("error");
    if (kcError) {
      setError(decodeURIComponent(kcError));
    }
  }, []);

  const handleKingschatLogin = () => {
    setError("");
    setLoading(true);
    const clientId = process.env.REACT_APP_KINGSCHAT_CLIENT_ID || "ffbcd492-38f3-4964-b3f6-d4c014ff2ade";
    const redirectUri = encodeURIComponent("https://testimonyportal.com");
    const scopes = encodeURIComponent('["profile"]');
    const authUrl = `https://accounts.kingsch.at/?client_id=${clientId}&scopes=${scopes}&redirect_uri=${redirectUri}`;
    window.location.href = authUrl;
  };

  const toggleMethod = (method) => {
    setLoginMethod((prev) => (prev === method ? null : method));
  };

  return (
    <div className="login-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-icon">✨</span>
          <h2>My Miracle Story</h2>
        </div>
        <h1>Welcome Back</h1>
        <p className="auth-sub">Sign in to your account</p>

        {error && (
          <div className="auth-error">
            <span>⚠️</span> {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
          {/* ── KingsChat Sign In ── */}
          <button
            type="button"
            className="kingschat-btn"
            onClick={handleKingschatLogin}
            disabled={loading}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.477 2 2 6.477 2 12C2 13.82 2.49 15.53 3.35 17L2 22L7.15 20.68C8.58 21.51 10.23 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2Z" fill="#FFFFFF"/>
                <path d="M8.5 7H10.5V11.2L13.8 7H16.3L12.5 11.8L16.5 17H14L10.5 12.3V17H8.5V7Z" fill="#0084FF"/>
              </svg>
              SIGN IN WITH KINGSCHAT
            </span>
            <span style={{ fontSize: "18px" }}>→</span>
          </button>

          <div className="auth-divider">
            <span>OR USE CREDENTIALS</span>
          </div>

          {/* ── Email ── */}
          <div>
            <button
              type="button"
              style={{
                backgroundColor: "#292c53", color: "white", padding: "15px 20px",
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
              <form onSubmit={handleSubmit} style={{ marginTop: "12px", padding: "14px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px" }}>
                <div className="auth-field">
                  <label>Email</label>
                  <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} disabled={loading} />
                </div>
                <div className="auth-field">
                  <label>Password</label>
                  <input type="password" placeholder="••••••••" value={form.password} onChange={(e) => set("password", e.target.value)} disabled={loading} />
                </div>
                <div style={{ textAlign: "right", marginBottom: "14px" }}>
                  <span onClick={() => navigate("/forgot-password")} style={{ cursor: "pointer", color: "#c9a96e", fontSize: "0.88rem" }}>
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
          <div>
            <button
              type="button"
              style={{
                backgroundColor: "#3a5a20", color: "white", padding: "15px 20px",
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
              <div style={{ marginTop: "12px", padding: "20px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", textAlign: "center", color: "#9a95a8", fontSize: "14px" }}>
                Phone login coming soon
              </div>
            )}
          </div>
        </div>

        <p className="auth-switch" style={{ marginTop: "28px" }}>
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")} style={{ color: "#5476ea", fontWeight: "bold", cursor: "pointer" }}>
            Sign up here →
          </span>
        </p>
      </div>
    </div>
  );
}
