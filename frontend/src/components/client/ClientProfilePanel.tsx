import { useState } from 'react';

import type { FormEvent } from 'react';

import type { User } from '../../state/types';
import { useAppServices } from '../../state/AppStateProvider';
import { useAuth } from '../../state/AuthContext';
import { validateUserForm, validatePasswordChange } from '../../utils/validation';

type ClientProfilePanelProps = {
  user: User;
};

export default function ClientProfilePanel({ user }: ClientProfilePanelProps) {
  const { updateCurrentUserProfile } = useAppServices();
  const { changePassword, updateUser: updateAuthUser } = useAuth();

  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);

  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null);

  const handleProfileSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setProfileErrors({});

    const validation = validateUserForm(firstName, lastName, email);
    if (!validation.valid) {
      setProfileErrors(validation.errors);
      return;
    }

    try {
      await updateCurrentUserProfile({
        firstName,
        lastName,
        email: email.toLowerCase(),
      });
      // Update AuthContext immediately so the user sees changes in real-time
      updateAuthUser({
        firstName,
        lastName,
        email: email.toLowerCase(),
      });
      setProfileFeedback('Profile updated successfully.');
      setTimeout(() => setProfileFeedback(null), 4_000);
    } catch (error: any) {
      setProfileErrors({ submit: error.message || 'Failed to update profile.' });
    }
  };

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordErrors({});
    setPasswordFeedback(null);

    const validation = validatePasswordChange(currentPassword, newPassword, passwordConfirmation);
    if (!validation.valid) {
      setPasswordErrors(validation.errors);
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setPasswordFeedback('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setPasswordConfirmation('');
    } catch (error: any) {
      setPasswordErrors({ submit: error.message || 'Failed to change password' });
    }
  };

  return (
    <div className="panel">
      <section className="panel__section" style={{ animationDelay: '0.1s' }}>
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
              minLength={2}
              maxLength={50}
            />
          </label>
          <label className="form__label">
            Last name
            <input
              className="form__input"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              required
              minLength={2}
              maxLength={50}
            />
          </label>
          <label className="form__label form__label--full">
            Email
            <input
              type="email"
              className="form__input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              maxLength={255}
            />
          </label>

          {profileErrors.firstName ? <p className="form__error form__label--full">{profileErrors.firstName}</p> : null}
          {profileErrors.lastName ? <p className="form__error form__label--full">{profileErrors.lastName}</p> : null}
          {profileErrors.email ? <p className="form__error form__label--full">{profileErrors.email}</p> : null}
          {profileErrors.submit ? <p className="form__error form__label--full">{profileErrors.submit}</p> : null}

          <div className="form__actions form__label--full">
            <button type="submit" className="button button--primary">
              Save profile
            </button>
            {profileFeedback ? <p className="form__success">{profileFeedback}</p> : null}
          </div>
        </form>
      </section>

      <section className="panel__section" style={{ animationDelay: '0.2s' }}>
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
              minLength={6}
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
              placeholder="Min 8 chars: uppercase, lowercase, number, special char (@$!%*?&)"
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
          {passwordErrors.currentPassword ? <p className="form__error">{passwordErrors.currentPassword}</p> : null}
          {passwordErrors.newPassword ? <p className="form__error">{passwordErrors.newPassword}</p> : null}
          {passwordErrors.passwordConfirmation ? <p className="form__error">{passwordErrors.passwordConfirmation}</p> : null}
          {passwordErrors.submit ? <p className="form__error">{passwordErrors.submit}</p> : null}
          {passwordFeedback ? <p className="form__success">{passwordFeedback}</p> : null}
          <button type="submit" className="button button--secondary">
            Update password
          </button>
        </form>
      </section>
    </div>
  );
}

