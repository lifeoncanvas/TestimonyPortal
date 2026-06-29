import { useState } from "react";
import { useNavigate } from "react-router";
import "./styles.css";
import api from "../../services/axiosConfig";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFetchQuestion = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/auth/forgot-password", { email });
      setSecurityQuestion(res.data.securityQuestion);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch security question.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (!securityAnswer || !newPassword) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/reset-password", {
        email,
        securityAnswer,
        newPassword
      });
      // Successful reset
      alert("Password reset successfully. Please login with your new password.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Password reset failed. Incorrect answer?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-icon">✨</span>
          <h2>My Miracle Story</h2>
        </div>
        <h1>Reset Password</h1>
        <p className="auth-sub">Answer your security question to continue</p>

        {error && <div className="auth-error">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleFetchQuestion}>
            <div className="auth-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Checking..." : "Continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="auth-field">
              <label>Security Question</label>
              <div style={{ padding: '10px', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '10px', fontStyle: 'italic', color: 'var(--text-color)' }}>
                {securityQuestion}
              </div>
            </div>
            <div className="auth-field">
              <label>Your Answer</label>
              <input
                type="text"
                placeholder="Enter your answer"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="auth-field">
              <label>New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <p className="auth-switch">
          Remember your password?{" "}
          <span onClick={() => navigate("/login")}>Back to Login</span>
        </p>
      </div>
    </div>
  );
}
