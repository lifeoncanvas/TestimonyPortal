import { useState } from "react";
import { useNavigate } from "react-router";
import "./styles.css";
import api from "../../services/axiosConfig";

const KINGSCHAT_CLIENT_ID = "4e67fd93-25ee-458b-9fde-6bcf6a1c5e9a";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [kingschatLoading, setKingschatLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState(null);

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
        navigate("/profile");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  // ── KingsChat SDK flow ─────────────────────────────────────────────────────
  const handleKingschatAuth = () => {
    setError("");
    setKingschatLoading(true);

    const clientId = "4e67fd93-25ee-458b-9fde-6bcf6a1c5e9a";

    // Use Kingschat Web SDK which opens a popup
    import("kingschat-web-sdk").then(({ default: kingsChatWebSdk }) => {
      kingsChatWebSdk
        .login({ clientId, scopes: ["authenticate", "profile"] })
        .then(async (tokenResponse) => {
          const { accessToken, user: kcUser } = tokenResponse;

          try {
            const res = await api.post("/api/auth/kingschat/token", {
              token: accessToken,
              email: kcUser?.email || null,
              firstName: kcUser?.first_name || kcUser?.firstName || null,
              lastName: kcUser?.last_name || kcUser?.lastName || null,
              username: kcUser?.username || null,
            });

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            if (res.data.user?.role === "ADMIN") {
              window.location.href = "/admin";
            } else {
              window.location.href = "/profile";
            }
          } catch (err) {
            setError(err.response?.data?.message || "Server verification failed.");
            setKingschatLoading(false);
          }
        })
        .catch((err) => {
          const msg = err?.message || String(err) || "";
          if (msg.toLowerCase().includes("cancel") || msg.toLowerCase().includes("closed")) {
            setError("Sign-in was cancelled. Please make sure to allow the popup.");
          } else {
            setError("KingsChat sign-in failed. Please try again.");
          }
          setKingschatLoading(false);
        });
    });
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

          {/* ── KingsChat ── */}
          <button
            type="button"
            style={{
              background: "linear-gradient(135deg, #4a69dd 0%, #3a55c4 100%)",
              color: "white", padding: "15px 20px",
              borderRadius: "10px", border: "none", fontWeight: "bold",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              cursor: "pointer", width: "100%",
              boxShadow: "0 4px 14px rgba(74,105,221,0.35)",
              transition: "all 0.2s ease",
            }}
            onClick={handleKingschatAuth}
            disabled={loading}
            onMouseOver={(e) => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img
                src="https://kingschat.online/favicon.ico"
                alt=""
                style={{ width: "20px", height: "20px", borderRadius: "4px" }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
              SIGN IN WITH KINGSCHAT
            </span>
            <span style={{ fontSize: "18px" }}>→</span>
          </button>

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
