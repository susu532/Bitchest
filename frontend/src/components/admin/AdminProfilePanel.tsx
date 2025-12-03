import { useState } from 'react';

import type { FormEvent } from 'react';

import type { User } from '../../state/types';
import { useAppServices } from '../../state/AppStateProvider';
import { useAuth } from '../../state/AuthContext';
import { validateUserForm, validatePasswordChange } from '../../utils/validation';
import { useNotifications } from '../common/Notifications';

type AdminProfilePanelProps = {
  admin: User;
};

export default function AdminProfilePanel({ admin }: AdminProfilePanelProps) {
  const { updateCurrentUserProfile } = useAppServices();
  const { changePassword, updateUser: updateAuthUser } = useAuth();
  const { addNotification } = useNotifications();

  const [firstName, setFirstName] = useState(admin.firstName);
  const [lastName, setLastName] = useState(admin.lastName);
  const [email, setEmail] = useState(admin.email);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

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

      updateAuthUser({
        firstName,
        lastName,
        email: email.toLowerCase(),
      });
      setProfileMessage('Profile updated successfully.');

      addNotification(
        'Profile Updated',
        'success',
        'Your administrator profile has been updated successfully.',
        5000
      );
      setTimeout(() => setProfileMessage(null), 4_000);
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to update profile.';
      console.error('Failed to update profile:', error);
      setProfileErrors({ submit: errorMsg });

      addNotification('Update Failed', 'error', errorMsg, 6000);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordMessage(null);
    setPasswordErrors({});

    const validation = validatePasswordChange(currentPassword, newPassword);
    if (!validation.valid) {
      setPasswordErrors(validation.errors);
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMessage('Password updated. The change is effective immediately.');

      addNotification(
        'Password Changed',
        'success',
        'Your administrator password has been updated successfully.',
        5000
      );
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to change password';
      setPasswordErrors({ submit: errorMsg });

      addNotification('Password Change Failed', 'error', errorMsg, 6000);
    }
  };

  return (
    <div className="panel">
      <section className="panel__section" style={{ animationDelay: '0.1s' }}>
        <header>
          <h2>Your profile</h2>
          <p>Manage your administrator details. These details are visible to other staff members.</p>
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
              Save changes
            </button>
            {profileMessage ? <p className="form__success">{profileMessage}</p> : null}
          </div>
        </form>
      </section>

      <section className="panel__section" style={{ animationDelay: '0.2s' }}>
        <header>
          <h2>Security</h2>
          <p>Update your password regularly to keep BitChest secure.</p>
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
            />
          </label>

          {passwordErrors.newPassword ? <p className="form__error">{passwordErrors.newPassword}</p> : null}
          {passwordErrors.currentPassword ? <p className="form__error">{passwordErrors.currentPassword}</p> : null}
          {passwordErrors.submit ? <p className="form__error">{passwordErrors.submit}</p> : null}
          {passwordMessage ? <p className="form__success">{passwordMessage}</p> : null}

          <button type="submit" className="button button--secondary">
            Update password
          </button>
        </form>
      </section>
    </div>
  );
}

