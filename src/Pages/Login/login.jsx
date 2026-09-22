import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import "./styles.css";
import api from "../../services/axiosConfig";

const KINGSCHAT_CLIENT_ID = "4e67fd93-25ee-458b-9fde-6bcf6a1c5e9a";
const KINGSCHAT_LOGIN_URL = `https://accounts.kingschat.online/log-in?clientId=${KINGSCHAT_CLIENT_ID}`;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState(null);
  const [kcStatus, setKcStatus] = useState(null); // 'polling' | 'success' | 'error'

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // ── Handle KingsChat callback from URL params ───────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const kcError = params.get("kc_error");
    const session = params.get("session");

    if (kcError) {
      setError("KingsChat sign-in failed. Please try again.");
      navigate("/login", { replace: true });
      return;
    }

    if (session) {
      // Fallback polling path (used if direct JWT redirect wasn't possible)
      setKcStatus("polling");
      let attempts = 0;
      const maxAttempts = 20;

      const poll = async () => {
        attempts++;
        try {
          const res = await api.get(`/api/auth/kingschat/poll/${session}`);
          if (res.status === 200 && res.data?.token) {
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            setKcStatus("success");
            const role = res.data.user?.role;
            window.location.replace(role === "ADMIN" ? "/admin" : "/");
            return;
          }
        } catch (err) {
          if (err.response?.status !== 202) {
            setKcStatus("error");
            setError("KingsChat sign-in failed. Please try again.");
            navigate("/login", { replace: true });
            return;
          }
        }

        if (attempts < maxAttempts) {
          setTimeout(poll, 1000);
        } else {
          setKcStatus("error");
          setError("KingsChat sign-in timed out. Please try again.");
          navigate("/login", { replace: true });
        }
      };

      poll();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // ── KingsChat official redirect flow ──────────────────────────────────────
  const handleKingschatLogin = () => {
    const sessionKey = "kc-" + Date.now();
    const loginUrl = `${KINGSCHAT_LOGIN_URL}&origin=${encodeURIComponent(sessionKey)}`;
    window.location.href = loginUrl;
  };

  const toggleMethod = (method) => {
    setLoginMethod((prev) => (prev === method ? null : method));
  };

  // ── Loading screen while processing ──────────────────────────────────────
  if (kcStatus === "polling") {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0a0a16 0%, #13132b 100%)",
        color: "white",
        fontFamily: "'Inter', sans-serif",
        gap: "20px",
      }}>
        <div style={{
          width: "56px", height: "56px", borderRadius: "50%",
          border: "3px solid rgba(201,169,110,0.15)",
          borderTopColor: "#c9a96e",
          animation: "kcSpin 0.8s linear infinite",
        }} />
        <h2 style={{ margin: 0, fontWeight: 600 }}>Signing you in with KingsChat...</h2>
        <p style={{ margin: 0, color: "#9a95a8", fontSize: "14px" }}>Please wait a moment</p>
        <style>{`@keyframes kcSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

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
            onClick={handleKingschatLogin}
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
