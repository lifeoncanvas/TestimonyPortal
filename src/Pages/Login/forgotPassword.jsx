import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/axiosConfig';
import './styles.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      setMessage(res.data.message || 'A reset link has been sent to your inbox.');
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">
          <span className="logo-icon">✨</span>
          <h2>My Miracle Story</h2>
        </div>

        {!sent ? (
          <>
            {/* Icon & Header */}
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(201,169,110,0.15) 0%, rgba(201,169,110,0.05) 100%)',
                border: '1px solid rgba(201,169,110,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '26px',
                boxShadow: '0 0 30px rgba(201,169,110,0.12)',
              }}>
                🔐
              </div>
            </div>

            <h1>Forgot Password?</h1>
            <p className="auth-sub">
              No worries — enter your email and we'll send you a secure reset link.
            </p>

            {error && (
              <div className="auth-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="auth-field">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" className="auth-btn" disabled={loading || !email}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{
                      width: '16px', height: '16px',
                      border: '2px solid rgba(15,15,28,0.3)',
                      borderTopColor: '#0f0f1c',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 0.7s linear infinite',
                    }} />
                    Sending...
                  </span>
                ) : 'Send Reset Link'}
              </button>
            </form>

            <p className="auth-switch" style={{ marginTop: '28px' }}>
              Remembered your password?{' '}
              <span onClick={() => navigate('/login')}>Back to Login →</span>
            </p>
          </>
        ) : (
          <>
            {/* Success State */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(74,222,128,0.15) 0%, rgba(74,222,128,0.05) 100%)',
                border: '1px solid rgba(74,222,128,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '32px',
                boxShadow: '0 0 30px rgba(74,222,128,0.12)',
                animation: 'authFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}>
                ✉️
              </div>

              <h1 style={{ marginBottom: '10px' }}>Check Your Inbox</h1>
              <p className="auth-sub" style={{ marginBottom: '24px' }}>
                We've sent a password reset link to{' '}
                <span style={{ color: '#c9a96e', fontWeight: '700' }}>{email}</span>
              </p>

              <div style={{
                background: 'rgba(74,222,128,0.07)',
                border: '1px solid rgba(74,222,128,0.2)',
                borderRadius: '14px',
                padding: '16px 18px',
                textAlign: 'left',
                marginBottom: '28px',
              }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#9a95a8', lineHeight: '1.7' }}>
                  💡 <strong style={{ color: '#f0ecf8' }}>Tip:</strong> Check your spam or junk folder if you don't see it within a minute.
                </p>
              </div>

              <button
                className="auth-btn"
                onClick={() => { setSent(false); setEmail(''); setMessage(''); }}
                style={{ marginTop: 0 }}
              >
                Try a Different Email
              </button>

              <p className="auth-switch" style={{ marginTop: '20px' }}>
                <span onClick={() => navigate('/login')}>← Back to Login</span>
              </p>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
