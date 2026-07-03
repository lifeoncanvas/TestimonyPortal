import { useState, useEffect } from "react";
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

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get("access_token");
      
      if (token) {
        window.history.pushState(null, null, " ");
        setKingschatLoading(true);
        
        fetch("https://connect.kingsch.at/developer/api/user/profile", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "api-key": process.env.REACT_APP_KINGSCHAT_API_KEY || "r+/XXOTHTlTtn2RbUwcclasYNw7mPBUvZgBZ1EclkwA="
          }
        })
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch KingsChat profile");
          return res.json();
        })
        .then(async (kingschatUserRaw) => {
          let userObj = kingschatUserRaw;
          if (kingschatUserRaw.profile) userObj = kingschatUserRaw.profile;
          else if (kingschatUserRaw.user) userObj = kingschatUserRaw.user;
          else if (kingschatUserRaw.data) userObj = kingschatUserRaw.data;
          
          if (userObj && userObj.id) {
             const name = `${userObj.first_name || ""} ${userObj.last_name || ""}`.trim() || "KingsChat User";
             const email = userObj.email || `${userObj.id}@kingschat.com`;
             
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
                navigate("/");
             } catch (err) {
                setError("KingsChat registration failed: " + (err.response?.data?.message || err.message));
                setKingschatLoading(false);
             }
          } else {
             throw new Error("Could not extract user details from KingsChat");
          }
        })
        .catch(err => {
          console.error(err);
          setError("KingsChat authentication error: " + err.message);
          setKingschatLoading(false);
        });
      }
    }
  }, [navigate, form.church, form.zone, form.country]);

  const handleKingschatAuth = () => {
    setError("");
    setKingschatLoading(true);
    
    const clientId = process.env.REACT_APP_KINGSCHAT_CLIENT_ID || "5510380c-caac-4baa-ad0c-288dcdffaf1f";
    const redirectUri = window.location.origin + "/register";
    const scopes = encodeURIComponent('["authenticate", "profile"]');
    const authUrl = `https://accounts.kingsch.at/?client_id=${clientId}&scopes=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = authUrl;
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

