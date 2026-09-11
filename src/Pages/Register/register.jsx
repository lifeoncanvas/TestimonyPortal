import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import "./styles.css";
import api from "../../services/axiosConfig";
import kingsChatWebSdk from "kingschat-web-sdk";
import "kingschat-web-sdk/dist/stylesheets/style.min.css";

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

  const [kingschatLoading, setKingschatLoading] = useState(false);

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

      if (res.data.user && res.data.user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/profile");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleKingschatAuth = () => {
    setError("");
    setKingschatLoading(true);

    const clientId = "4e67fd93-25ee-458b-9fde-6bcf6a1c5e9a";

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
            if (res.data.user && res.data.user.role === "ADMIN") {
              window.location.href = "/admin";
            } else {
              window.location.href = "/profile";
            }
          } catch (err) {
            setError(err.response?.data?.message || "KingsChat registration failed on the server.");
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
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                backgroundColor: '#161821',
                color: '#ffffff',
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
          onClick={handleKingschatAuth}
          disabled={kingschatLoading || loading}
        >
          <span className="kc-logo">💬</span> {kingschatLoading ? "Redirecting to KingsChat..." : "Register with KingsChat"}
        </button>

        <p className="auth-switch">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Sign In</span>
        </p>
      </div>

    </div>
  );
}

