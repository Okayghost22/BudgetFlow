import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Auth.css';

export default function Auth() {
  const [login, setLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // ✅ Handles form submission for login/register
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (login) {
        // ✅ LOGIN FLOW
        console.log('🔐 Login attempt:', email);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/login`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          }
        );

        const data = await response.json();
        console.log('📨 Login response:', data);

        if (response.ok && data.token) {
          console.log('✅ Login successful');

          // ✅ CRITICAL: Save token to localStorage
          localStorage.setItem('token', data.token);
          console.log('💾 Token saved to localStorage');

          // ✅ CRITICAL: Save user data to localStorage
          if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
            console.log('💾 User data saved to localStorage:', data.user);
          }

          // Check profile completion
          const pcRes = await fetch(
            `${import.meta.env.VITE_API_URL}/user/profile-complete`,
            {
              headers: { Authorization: `Bearer ${data.token}` }
            }
          );

          const pcData = await pcRes.json();
          console.log('📝 Profile completion status:', pcData);

          if (pcRes.ok && pcData.profileComplete) {
            console.log('✅ Profile complete, navigating to dashboard');
            navigate('/dashboard');
          } else {
            console.log('⚠️ Profile incomplete, navigating to profile-setup');
            navigate('/profile-setup');
          }
        } else {
          console.error('❌ Login failed:', data.error);
          setError(data.error || 'Login failed');
        }
      } else {
        // ✅ REGISTER FLOW
        console.log('📝 Registration attempt:', email);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/register`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
          }
        );

        const data = await response.json();
        console.log('📨 Registration response:', data);

        if (response.ok) {
          console.log('✅ Registration successful');
          alert('Registration successful! Please log in.');
          
          // Clear form and switch to login
          setName('');
          setEmail('');
          setPassword('');
          setLogin(true);
        } else {
          console.error('❌ Registration failed:', data.error);
          setError(data.error || 'Registration failed');
        }
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* ✅ Back to Home Button - Top Right */}
      <motion.button
        className="btn-back-to-home"
        onClick={() => navigate('/')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Go back to home page"
      >
        ← Back to Home
      </motion.button>

      {/* ✅ Centered Auth Container */}
      <motion.div
        className="auth-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-box">
          {/* ✅ Header with Icon */}
          <div className="auth-header">
            <span className="auth-icon">{login ? '🔐' : '📝'}</span>
            <h2 className="auth-title">
              {login ? 'Login' : 'Register'}
            </h2>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Name field (only for register) */}
            {!login && (
              <motion.div
                className="form-group"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g., Shivam Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!login}
                />
              </motion.div>
            )}

            {/* Email field */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password field */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="error-message"
              >
                ⚠️ {error}
              </motion.div>
            )}

            {/* Submit button */}
            <motion.button
              type="submit"
              className="btn-submit"
              disabled={
                loading ||
                (!login && !name) ||
                !email ||
                !password
              }
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span className="loading-state">
                  <span className="spinner">⏳</span>
                  {login ? 'Logging in...' : 'Registering...'}
                </span>
              ) : login ? (
                '🔐 Login'
              ) : (
                '✅ Register'
              )}
            </motion.button>
          </form>

          {/* Toggle between login/register */}
          <div className="auth-toggle">
            {login ? (
              <>
                <span>Don't have an account? </span>
                <motion.button
                  className="toggle-btn"
                  onClick={() => {
                    setLogin(false);
                    setError('');
                    setName('');
                    setEmail('');
                    setPassword('');
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  Register here
                </motion.button>
              </>
            ) : (
              <>
                <span>Already have an account? </span>
                <motion.button
                  className="toggle-btn"
                  onClick={() => {
                    setLogin(true);
                    setError('');
                    setName('');
                    setEmail('');
                    setPassword('');
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  Login here
                </motion.button>
              </>
            )}
          </div>

          {/* Info message */}
          <div className="auth-info">
            💡 {login ? 'Login to access your budget dashboard' : 'Create an account to get started with BudgetFlow'}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
