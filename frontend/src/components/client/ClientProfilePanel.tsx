import { useState } from 'react';

import type { FormEvent } from 'react';

import type { User } from '../../state/types';
import { useAppServices } from '../../state/AppStateProvider';
import { useAuth } from '../../state/AuthContext';

type ClientProfilePanelProps = {
  user: User;
};

export default function ClientProfilePanel({ user }: ClientProfilePanelProps) {
  const { updateUser } = useAppServices();
  const { changePassword } = useAuth();

  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);

  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null);

  const handleProfileSubmit = (event: FormEvent) => {
    event.preventDefault();
    updateUser({
      userId: user.id,
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
      },
    });
    setProfileFeedback('Profile updated successfully.');
    setTimeout(() => setProfileFeedback(null), 4_000);
  };

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordFeedback(null);

    if (currentPassword !== user.password) {
      setPasswordError('Current password is incorrect.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must contain at least 8 characters.');
      return;
    }

    if (newPassword !== passwordConfirmation) {
      setPasswordError('Confirmation does not match the new password.');
      return;
    }

    await changePassword(newPassword);
    setPasswordFeedback('Password updated successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setPasswordConfirmation('');
  };

  return (
    <div className="panel">
      <section className="panel__section">
        <header className="panel__header">
          <div>
            <h2>Personal information</h2>
            <p>Keep your contact information up to date for account notifications.</p>
          </div>
        </header>

        <form className="form form--two-column" onSubmit={handleProfileSubmit}>
          <label className="form__label">
            First name
            <input
              className="form__input"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              required
            />
          </label>
          <label className="form__label">
            Last name
            <input className="form__input" value={lastName} onChange={(event) => setLastName(event.target.value)} required />
          </label>
          <label className="form__label form__label--full">
            Email
            <input
              type="email"
              className="form__input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <div className="form__actions form__label--full">
            <button type="submit" className="button button--primary">
              Save profile
            </button>
            {profileFeedback ? <p className="form__success">{profileFeedback}</p> : null}
          </div>
        </form>
      </section>

      <section className="panel__section">
        <header className="panel__header">
          <div>
            <h3>Security</h3>
            <p>Update your password frequently to protect your funds.</p>
          </div>
        </header>

        <form className="form form--stacked" onSubmit={handlePasswordSubmit}>
          <label className="form__label">
            Current password
            <input
              type="password"
              className="form__input"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />
          </label>
          <label className="form__label">
            New password
            <input
              type="password"
              className="form__input"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              minLength={8}
            />
          </label>
          <label className="form__label">
            Confirm new password
            <input
              type="password"
              className="form__input"
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              required
              minLength={8}
            />
          </label>
          {passwordError ? <p className="form__error">{passwordError}</p> : null}
          {passwordFeedback ? <p className="form__success">{passwordFeedback}</p> : null}
          <button type="submit" className="button button--secondary">
            Update password
          </button>
        </form>
      </section>
    </div>
  );
}

