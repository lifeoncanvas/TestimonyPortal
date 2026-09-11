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

      // Save token and user details to localStorage
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



  const handleKingschatAuth = () => {
    setError("");
    setKingschatLoading(true);
    
    const clientId = process.env.REACT_APP_KINGSCHAT_CLIENT_ID || "4e67fd93-25ee-458b-9fde-6bcf6a1c5e9a";
    const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const loginUrl = `https://accounts.kingschat.online/log-in?clientId=${clientId}&origin=${sessionId}`;
    
    window.location.href = loginUrl;
  };
  const [loginMethod, setLoginMethod] = useState(null); // null, 'email', 'phone'

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

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-buttons-stack" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          <button
            type="button"
            className="kc-login-btn"
            style={{ backgroundColor: '#5476ea', color: 'white', padding: '15px', borderRadius: '10px', border: 'none', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            onClick={handleKingschatAuth}
            disabled={kingschatLoading || loading}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span className="kc-logo" style={{ fontSize: '1.2rem', opacity: 0.7 }}>💬</span> {kingschatLoading ? "REDIRECTING..." : "SIGN IN WITH KINGSCHAT"}</span>
            <span>→</span>
          </button>

          <div className="method-dropdown">
            <button
              type="button"
              className="email-login-btn"
              style={{ backgroundColor: '#292c53', color: 'white', padding: '15px', borderRadius: '10px', border: 'none', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', width: '100%' }}
              onClick={() => toggleMethod('email')}
              disabled={loading}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ display: 'inline-block', width: '18px', height: '18px', backgroundColor: 'white', borderRadius: '3px' }}></span> SIGN IN WITH EMAIL</span>
              <span>▼</span>
            </button>
            {loginMethod === 'email' && (
              <form onSubmit={handleSubmit} style={{ marginTop: '15px', padding: '10px', border: '1px solid #eee', borderRadius: '8px' }}>
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
                <div className="auth-forgot-password" style={{ textAlign: 'right', marginBottom: '15px' }}>
                  <span 
                    onClick={() => navigate("/forgot-password")} 
                    style={{ cursor: 'pointer', color: '#007bff', fontSize: '0.9rem' }}
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

          <div className="method-dropdown">
            <button
              type="button"
              className="phone-login-btn"
              style={{ backgroundColor: '#567030', color: 'white', padding: '15px', borderRadius: '10px', border: 'none', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', width: '100%' }}
              onClick={() => toggleMethod('phone')}
              disabled={loading}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ fontSize: '1.2rem' }}>📞</span> SIGN IN WITH PHONE</span>
              <span>▼</span>
            </button>
            {loginMethod === 'phone' && (
              <div style={{ marginTop: '15px', padding: '20px', border: '1px solid #eee', borderRadius: '8px', textAlign: 'center', color: '#666' }}>
                Phone login coming soon
              </div>
            )}
          </div>
        </div>

        <p className="auth-switch" style={{ marginTop: '30px' }}>
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")} style={{ color: '#5476ea', fontWeight: 'bold', cursor: 'pointer' }}>Sign up here →</span>
        </p>
      </div>

    </div>
  );
}
