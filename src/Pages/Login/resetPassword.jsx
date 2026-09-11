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
    // Extract token from URL (e.g., ?token=XYZ)
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
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Create New Password</h2>
        <p className="login-subtitle">Please enter your new secure password</p>
        
        {message && <div className="alert-success" style={{color: '#28a745', marginBottom: '15px'}}>{message}</div>}
        {error && <div className="alert-error" style={{color: '#dc3545', marginBottom: '15px'}}>{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>New Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password" 
              required 
              disabled={!token}
            />
          </div>

          <div className="input-group">
            <label>Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password" 
              required 
              disabled={!token}
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading || !token}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
