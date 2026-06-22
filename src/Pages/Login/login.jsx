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

  // Phone Login State
  const [loginMethod, setLoginMethod] = useState("email"); // "email" or "phone"
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [serverOtp, setServerOtp] = useState("");

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

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!phone) {
      setError("Please enter your phone number.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/auth/phone/send-otp", { phoneNumber: phone });
      setOtpSent(true);
      setServerOtp(res.data.code);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!otp) {
      setError("Please enter the OTP code.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/auth/phone/verify-otp", {
        phoneNumber: phone,
        otpCode: otp
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Invalid OTP code.");
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

        <div className="auth-tabs" style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
          <button
            type="button"
            className={`auth-tab ${loginMethod === "email" ? "active" : ""}`}
            style={{
              background: "none", border: "none", fontFamily: "inherit", fontSize: "14px", fontWeight: "600",
              color: loginMethod === "email" ? "var(--gold)" : "var(--muted)", cursor: "pointer",
              borderBottom: loginMethod === "email" ? "2px solid var(--gold)" : "none", paddingBottom: "5px"
            }}
            onClick={() => { setLoginMethod("email"); setError(""); }}
          >
            Email Login
          </button>
          <button
            type="button"
            className={`auth-tab ${loginMethod === "phone" ? "active" : ""}`}
            style={{
              background: "none", border: "none", fontFamily: "inherit", fontSize: "14px", fontWeight: "600",
              color: loginMethod === "phone" ? "var(--gold)" : "var(--muted)", cursor: "pointer",
              borderBottom: loginMethod === "phone" ? "2px solid var(--gold)" : "none", paddingBottom: "5px"
            }}
            onClick={() => { setLoginMethod("phone"); setError(""); }}
          >
            Phone Login
          </button>
        </div>

        {loginMethod === "email" ? (
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
        ) : (
          <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
            <div className="auth-field">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="e.g. +919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading || otpSent}
              />
            </div>
            {otpSent && (
              <>
                <div className="auth-field">
                  <label>Verification Code (OTP)</label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={loading}
                  />
                  {serverOtp && (
                    <small style={{ color: "var(--gold)", display: "block", marginTop: "5px", fontWeight: "600" }}>
                      Debug Test OTP Code: {serverOtp}
                    </small>
                  )}
                </div>
              </>
            )}
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Processing..." : otpSent ? "Verify & Sign In" : "Send OTP"}
            </button>
            {otpSent && (
              <button
                type="button"
                className="auth-btn"
                style={{ background: "none", color: "var(--muted)", border: "1px solid var(--border)", marginTop: "8px" }}
                onClick={() => { setOtpSent(false); setOtp(""); }}
              >
                Change Phone Number
              </button>
            )}
          </form>
        )}

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

