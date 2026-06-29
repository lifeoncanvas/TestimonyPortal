import { useState } from "react";
import { useNavigate } from "react-router";
import "./styles.css";
import api from "../../services/axiosConfig";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showKingschat, setShowKingschat] = useState(false);
  const [kingschatLoading, setKingschatLoading] = useState(false);

  const [tempKcEmail, setTempKcEmail] = useState("");
  const [tempKcName, setTempKcName] = useState("");

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

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleKingschatAuth = async () => {
    setError("");
    setKingschatLoading(true);
    const email = tempKcEmail || "kingschat_tester@kingschat.com";
    const name = tempKcName || (email === "kingschat_tester@kingschat.com" ? "KingsChat Member" : email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1));

    try {
      const res = await api.post("/api/auth/kingschat", {
        name: name,
        email: email,
        church: "Christ Embassy Virtual Church",
        zone: "Virtual Zone 1",
        country: "Nigeria",
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setShowKingschat(false);
      navigate("/");
    } catch (err) {
      setError("KingsChat login failed: " + (err.response?.data?.message || err.message));
    } finally {
      setKingschatLoading(false);
    }
  };

  const kcEmail = tempKcEmail || "kingschat_tester@kingschat.com";
  const kcName = tempKcName || (kcEmail === "kingschat_tester@kingschat.com"
    ? "KingsChat Member"
    : kcEmail.split("@")[0].charAt(0).toUpperCase() + kcEmail.split("@")[0].slice(1));
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
            onClick={() => setShowKingschat(true)}
            disabled={loading}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span className="kc-logo" style={{ fontSize: '1.2rem', opacity: 0.7 }}>💬</span> SIGN IN WITH KINGSCHAT</span>
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

      {/* KingsChat Modal */}
      {showKingschat && (
        <div className="kc-modal-overlay">
          <div className="kc-modal">
            <div className="kc-header">
              <span className="kc-icon">💬</span>
              <h2>KingsChat Secure Login</h2>
            </div>
            <div className="kc-body">
              <p>
                <strong>My Miracle Story</strong> is requesting permission to access your KingsChat profile details:
              </p>
              <div className="kc-field">
                <label>Enter KingsChat Email</label>
                <input
                  type="email"
                  placeholder="e.g. sharon@kingschat.com"
                  value={tempKcEmail}
                  onChange={(e) => setTempKcEmail(e.target.value)}
                />
              </div>
              <div className="kc-field">
                <label>Enter KingsChat Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sharon Shelke"
                  value={tempKcName}
                  onChange={(e) => setTempKcName(e.target.value)}
                />
              </div>
              <ul className="kc-permissions">
                <li>✓ Full Name ({kcName})</li>
                <li>✓ Email address ({kcEmail})</li>
                <li>✓ Church & Zone details</li>
              </ul>
              <p className="kc-disclaimer">
                By clicking Authorize, you agree to share this information to set up your account.
              </p>
            </div>
            <div className="kc-actions">
              <button
                className="kc-btn-cancel"
                onClick={() => setShowKingschat(false)}
                disabled={kingschatLoading}
              >
                Cancel
              </button>
              <button
                className="kc-btn-confirm"
                onClick={handleKingschatAuth}
                disabled={kingschatLoading}
              >
                {kingschatLoading ? "Authorizing..." : "Authorize & Sign In"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
