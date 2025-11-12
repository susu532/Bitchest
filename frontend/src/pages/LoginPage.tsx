import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import type { FormEvent } from 'react';

import { useAuth } from '../state/AuthContext';
import { useAppState } from '../state/AppStateProvider';

type LocationState = {
  from?: { pathname: string };
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const state = useAppState();
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
      setError(result.message ?? 'Unable to sign in. Please try again.');
      setIsSubmitting(false);
      return;
    }

    const target = (location.state as LocationState | null)?.from?.pathname;
    const user = state.users.find((candidate) => candidate.email === email.toLowerCase());

    if (target) {
      navigate(target, { replace: true });
    } else if (user?.role === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/client', { replace: true });
    }
  };

  return (
    <div className="page page--centered login-page">
      <div className="login-card" style={{ animationDelay: '0.1s' }}>
        <div className="login-card__brand">
          <img src="/assets/bitchest_logo.png" alt="BitChest logo" className="login-card__logo" />
          <div>
            <h1>BitChest Access</h1>
            <p>Secure portal for administrators and clients</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form">
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

          {error ? <p className="form__error">{error}</p> : null}

          <button type="submit" className="button button--primary" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="login-card__hint">
          <p>Prototype access:</p>
          <ul>
            <li>
              <strong>Admin</strong>: admin@bitchest.example / admin123
            </li>
            <li>
              <strong>Client</strong>: bruno@bitchest.example / bruno123
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

