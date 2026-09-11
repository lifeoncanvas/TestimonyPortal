import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/axiosConfig';
import './login.css'; // Reusing login styles

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
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Forgot Password</h2>
        <p className="login-subtitle">Enter your email to receive a reset link</p>
        
        {message && <div className="alert-success" style={{color: '#28a745', marginBottom: '15px'}}>{message}</div>}
        {error && <div className="alert-error" style={{color: '#dc3545', marginBottom: '15px'}}>{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email" 
              required 
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
          
          <div className="register-link" style={{marginTop: '20px', textAlign: 'center'}}>
            Remembered your password? <span onClick={() => navigate('/login')} style={{cursor: 'pointer', color: '#007bff'}}>Back to Login</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
