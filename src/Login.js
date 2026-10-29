import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Login.css';
import Logo from './laundry-logo.png'; 

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const signupName = location.state?.name || 'User';
  const signupEmail = location.state?.email || 'user@example.com';

  const handleLogin = (e) => {
    e.preventDefault();
    const selectedRole = e.target.elements.loginRole.value;
    
    if (selectedRole === 'Admin' || selectedRole === 'Staff') {
      navigate('/admin-dashboard', { state: { name: signupName, email: signupEmail, role: selectedRole } });
    } else {
      navigate('/customer-dashboard', { state: { name: signupName, email: signupEmail, role: selectedRole } });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="icon-wrapper">
          <img src={Logo} alt="Laundry Logo" className="brand-logo-inside" />
        </div>
        <h1 className="auth-title">Sign in with email</h1>
        <p className="auth-subtitle">Make a new doc to bring your words, data, and teams together. For free</p>
        
        <form className="auth-form" onSubmit={handleLogin}>
          {/* Email Input with Icon */}
          <div className="input-group">
            <span className="input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </span>
            <input type="email" placeholder="Email" required />
          </div>

          {/* Password Input with Lock Icon and Eye Toggle */}
          <div className="input-group">
            <span className="input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </span>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              required 
            />
            <span className="input-icon-right" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                // Eye Open Icon
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              ) : (
                // Eye Closed Icon
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              )}
            </span>
          </div>

          <div className="input-group">
            <select name="loginRole" className="role-select" required defaultValue="Customer">
              <option value="Customer">Customer</option>
              <option value="Staff">Staff</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          
          <div className="forgot-password"><a href="#forgot">Forgot password?</a></div>
          <button type="submit" className="submit-btn">Get Started</button>
        </form>
        <div className="auth-footer">Don't have an account? <Link to="/signup">Sign up</Link></div>
      </div>
    </div>
  );
};

export default Login;