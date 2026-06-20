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
    const email = form.email || "kingschat_tester@kingschat.com";
    const password = "KingschatPassword123!";
    const emailPrefix = email.split("@")[0];
    const name = email === "kingschat_tester@kingschat.com"
      ? "KingsChat Member"
      : emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

    try {
      let res;
      try {
        // Try registering a default Kingschat user
        res = await api.post("/api/auth/register", {
          name: name,
          email: email,
          password: password,
          church: "Christ Embassy Virtual Church",
          zone: "Virtual Zone 1",
          country: "Nigeria",
        });
      } catch (regErr) {
        // If already registered, log them in
        res = await api.post("/api/auth/login", {
          email: email,
          password: password,
        });
      }

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

  const kcEmail = form.email || "kingschat_tester@kingschat.com";
  const kcName = kcEmail === "kingschat_tester@kingschat.com"
    ? "KingsChat Member"
    : kcEmail.split("@")[0].charAt(0).toUpperCase() + kcEmail.split("@")[0].slice(1);

  return (
    <div className="login-page">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="auth-sub">Sign in to your account</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
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
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
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
          <span className="kc-logo">💬</span> Sign In with KingsChat
        </button>

        <p className="auth-switch">
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")}>Register</span>
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
              <ul>
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

