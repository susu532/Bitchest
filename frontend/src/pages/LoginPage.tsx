import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { FormEvent } from 'react';
import { useAuth } from '../state/AuthContext';
import { useNotifications } from '../components/common/Notifications';
import Globe from '../components/common/globe';

type LocationState = {
  from?: { pathname: string };
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  const { addNotification } = useNotifications();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await login({ email, password });

    if (!result.success) {
      const errorMsg = result.message ?? 'Unable to sign in. Please try again.';
      setError(errorMsg);
      addNotification('Login Failed', 'error', errorMsg, 6000);
      setIsSubmitting(false);
      return;
    }

    addNotification('Welcome back!', 'success', `Signed in as ${email}`, 4000);

    const target = (location.state as LocationState | null)?.from?.pathname;

    setTimeout(() => {
      if (target) {
        navigate(target, { replace: true });
      } else if (user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/client', { replace: true });
      }
    }, 100);
  };

  return (
    <div className="modern-login">
      {/* Left Panel - Visual Hero */}
      <div className="modern-login__visual">
        {/* 3D Globe Background */}
        <Globe />
        <div className="modern-login__visual-overlay"></div>
        <div className="modern-login__visual-content">
          <div className="modern-login__brand">
            <img 
              src="/assets/bitchest_logo.png" 
              alt="BitChest" 
              className="modern-login__brand-logo"
            />
            <h1 className="modern-login__brand-name">BitChest</h1>
          </div>
          
          <div className="modern-login__hero-text">
            <h2 className="modern-login__headline">
              Your Gateway to
              <span className="modern-login__headline-accent"> Digital Assets</span>
            </h2>
            <p className="modern-login__tagline">
              Manage, track, and grow your cryptocurrency portfolio with institutional-grade security and real-time insights.
            </p>
          </div>

        
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="modern-login__form-panel">
        <div className="modern-login__form-container">
          <div className="modern-login__form-header">
            <h2 className="modern-login__form-title">Welcome back</h2>
            <p className="modern-login__form-subtitle">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="modern-login__form">
            {/* Email Field */}
            <div className="modern-input-group">
              <label htmlFor="email" className="modern-input-group__label">
                Email address
              </label>
              <div className="modern-input-wrapper">
                <div className="modern-input-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 4h14a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18 5l-8 6-8-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  className="modern-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="modern-input-group">
              <label htmlFor="password" className="modern-input-group__label">
                Password
              </label>
              <div className="modern-input-wrapper">
                <div className="modern-input-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 8h-1V6a4 4 0 10-8 0v2H5a1 1 0 00-1 1v8a1 1 0 001 1h10a1 1 0 001-1V9a1 1 0 00-1-1zM8 6a2 2 0 114 0v2H8V6z" fill="currentColor"/>
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="modern-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="modern-input-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14z" fill="currentColor"/>
                      <path d="M10 5c-3.866 0-7 3.582-7 5s3.134 5 7 5c1.726 0 3.306-.688 4.546-1.793l-1.42-1.42A5.978 5.978 0 0110 13c-2.21 0-4-1.79-4-4 0-1.202.53-2.282 1.37-3.017L5.95 4.563C4.726 5.49 3.667 6.683 3 8c0 0 1.5 3 5 4.5" fill="currentColor"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 5C6.134 5 3 8.582 3 10s3.134 5 7 5 7-3.582 7-5-3.134-5-7-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="modern-login__error">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 4v5M8 11v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              className="modern-login__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="modern-login__spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 10h8m0 0l-3-3m3 3l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="modern-login__footer">
            <div className="modern-login__security">
             
             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}