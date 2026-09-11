import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/axiosConfig';
import './styles.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenParam = queryParams.get('token');
    if (tokenParam) {
        setToken(tokenParam);
    } else {
        setError('Invalid or missing reset token.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
        setError('Invalid token. Please request a new link.');
        return;
    }
    if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
    }
    if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await api.post('/api/auth/reset-password', { 
          token: token,
          newPassword: password 
      });
      setMessage(res.data.message || 'Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. The link may have expired.');
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
        <h1>Create New Password</h1>
        <p className="auth-sub">Please enter your new secure password</p>
        
        {message && (
          <div className="auth-error" style={{ background: 'rgba(40, 167, 69, 0.12)', color: '#4ade80', borderColor: 'rgba(40, 167, 69, 0.25)' }}>
            {message}
          </div>
        )}
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>New Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              required 
              disabled={!token || loading}
            />
          </div>

          <div className="auth-field">
            <label>Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••" 
              required 
              disabled={!token || loading}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading || !token} style={{ marginTop: '20px' }}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
