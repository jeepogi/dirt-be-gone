import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/SignIn.css'; 
import Logo from '../assets/picture/laundry-logo.png';

/* ---------- Icons ---------- */
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

/* ✅ Must match the backend regex */
const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // 🔔 Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // 🧠 Password Strength Logic
  const calculateStrength = (pass) => {
    let score = 0;
    if (!pass) return score;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1; 
    if (/[0-9]/.test(pass)) score += 1; 
    if (/[^A-Za-z0-9]/.test(pass)) score += 1; 
    return score; 
  };

  const strength = calculateStrength(password);
  
  const getStrengthColor = () => {
    if (password.length === 0) return '#e5e7eb'; 
    if (strength <= 1) return '#ef4444'; 
    if (strength === 2) return '#f59e0b'; 
    if (strength === 3) return '#3b82f6'; 
    return '#10b981'; 
  };

  const getStrengthText = () => {
    if (password.length === 0) return '';
    if (strength <= 1) return 'Weak';
    if (strength === 2) return 'Fair';
    if (strength === 3) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const fullName = e.target.elements.fullName.value.trim();
    const email = e.target.elements.email.value.trim();
    const role = e.target.elements.role.value;

    // 🛑 Frontend Validation
    if (!GMAIL_REGEX.test(email)) {
      setError('Please enter a valid Gmail address (e.g., user@gmail.com).');
      showToast('Please enter a valid Gmail address.', 'error');
      setIsLoading(false);
      return;
    }

    if (strength < 3) {
      setError('Please choose a stronger password (at least 8 characters, 1 uppercase, 1 number).');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, email, password, role }),
      });

      const data = await response.json();

      if (data.success) {
        // 👇 Show the custom toast instead of alert()
        showToast('Account created successfully! Redirecting...', 'success');
        
        // Wait 2 seconds before redirecting so the user sees the message
        setTimeout(() => {
          navigate('/signin', { state: { email: email } });
        }, 2000);
      } else {
        setError(data.message || 'Registration failed');
        showToast(data.message || 'Registration failed', 'error');
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to the server.');
      showToast('Could not connect to the server.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      
      {/* 🍞 CUSTOM TOAST NOTIFICATION */}
      <div
        style={{
          position: 'fixed', top: '20px', right: '20px', padding: '12px 24px', borderRadius: '8px',
          backgroundColor: toast.type === 'error' ? '#ef4444' : '#10b981',
          color: 'white', fontWeight: '600', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 9999,
          transition: 'all 0.3s ease', transform: toast.show ? 'translateX(0)' : 'translateX(150%)',
          opacity: toast.show ? 1 : 0,
        }}
      >
        {toast.message}
      </div>

      <div className="auth-card">
        <div className="icon-wrapper">
          <img src={Logo} alt="Laundry Logo" className="brand-logo-inside" />
        </div>

        <h1 className="auth-title">Create an account</h1>
        <p className="auth-subtitle">
          Join us today. Create an account to get started for free.
        </p>

        {error && <div style={{ color: 'red', marginBottom: '15px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="name-row">
            <div className="input-group">
              <span className="input-icon"><UserIcon /></span>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                required
                style={{ paddingLeft: '44px' }}
              />
            </div>

            <div className="input-group select-group">
              <select name="role" className="role-select" required defaultValue="">
                <option value="" disabled>Select your role</option>
                <option value="Customer">Customer</option>
                <option value="Staff">Staff</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <span className="input-icon"><MailIcon /></span>
            <input
              type="email"
              name="email"
              placeholder="Email (e.g., user@gmail.com)"
              required
              pattern="^[a-zA-Z0-9._%+-]+@gmail\.com$"
              title="Please enter a valid Gmail address (e.g., user@gmail.com)"
              style={{ paddingLeft: '44px' }}
            />
          </div>

          {/* Password Input */}
          <div className="input-group">
            <span className="input-icon"><LockIcon /></span>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              autoComplete="new-password"
              required
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              style={{ paddingLeft: '44px' }}
            />
            <span
              className="input-icon-right"
              onClick={() => setShowPassword((v) => !v)}
              role="button"
            >
              {showPassword ? <EyeIcon /> : <EyeOffIcon />}
            </span>
          </div>

          {/* 🔥 Password Strength Indicator */}
          <div style={{ marginTop: '-8px', marginBottom: '10px', padding: '0 5px' }}>
            <div style={{ display: 'flex', gap: '4px', height: '4px', marginBottom: '4px' }}>
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  style={{
                    flex: 1,
                    backgroundColor: strength >= level ? getStrengthColor() : '#e5e7eb',
                    borderRadius: '2px',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
            {password.length > 0 && (
              <p style={{ fontSize: '12px', color: getStrengthColor(), textAlign: 'right', margin: 0, fontWeight: '600' }}>
                {getStrengthText()}
              </p>
            )}
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/signin">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;