// Importe les hooks React pour la gestion d'état et la mémorisation
import { useMemo, useState } from 'react';

// Importe le type pour les événements de formulaire
import type { FormEvent } from 'react';

// Importe les hooks pour accéder aux services et à l'état global
import { useAppServices, useAppState } from '../../state/AppStateProvider';
// Importe le type User
import type { User } from '../../state/types';
// Importe les utilitaires pour calculer les avoirs du portefeuille
import { summarizeHoldings, enrichHoldingsWithPrices } from '../../utils/wallet';
// Importe la fonction de validation du formulaire utilisateur
import { validateUserForm } from '../../utils/validation';
// Importe le composant de modal de confirmation moderne
import ConfirmationModal from './ConfirmationModal';

// Props du composant: ID de l'admin actuel et liste de tous les utilisateurs
type ClientManagementPanelProps = {
  adminId: string;
  users: User[];
};

// Type local pour l'édition d'un utilisateur (champs modifiables)
type EditableUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

// Composant de gestion des clients (Admin)
// Permet de créer, lister, modifier et supprimer des comptes clients
export default function ClientManagementPanel({ users, adminId }: ClientManagementPanelProps) {
  // Récupère les comptes clients et les actifs crypto depuis l'état global
  const { clientAccounts, cryptoAssets } = useAppState();
  // Récupère les services pour les opérations CRUD sur les clients
  const { createClient, updateUser, deleteUser } = useAppServices();

  // --- État pour la création de client ---
  // Affiche/masque le formulaire de création
  const [isCreating, setIsCreating] = useState(false);
  // Données du formulaire de création
  const [creationData, setCreationData] = useState({ firstName: '', lastName: '', email: '' });
  // Message de succès après création
  const [creationFeedback, setCreationFeedback] = useState<string | null>(null);
  // Erreurs de validation du formulaire de création
  const [creationErrors, setCreationErrors] = useState<Record<string, string>>({});

  // --- État pour l'édition de client ---
  // Utilisateur en cours d'édition (null si aucun)
  const [editingUser, setEditingUser] = useState<EditableUser | null>(null);
  // Message de succès après édition
  const [editFeedback, setEditFeedback] = useState<string | null>(null);
  // Erreurs de validation du formulaire d'édition
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // --- État pour la modal de suppression ---
  // Contrôle l'affichage de la modal de confirmation de suppression
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  // Stocke l'utilisateur à supprimer pour la modal
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Filtre la liste des utilisateurs pour ne garder que les clients (pas les admins)
  // Mémorisé pour éviter de recalculer à chaque rendu
  const clients = useMemo(
    () => users.filter((user) => user.role === 'client'),
    [users],
  );

  // Gestionnaire de création de client
  const handleCreate = async (event: FormEvent) => {
    // Empêche le rechargement de la page
    event.preventDefault();
    // Réinitialise les erreurs
    setCreationErrors({});

    // Valide les données du formulaire
    const validation = validateUserForm(
      creationData.firstName,
      creationData.lastName,
      creationData.email,
    );
    // Si invalide, affiche les erreurs et arrête
    if (!validation.valid) {
      setCreationErrors(validation.errors);
      return;
    }

    // Vérifie si l'email existe déjà localement (avant d'appeler l'API)
    const exists = users.some((user) => user.email.toLowerCase() === creationData.email.toLowerCase());
    if (exists) {
      setCreationErrors({ email: 'A user with this email already exists. Choose another email address.' });
      return;
    }

    try {
      // Appelle le service pour créer le client
      const result = await createClient(creationData);
      // Affiche le message de succès avec le mot de passe temporaire
      setCreationFeedback(
        `Client created successfully. Temporary password: ${result.tempPassword} (share securely with the client).`,
      );
      // Réinitialise le formulaire
      setCreationErrors({});
      setCreationData({ firstName: '', lastName: '', email: '' });
      // Ferme le formulaire
      setIsCreating(false);
    } catch (error: any) {
      // Affiche l'erreur retournée par l'API
      setCreationErrors({ submit: error.message || 'Failed to create client' });
    }
  };

  // Gestionnaire de mise à jour de client
  const handleEdit = async (event: FormEvent) => {
    event.preventDefault();
    // Si aucun utilisateur n'est en cours d'édition, ne fait rien
    if (!editingUser) {
      return;
    }
    setEditErrors({});

    // Valide les données du formulaire
    const validation = validateUserForm(
      editingUser.firstName,
      editingUser.lastName,
      editingUser.email,
    );
    if (!validation.valid) {
      setEditErrors(validation.errors);
      return;
    }

    // Vérifie l'unicité de l'email (en excluant l'utilisateur actuel)
    const exists = users.some(
      (user) => user.email.toLowerCase() === editingUser.email.toLowerCase() && user.id !== editingUser.id,
    );
    if (exists) {
      setEditErrors({ email: 'This email is already used by another client.' });
      return;
    }

    try {
      // Appelle le service pour mettre à jour le client
      await updateUser({
        userId: editingUser.id,
        data: {
          firstName: editingUser.firstName,
          lastName: editingUser.lastName,
          email: editingUser.email.toLowerCase(),
        },
      });
      // Affiche le succès et ferme le mode édition
      setEditFeedback('Client updated successfully.');
      setEditingUser(null);
      setEditErrors({});
    } catch (error: any) {
      setEditErrors({ submit: error.message || 'Failed to update client' });
      console.error('Failed to update client:', error);
    }
  };

  // Gestionnaire de suppression de client - ouvre la modal de confirmation
  const handleDelete = (userId: string) => {
    // Trouve l'utilisateur à supprimer
    const target = users.find((user) => user.id === userId);
    if (!target) {
      return;
    }

    // Stocke l'utilisateur et ouvre la modal de confirmation
    setUserToDelete(target);
    setIsDeleteModalOpen(true);
  };

  // Confirme et exécute la suppression après validation dans la modal
  const confirmDelete = async () => {
    if (!userToDelete) {
      return;
    }

    try {
      // Appelle le service pour supprimer le client
      await deleteUser(userToDelete.id);
      // Ferme la modal et réinitialise
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      // Ferme la modal même en cas d'erreur
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  // Annule la suppression et ferme la modal
  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  // Calcule et formate le solde total d'un client (EUR + valeur crypto)
  const renderClientBalance = (client: User) => {
    // Récupère le compte du client
    const account = clientAccounts[client.id];
    if (!account) {
      return '€0.00';
    }

    // Résume les avoirs crypto (quantité nette par crypto)
    const holdings = summarizeHoldings(account.transactions);
    // Enrichit avec les prix actuels pour avoir la valeur en EUR
    const enriched = enrichHoldingsWithPrices(holdings, cryptoAssets);
    // Calcule la valeur totale des cryptos
    const totalValue = enriched.reduce((acc, holding) => acc + holding.currentValue, 0);
    // Ajoute le solde EUR disponible
    const total = totalValue + account.balanceEUR;
    // Formate en devise EUR
    return `€${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Rendu du panneau de gestion
  return (
    <div className="panel">
      {/* Section En-tête et Bouton Nouveau Client */}
      <section className="panel__section" style={{ animationDelay: '0.1s' }}>
        <header className="panel__header">
          <div>
            <h2>Clients</h2>
            <p>Manage all BitChest client accounts. Passwords are never displayed to maintain confidentiality.</p>
          </div>
          {/* Bouton pour basculer l'affichage du formulaire de création */}
          <button
            type="button"
            className="button button--primary"
            onClick={() => setIsCreating((previous) => !previous)}
          >
            {isCreating ? 'Cancel' : 'New client'}
          </button>
        </header>

        {/* Feedback et Erreurs globaux */}
        {creationFeedback ? <p className="form__success">{creationFeedback}</p> : null}
        {Object.entries(creationErrors).map(([key, error]) => (
          <p key={key} className="form__error">{error}</p>
        ))}

        {/* Formulaire de Création (affiché conditionnellement) */}
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

      {/* Section Liste des Clients */}
      <section className="panel__section" style={{ animationDelay: '0.2s' }}>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th></th>
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
                    {/* Affiche la valeur totale du portefeuille */}
                    <td>{renderClientBalance(client)}</td>
                    <td>{new Date(client.createdAt).toLocaleDateString()}</td>
                    <td className="table__actions">
                      {/* Bouton Éditer */}
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
                      {/* Bouton Supprimer (sauf pour soi-même, bien que ce soit une liste de clients) */}
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

      {/* Section Édition (affichée quand un utilisateur est sélectionné) */}
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

      {/* Modal de confirmation de suppression */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Client"
        message={userToDelete ? `Are you sure you want to remove ${userToDelete.firstName} ${userToDelete.lastName}? This action will permanently delete their account and wallet information.` : ''}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isDangerous={true}
      />
    </div>
  );
}

