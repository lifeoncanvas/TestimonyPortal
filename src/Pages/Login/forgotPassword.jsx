import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/axiosConfig';
import './styles.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      setMessage(res.data.message || 'If an account with that email exists, a reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
        <h1>Forgot Password</h1>
        <p className="auth-sub">Enter your email to receive a reset link</p>
        
        {message && (
          <div className="auth-error" style={{ background: 'rgba(40, 167, 69, 0.12)', color: '#4ade80', borderColor: 'rgba(40, 167, 69, 0.25)' }}>
            {message}
          </div>
        )}
        {error && <div className="auth-error">{error}</div>}

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

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
          
          <p className="auth-switch" style={{ marginTop: '24px' }}>
            Remembered your password?{" "}
            <span onClick={() => navigate('/login')}>Back to Login →</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
