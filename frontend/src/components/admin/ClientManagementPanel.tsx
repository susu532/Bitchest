import { useMemo, useState } from 'react';

import type { FormEvent } from 'react';

import { useAppServices, useAppState } from '../../state/AppStateProvider';
import type { User } from '../../state/types';
import { summarizeHoldings, enrichHoldingsWithPrices } from '../../utils/wallet';
import { validateUserForm } from '../../utils/validation';

type ClientManagementPanelProps = {
  adminId: string;
  users: User[];
};

type EditableUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export default function ClientManagementPanel({ users, adminId }: ClientManagementPanelProps) {
  const { clientAccounts, cryptoAssets } = useAppState();
  const { createClient, updateUser, deleteUser } = useAppServices();

  const [isCreating, setIsCreating] = useState(false);
  const [creationData, setCreationData] = useState({ firstName: '', lastName: '', email: '' });
  const [creationFeedback, setCreationFeedback] = useState<string | null>(null);
  const [creationErrors, setCreationErrors] = useState<Record<string, string>>({});

  const [editingUser, setEditingUser] = useState<EditableUser | null>(null);
  const [editFeedback, setEditFeedback] = useState<string | null>(null);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const clients = useMemo(
    () => users.filter((user) => user.role === 'client'),
    [users],
  );

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setCreationErrors({});

    const validation = validateUserForm(
      creationData.firstName,
      creationData.lastName,
      creationData.email,
    );
    if (!validation.valid) {
      setCreationErrors(validation.errors);
      return;
    }

    const exists = users.some((user) => user.email.toLowerCase() === creationData.email.toLowerCase());
    if (exists) {
      setCreationErrors({ email: 'A user with this email already exists. Choose another email address.' });
      return;
    }
    try {
      const result = await createClient(creationData);
      setCreationFeedback(
        `Client created successfully. Temporary password: ${result.tempPassword} (share securely with the client).`,
      );
      setCreationErrors({});
      setCreationData({ firstName: '', lastName: '', email: '' });
      setIsCreating(false);
    } catch (error: any) {
      setCreationErrors({ submit: error.message || 'Failed to create client' });
    }
  };

  const handleEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingUser) {
      return;
    }
    setEditErrors({});

    const validation = validateUserForm(
      editingUser.firstName,
      editingUser.lastName,
      editingUser.email,
    );
    if (!validation.valid) {
      setEditErrors(validation.errors);
      return;
    }

    const exists = users.some(
      (user) => user.email.toLowerCase() === editingUser.email.toLowerCase() && user.id !== editingUser.id,
    );
    if (exists) {
      setEditErrors({ email: 'This email is already used by another client.' });
      return;
    }

    try {
      await updateUser({
        userId: editingUser.id,
        data: {
          firstName: editingUser.firstName,
          lastName: editingUser.lastName,
          email: editingUser.email.toLowerCase(),
        },
      });
      setEditFeedback('Client updated successfully.');
      setEditingUser(null);
      setEditErrors({});
    } catch (error: any) {
      setEditErrors({ submit: error.message || 'Failed to update client' });
      console.error('Failed to update client:', error);
    }
  };

  const handleDelete = async (userId: string) => {
    const target = users.find((user) => user.id === userId);
    if (!target) {
      return;
    }

    const confirmation = window.confirm(
      `Are you sure you want to remove ${target.firstName} ${target.lastName}? This action will delete their wallet information.`,
    );

    if (confirmation) {
      try {
        await deleteUser(userId);
      } catch (error: any) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const renderClientBalance = (client: User) => {
    const account = clientAccounts[client.id];
    if (!account) {
      return '€0.00';
    }

    const holdings = summarizeHoldings(account.transactions);
    const enriched = enrichHoldingsWithPrices(holdings, cryptoAssets);
    const totalValue = enriched.reduce((acc, holding) => acc + holding.currentValue, 0);
    const total = totalValue + account.balanceEUR;
    return `€${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="panel">
      <section className="panel__section" style={{ animationDelay: '0.1s' }}>
        <header className="panel__header">
          <div>
            <h2>Clients</h2>
            <p>Manage all BitChest client accounts. Passwords are never displayed to maintain confidentiality.</p>
          </div>
          <button
            type="button"
            className="button button--primary"
            onClick={() => setIsCreating((previous) => !previous)}
          >
            {isCreating ? 'Cancel' : 'New client'}
          </button>
        </header>

        {creationFeedback ? <p className="form__success">{creationFeedback}</p> : null}
        {Object.entries(creationErrors).map(([key, error]) => (
          <p key={key} className="form__error">{error}</p>
        ))}

        {isCreating ? (
          <form className="form form--three-column" onSubmit={handleCreate}>
            <label className="form__label">
              First name
              <input
                className="form__input"
                value={creationData.firstName}
                onChange={(event) =>
                  setCreationData((previous) => ({ ...previous, firstName: event.target.value }))
                }
                required
                minLength={2}
                maxLength={50}
              />
            </label>
            <label className="form__label">
              Last name
              <input
                className="form__input"
                value={creationData.lastName}
                onChange={(event) => setCreationData((previous) => ({ ...previous, lastName: event.target.value }))}
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
                value={creationData.email}
                onChange={(event) => setCreationData((previous) => ({ ...previous, email: event.target.value }))}
                required
                maxLength={255}
              />
            </label>
            <div className="form__actions form__label--full">
              <button type="submit" className="button button--secondary">
                Create client
              </button>
            </div>
          </form>
        ) : null}
      </section>

      <section className="panel__section" style={{ animationDelay: '0.2s' }}>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Wallet value</th>
                <th>Joined</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table__empty">
                    No clients yet. Create your first client to get started.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id}>
                  <td>
                    <span className="table__primary-text">{`${client.firstName} ${client.lastName}`}</span>
                    <span className="table__secondary-text">ID: {client.id}</span>
                  </td>
                  <td>{client.email}</td>
                  <td>{renderClientBalance(client)}</td>
                  <td>{new Date(client.createdAt).toLocaleDateString()}</td>
                  <td className="table__actions">
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() =>
                        setEditingUser({
                          id: client.id,
                          firstName: client.firstName,
                          lastName: client.lastName,
                          email: client.email,
                        })
                      }
                    >
                      Edit
                    </button>
                    {client.id !== adminId ? (
                      <button type="button" className="button button--danger" onClick={() => handleDelete(client.id)}>
                        Delete
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </section>

      {editingUser ? (
        <section className="panel__section" style={{ animationDelay: '0.3s' }}>
          <header>
            <h3>Edit client</h3>
          </header>

          {editFeedback ? <p className="form__success">{editFeedback}</p> : null}
          {Object.entries(editErrors).map(([key, error]) => (
            <p key={key} className="form__error">{error}</p>
          ))}

          <form className="form form--three-column" onSubmit={handleEdit}>
            <label className="form__label">
              First name
              <input
                className="form__input"
                value={editingUser.firstName}
                onChange={(event) =>
                  setEditingUser((previous) =>
                    previous ? { ...previous, firstName: event.target.value } : previous,
                  )
                }
                required
                minLength={2}
                maxLength={50}
              />
            </label>
            <label className="form__label">
              Last name
              <input
                className="form__input"
                value={editingUser.lastName}
                onChange={(event) =>
                  setEditingUser((previous) =>
                    previous ? { ...previous, lastName: event.target.value } : previous,
                  )
                }
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
                value={editingUser.email}
                onChange={(event) =>
                  setEditingUser((previous) =>
                    previous ? { ...previous, email: event.target.value.toLowerCase() } : previous,
                  )
                }
                required
                maxLength={255}
              />
            </label>

            <div className="form__actions form__label--full">
              <button type="submit" className="button button--secondary">
                Save client
              </button>
              <button type="button" className="button button--ghost" onClick={() => setEditingUser(null)}>
                Cancel
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </div>
  );
}

