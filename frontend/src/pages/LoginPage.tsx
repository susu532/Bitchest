import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { FormEvent } from 'react';
import { useAuth } from '../state/AuthContext';
import { useNotifications } from '../components/common/Notifications';

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
    <div className="page page--centered login-page">
      {/* Branding Section */}
      <div className="login-page__branding">
        <div className="login-branding__content">
          <img 
            src="/assets/bitchest_logo.png" 
            alt="BitChest logo" 
            className="login-branding__logo" 
          />
          <h1 className="login-branding__title">BitChest</h1>
          <p className="login-branding__subtitle">
            Your secure gateway to cryptocurrency portfolio management
          </p>
          
          {/* Feature highlights */}
          <div className="login-branding__features">
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <span className="feature-text">Bank-level Security</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span className="feature-text">Real-time Updates</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span className="feature-text">Advanced Analytics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="login-page__form-container">
        <div className="login-card">
          <div className="login-card__header">
            <h2>Welcome Back</h2>
            <p>Sign in to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="form">
            {/* Email Input with Floating Label */}
            <div className="form__group">
              <input
                type="email"
                id="email"
                className={`form__input form__input--floating ${email ? 'form__input--has-value' : ''}`}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                placeholder=" "
              />
              <label htmlFor="email" className="form__label form__label--floating">
                Email Address
              </label>
              <div className="form__input-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 4h14a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18 5l-8 6-8-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Password Input with Floating Label & Toggle */}
            <div className="form__group">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className={`form__input form__input--floating ${password ? 'form__input--has-value' : ''}`}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                placeholder=" "
              />
              <label htmlFor="password" className="form__label form__label--floating">
                Password
              </label>
              <div className="form__input-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 8h-1V6a4 4 0 10-8 0v2H5a1 1 0 00-1 1v8a1 1 0 001 1h10a1 1 0 001-1V9a1 1 0 00-1-1zM8 6a2 2 0 114 0v2H8V6z" fill="currentColor"/>
                </svg>
              </div>
              <button
                type="button"
                className="form__toggle-password"
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

            {/* Error Message */}
            {error && <div className="form__error">{error}</div>}

            {/* Submit Button */}
            <button 
              type="submit" 
              className="button button--primary button--full-width" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="button__spinner"></span>
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="login-card__footer">
            <p className="security-note">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 1l6 2v5c0 3.5-2.5 6.5-6 7-3.5-.5-6-3.5-6-7V3l6-2z" fill="currentColor" opacity="0.3"/>
              </svg>
              Protected by 256-bit SSL encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
