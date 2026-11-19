import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/SignIn.css';
import Logo from '../assets/picture/laundry-logo.png';

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(''); 
  const [isLoading, setIsLoading] = useState(false); 
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true); 

    const email = e.target.elements.email.value;
    const password = e.target.elements.password.value;
    const selectedRole = e.target.elements.role.value;

    if (!selectedRole) {
      setError('Please select a role.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: selectedRole }),
      });

      const data = await response.json();

      if (data.success) {
        // 🔒 SAVE THE TOKEN AND USER DATA TO LOCAL STORAGE
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userName', data.user.name);
        
        // 👇 THIS IS THE FIX: Save the User ID so the Profile can load!
        localStorage.setItem('userId', data.user.id); 

        const userData = {
          name: data.user.name || 'User',
          email: data.user.email,
          role: data.user.role,
        };

        if (selectedRole === 'Staff') {
          navigate('/staff-dashboard', { state: userData });
        } else {
          navigate('/customer-dashboard', { state: userData });
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to the server. Is the backend running?');
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="icon-wrapper">
          <img src={Logo} alt="Laundry Logo" className="brand-logo-inside" />
        </div>
        <h1 className="auth-title">Sign in with email</h1>
        <p className="auth-subtitle">
          Dirt Be Gone does your laundry because we love cash more than you do.
        </p>

        {error && <div style={{ color: 'red', marginBottom: '15px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="input-group">
            <span className="input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </span>
            <input type="email" name="email" placeholder="Email" required />
          </div>

          <div className="input-group">
            <span className="input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              required
            />
            <span className="input-icon-right" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              )}
            </span>
          </div>

          <div className="input-group">
            <select
              name="role"
              className="role-select"
              required
              defaultValue=""
            >
              <option value="" disabled>Select your role</option>
              <option value="Customer">Customer</option>
              <option value="Staff">Staff</option>
            </select>
          </div>

          <div className="forgot-password"><a href="#forgot">Forgot password?</a></div>
          
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Get Started'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/SignUp">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;