import { useState } from "react";
import { useNavigate } from "react-router";
import "./styles.css";
import api from "../../services/axiosConfig";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    church: "",
    zone: "",
    country: "",
    city: "",
    securityQuestion: "",
    securityAnswer: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showKingschat, setShowKingschat] = useState(false);
  const [kingschatLoading, setKingschatLoading] = useState(false);

  const [tempKcEmail, setTempKcEmail] = useState("");
  const [tempKcName, setTempKcName] = useState("");

  const SECURITY_QUESTIONS = [
    "What is your mother's maiden name?",
    "What city were you born in?",
    "What was the name of your first pet?",
    "What is your favorite book?",
    "What is the name of the street you grew up on?"
  ];

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.church ||
      !form.zone ||
      !form.country ||
      !form.city ||
      !form.securityQuestion ||
      !form.securityAnswer
    ) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/auth/register", form);

      // Save token and user details to localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed.");
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
        church: form.church || "Christ Embassy Virtual Church",
        zone: form.zone || "Virtual Zone 1",
        country: form.country || "Nigeria",
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setShowKingschat(false);
      navigate("/");
    } catch (err) {
      setError("KingsChat registration failed: " + (err.response?.data?.message || err.message));
    } finally {
      setKingschatLoading(false);
    }
  };

  const kcEmail = tempKcEmail || "kingschat_tester@kingschat.com";
  const kcName = tempKcName || (kcEmail === "kingschat_tester@kingschat.com"
    ? "KingsChat Member"
    : kcEmail.split("@")[0].charAt(0).toUpperCase() + kcEmail.split("@")[0].slice(1));

  return (
    <div className="register-page">
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <div className="auth-logo">
          <span className="logo-icon">✨</span>
          <h2>My Miracle Story</h2>
        </div>
        <h1>Create Account</h1>
        <p className="auth-sub">Join and share what God has done</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              disabled={loading}
            />
          </div>
          
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

          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="auth-field" style={{ flex: 1 }}>
              <label>Country</label>
              <input
                type="text"
                placeholder="e.g. India"
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="auth-field" style={{ flex: 1 }}>
              <label>City</label>
              <input
                type="text"
                placeholder="e.g. Mumbai"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="auth-field" style={{ flex: 1 }}>
              <label>Zone</label>
              <input
                type="text"
                placeholder="e.g. Zone 4"
                value={form.zone}
                onChange={(e) => set("zone", e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="auth-field" style={{ flex: 1 }}>
              <label>Church</label>
              <input
                type="text"
                placeholder="e.g. Christ Embassy Lagos"
                value={form.church}
                onChange={(e) => set("church", e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Security Question (for password reset)</label>
            <select
              value={form.securityQuestion}
              onChange={(e) => set("securityQuestion", e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                backgroundColor: 'var(--surface-color)',
                color: 'var(--text-color)',
                marginBottom: '10px'
              }}
            >
              <option value="">Select a security question</option>
              {SECURITY_QUESTIONS.map((q, i) => (
                <option key={i} value={q}>{q}</option>
              ))}
            </select>
          </div>

          <div className="auth-field">
            <label>Security Answer</label>
            <input
              type="text"
              placeholder="Your answer"
              value={form.securityAnswer}
              onChange={(e) => set("securityAnswer", e.target.value)}
              disabled={loading}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading} style={{ marginTop: '10px' }}>
            {loading ? "Processing..." : "Create Account"}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          className="kingschat-btn"
          onClick={() => setShowKingschat(true)}
          disabled={loading}
        >
          <span className="kc-logo">💬</span> Register with KingsChat
        </button>

        <p className="auth-switch">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Sign In</span>
        </p>
      </div>

      {/* KingsChat Modal */}
      {showKingschat && (
        <div className="kc-modal-overlay">
          <div className="kc-modal">
            <div className="kc-header">
              <span className="kc-icon">💬</span>
              <h2>KingsChat Secure Registration</h2>
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
                {kingschatLoading ? "Authorizing..." : "Authorize & Register"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

