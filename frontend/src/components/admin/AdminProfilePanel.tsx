import { useState } from 'react';

import type { FormEvent } from 'react';

import type { User } from '../../state/types';
import { useAppServices } from '../../state/AppStateProvider';
import { useAuth } from '../../state/AuthContext';

type AdminProfilePanelProps = {
  admin: User;
};

export default function AdminProfilePanel({ admin }: AdminProfilePanelProps) {
  const { updateUser } = useAppServices();
  const { changePassword } = useAuth();

  const [firstName, setFirstName] = useState(admin.firstName);
  const [lastName, setLastName] = useState(admin.lastName);
  const [email, setEmail] = useState(admin.email);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleProfileSubmit = (event: FormEvent) => {
    event.preventDefault();
    updateUser({
      userId: admin.id,
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
      },
    });
    setProfileMessage('Profile updated successfully.');
    setTimeout(() => setProfileMessage(null), 4_000);
  };

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);

    if (currentPassword !== admin.password) {
      setPasswordError('Current password is incorrect.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must contain at least 8 characters.');
      return;
    }

    await changePassword(newPassword);
    setPasswordMessage('Password updated. The change is effective immediately.');
    setCurrentPassword('');
    setNewPassword('');
  };

  return (
    <div className="panel">
      <section className="panel__section">
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
            />
          </label>

          <label className="form__label">
            Last name
            <input
              className="form__input"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              required
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
            />
          </label>

          <div className="form__actions form__label--full">
            <button type="submit" className="button button--primary">
              Save changes
            </button>
            {profileMessage ? <p className="form__success">{profileMessage}</p> : null}
          </div>
        </form>
      </section>

      <section className="panel__section">
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

          {passwordError ? <p className="form__error">{passwordError}</p> : null}
          {passwordMessage ? <p className="form__success">{passwordMessage}</p> : null}

          <button type="submit" className="button button--secondary">
            Update password
          </button>
        </form>
      </section>
    </div>
  );
}

