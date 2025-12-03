
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
      {}
      <div className="login-card" style={{ animationDelay: '0.1s' }}>
        {}
        <div className="login-card__brand">
          <img src="/assets/bitchest_logo.png" alt="BitChest logo" className="login-card__logo" />
          <div>
            <h1>BitChest Access</h1>
            <p>Secure portal for administrators and clients</p>
          </div>
        </div>

        {}
        <form onSubmit={handleSubmit} className="form">
          {}
          <label className="form__label">
            Email address
            <input
              type="email"
              className="form__input"
              value={email}

              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
          </label>

          {}
          <label className="form__label">
            Password
            <input
              type="password"
              className="form__input"
              value={password}

              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              placeholder="Enter your password"
            />
          </label>

          {}
          {error ? <p className="form__error">{error}</p> : null}

          {}
          <button type="submit" className="button button--primary" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
