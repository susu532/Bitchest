// Importe les hooks React essentiels pour gérer l'état et le contexte
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';

// Importe tous les types TypeScript nécessaires
import type {
  // Type pour les actions du reducer
  AppAction,
  // État global de l'application
  AppState,
  // Type pour le compte client
  ClientAccount,
  // Payload pour créer un client
  CreateClientPayload,
  // Payload pour enregistrer une transaction
  RecordTransactionPayload,
  // Payload pour mettre à jour un utilisateur
  UpdateUserPayload,
  // Type utilisateur
  User,
} from './types';
// Importe l'état initial prédéfini
import { INITIAL_STATE } from './initialData';
// Importe le service API
import { api } from '../utils/api';

// Clé utilisée pour sauvegarder l'état dans le localStorage
const STORAGE_KEY = 'bitchest-app-state';

// Type pour la valeur du contexte d'état (état + dispatch)
type AppStateContextValue = {
  // L'état global actuel de l'application
  state: AppState;
  // Fonction pour dispatcher les actions
  dispatch: React.Dispatch<AppAction>;
};

// Type pour la valeur du contexte des services (fonctions métier)
type AppServicesContextValue = {
  // Service pour créer un nouveau client
  createClient: (payload: CreateClientPayload) => Promise<{ tempPassword: string; user: User }>;
  // Service pour mettre à jour le profil de l'utilisateur connecté
  updateCurrentUserProfile: (data: Partial<Omit<User, 'id' | 'role' | 'createdAt' | 'password'>>) => Promise<User>;
  // Service pour mettre à jour un utilisateur spécifique
  updateUser: (payload: UpdateUserPayload) => Promise<void>;
  // Service pour supprimer un utilisateur
  deleteUser: (userId: string) => Promise<void>;
  // Service pour enregistrer une transaction
  recordTransaction: (payload: RecordTransactionPayload) => Promise<void>;
  // Service pour récupérer tous les actifs cryptographiques
  fetchCryptoAssets: () => Promise<void>;
  // Service pour récupérer tous les utilisateurs
  fetchUsers: () => Promise<void>;
  // Service pour récupérer le compte du client courant
  fetchClientAccount: () => Promise<void>;
};

// Contexte pour accéder à l'état et au dispatch
const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);
// Contexte pour accéder aux services (fonctions métier)
const AppServicesContext = createContext<AppServicesContextValue | undefined>(undefined);

// Fonction pour sauvegarder l'état dans le localStorage du navigateur
function persistState(state: AppState) {
  // Essaie de sauvegarder
  try {
    // Convertit l'état en JSON et le sauvegarde
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    // Affiche un avertissement si la sauvegarde échoue
    console.warn('Unable to persist BitChest state', error);
  }
}

// Fonction pour charger l'état depuis le localStorage
function loadPersistedState(): AppState | null {
  // Essaie de charger
  try {
    // Récupère la valeur sauvegardée
    const raw = window.localStorage.getItem(STORAGE_KEY);
    // Parse et retourne si elle existe, sinon retourne null
    return raw ? (JSON.parse(raw) as AppState) : null;
  } catch (error) {
    // Affiche un avertissement si le chargement échoue
    console.warn('Unable to load BitChest state from storage', error);
    // Retourne null en cas d'erreur
    return null;
  }
}

// Reducer qui traite les actions pour mettre à jour l'état
function appReducer(state: AppState, action: AppAction): AppState {
  // Switch sur le type d'action
  switch (action.type) {
    // Action pour mettre à jour les informations d'un utilisateur
    case 'update-user': {
      // Déstructure l'ID et les données de l'utilisateur
      const { userId, data } = action.payload;
      // Map sur tous les utilisateurs
      const users = state.users.map((user) =>
        // Si c'est l'utilisateur à mettre à jour
        user.id === userId
          ? {
              // Fusionne les données existantes avec les nouvelles
              ...user,
              ...data,
              // Met à jour la date de modification
              updatedAt: new Date().toISOString(),
            }
          : // Sinon retourne l'utilisateur inchangé
            user,
      );
      // Retourne le nouvel état avec les utilisateurs mis à jour
      return { ...state, users };
    }
    // Action pour créer un nouveau client avec son compte
    case 'create-client': {
      // Déstructure l'utilisateur et le compte
      const { user, account } = action.payload;
      // Retourne le nouvel état
      return {
        // Spread l'état existant
        ...state,
        // Ajoute le nouvel utilisateur à la liste
        users: [...state.users, user],
        // Ajoute le compte client
        clientAccounts: {
          // Spread les comptes existants
          ...state.clientAccounts,
          // Ajoute le nouveau compte
          [account.userId]: account,
        },
      };
    }
    // Action pour supprimer un utilisateur et son compte
    case 'delete-user': {
      // Déstructure l'ID utilisateur
      const { userId } = action.payload;
      // Retourne le nouvel état
      return {
        // Spread l'état existant
        ...state,
        // Filtre la liste des utilisateurs (supprime celui avec cet ID)
        users: state.users.filter((user) => user.id !== userId),
        // Filtre également les comptes clients (supprime celui de cet utilisateur)
        clientAccounts: Object.fromEntries(
          // Convertit en tableau [key, value], filtre, reconvertit en objet
          Object.entries(state.clientAccounts).filter(([key]) => key !== userId),
        ),
      };
    }
    // Action pour mettre à jour le mot de passe d'un client
    case 'update-client-password': {
      // Déstructure l'ID utilisateur et le nouveau mot de passe
      const { userId, newPassword } = action.payload;
      // Map sur tous les utilisateurs pour mettre à jour
      const updatedUsers = state.users.map((user) =>
        // Si c'est l'utilisateur dont on change le mot de passe
        user.id === userId
          ? {
              // Fusionne les données existantes
              ...user,
              // Met à jour le mot de passe
              password: newPassword,
              // Met à jour la date de modification
              updatedAt: new Date().toISOString(),
            }
          : // Sinon retourne l'utilisateur inchangé
            user,
      );
      // Retourne l'état avec les utilisateurs mis à jour
      return { ...state, users: updatedUsers };
    }
    // Action pour enregistrer une transaction
    case 'record-transaction': {
      // Déstructure les données de la transaction
      const { userId, transaction, balanceAdjustment } = action.payload;
      // Récupère le compte du client
      const account = state.clientAccounts[userId];
      // Si le compte n'existe pas, retourne l'état inchangé
      if (!account) {
        return state;
      }

      // Crée le compte mis à jour
      const updatedAccount: ClientAccount = {
        // Spread le compte existant
        ...account,
        // Met à jour le solde EUR avec l'ajustement
        balanceEUR: Number((account.balanceEUR + balanceAdjustment).toFixed(2)),
        // Ajoute la nouvelle transaction à la liste
        transactions: [...account.transactions, transaction],
      };

      // Retourne l'état avec le compte mis à jour
      return {
        // Spread l'état existant
        ...state,
        // Met à jour les comptes clients
        clientAccounts: { ...state.clientAccounts, [userId]: updatedAccount },
      };
    }
    // Action pour charger/remplacer tous les actifs cryptographiques
    case 'set-crypto-assets': {
      // Retourne l'état avec les nouveaux actifs
      return {
        // Spread l'état existant
        ...state,
        // Remplace les actifs cryptographiques
        cryptoAssets: action.payload,
      };
    }
    // Action pour charger/remplacer la liste de tous les utilisateurs
    case 'set-users': {
      // Retourne l'état avec les nouveaux utilisateurs
      return {
        // Spread l'état existant
        ...state,
        // Remplace la liste des utilisateurs
        users: action.payload,
      };
    }
    // Action pour charger/remplacer le compte d'un client spécifique
    case 'set-client-account': {
      // Déstructure l'ID utilisateur et le compte
      const { userId, account } = action.payload;
      // Retourne l'état avec le compte mis à jour
      return {
        // Spread l'état existant
        ...state,
        // Met à jour les comptes clients
        clientAccounts: {
          // Spread les comptes existants
          ...state.clientAccounts,
          // Met à jour le compte pour cet utilisateur
          [userId]: account,
        },
      };
    }
    // Action pour mettre à jour le prix d'une cryptomonnaie
    case 'update-crypto-price': {
      // Déstructure l'ID de la crypto et le prix
      const { cryptoId, price } = action.payload;
      // Récupère l'actif actuel
      const asset = state.cryptoAssets[cryptoId];
      // Si l'actif n'existe pas, retourne l'état inchangé
      if (!asset) {
        return state;
      }

      // Récupère le dernier point du graphique
      const lastPoint = asset.history[asset.history.length - 1];
      // Crée une copie de l'historique
      const newHistory = [...asset.history];

      // Si le dernier point est d'aujourd'hui
      if (lastPoint && lastPoint.date.split('T')[0] === new Date().toISOString().split('T')[0]) {
        // Met à jour le prix du dernier point
        newHistory[newHistory.length - 1] = {
          // Conserve la date
          date: lastPoint.date,
          // Met à jour le prix
          value: price,
        };
      } else {
        // Sinon ajoute un nouveau point
        newHistory.push({
          // Date actuelle
          date: new Date().toISOString(),
          // Nouveau prix
          value: price,
        });
      }

      // Filtre pour ne conserver que les 30 derniers jours
      // Calcule la date d'il y a 30 jours
      const thirtyDaysAgo = new Date();
      // Recule de 30 jours
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      // Filtre les points plus anciens que 30 jours
      const filteredHistory = newHistory.filter((point) => new Date(point.date) >= thirtyDaysAgo);

      // Retourne l'état avec la crypto mise à jour
      return {
        // Spread l'état existant
        ...state,
        // Met à jour les actifs cryptographiques
        cryptoAssets: {
          // Spread les actifs existants
          ...state.cryptoAssets,
          // Met à jour l'actif spécifique
          [cryptoId]: {
            // Spread l'actif existant
            ...asset,
            // Met à jour le prix actuel
            currentPrice: price,
            // Met à jour l'historique filtré
            history: filteredHistory,
          },
        },
      };
    }
    // Cas par défaut: retourne l'état inchangé
    default:
      return state;
  }
}

// Type pour les props du provider
type AppStateProviderProps = {
  // Éléments enfants à envelopper avec le provider
  children: React.ReactNode;
};

// Composant provider qui gère l'état global et les services
export function AppStateProvider({ children }: AppStateProviderProps) {
  // Initialise le reducer avec l'état initial
  const [state, dispatch] = useReducer(
    // Le reducer qui traite les actions
    appReducer,
    // L'état initial
    INITIAL_STATE,
    // Initializer: charge depuis localStorage ou utilise l'état initial
    (initial): AppState => {
      // Si on n'est pas dans le navigateur (SSR), retourne l'initial
      if (typeof window === 'undefined') {
        return initial;
      }
      // Charge l'état persisté ou utilise l'initial
      const persisted = loadPersistedState();
      // Retourne l'état persisté s'il existe, sinon l'initial
      return persisted ?? initial;
    },
  );

  // Effet pour sauvegarder l'état quand il change
  useEffect(() => {
    // Sauvegarde l'état actuel
    persistState(state);
  }, [state]);

  // Effet pour synchroniser les prix des cryptomonnaies toutes les 5 secondes
  useEffect(() => {
    // Fonction pour récupérer les prix depuis l'API
    const pollPrices = async () => {
      try {
        // Appelle l'API pour récupérer les cryptomonnaies
        const response: any = await api.getCryptocurrencies();
        // Si l'appel réussit
        if (response.success) {
          // Met à jour chaque crypto avec les nouveaux prix
          Object.entries(response.cryptoAssets).forEach(([cryptoId, asset]: [string, any]) => {
            // Récupère l'actif courant depuis l'état
            const currentStateAsset = state.cryptoAssets[cryptoId];
            // Si le prix a changé et que l'actif existe localement
            if (currentStateAsset && currentStateAsset.currentPrice !== asset.currentPrice) {
              // Dispatch une action pour mettre à jour le prix
              dispatch({
                // Type d'action
                type: 'update-crypto-price',
                // Payload avec l'ID crypto et le nouveau prix
                payload: {
                  cryptoId,
                  price: asset.currentPrice,
                },
              });
            }
          });
        }
      } catch (error) {
        // Affiche une erreur si la synchronisation échoue
        console.warn('[Price Poll] Failed to fetch prices:', error);
      }
    };

    // Appelle immédiatement et puis toutes les 5 secondes
    // Première synchronisation immédiate
    pollPrices();
    // Crée un intervalle pour synchroniser toutes les 5 secondes
    const interval = setInterval(pollPrices, 5000);

    // Cleanup: arrête l'intervalle au démontage
    return () => clearInterval(interval);
  }, [state.cryptoAssets]);

  // Service pour créer un nouveau client
  const createClient = useCallback(
    // Fonction asynchrone qui accepte les données du client
    async (payload: CreateClientPayload) => {
      // Appelle l'API pour créer le client
      const response: any = await api.createClient(payload.firstName, payload.lastName, payload.email);
      // Si la création échoue
      if (!response.success) {
        // Lance une erreur
        throw new Error(response.message || 'Failed to create client');
      }

      // Crée un objet utilisateur avec les données de la réponse
      const user: User = {
        // ID de l'utilisateur retourné par le serveur
        id: response.user.id,
        // Prénom
        firstName: response.user.firstName,
        // Nom de famille
        lastName: response.user.lastName,
        // Email
        email: response.user.email,
        // Rôle fixé à 'client'
        role: 'client',
        // Mot de passe vide (pour la sécurité)
        password: '',
        // Date de création
        createdAt: response.user.createdAt,
        // Date de dernière mise à jour
        updatedAt: response.user.updatedAt,
      };

      // Crée le compte client initial
      const account: ClientAccount = {
        // Lie au nouvel utilisateur
        userId: user.id,
        // Balance initiale: 500 EUR
        balanceEUR: 500,
        // Pas de transactions initialement
        transactions: [],
      };

      // Dispatch l'action de création
      dispatch({ type: 'create-client', payload: { user, account } });

      // Retourne le mot de passe temporaire et l'utilisateur
      return { tempPassword: response.temporaryPassword, user };
    },
    [],
  );

  // Service pour mettre à jour le profil de l'utilisateur connecté
  const updateCurrentUserProfile = useCallback(
    // Fonction asynchrone qui accepte les données à mettre à jour
    async (data: Partial<Omit<User, 'id' | 'role' | 'createdAt' | 'password'>>) => {
      // Appelle l'API pour mettre à jour le profil
      const response: any = await api.updateProfile(data);
      // Si la mise à jour échoue
      if (!response.success) {
        // Lance une erreur
        throw new Error(response.message || 'Failed to update profile');
      }
      // Retourne les données utilisateur mises à jour
      return response.user;
    },
    [],
  );

  // Service pour mettre à jour un utilisateur spécifique
  const updateUser = useCallback(
    // Fonction asynchrone qui accepte l'ID et les données
    async (payload: UpdateUserPayload) => {
      // Appelle l'API pour mettre à jour l'utilisateur
      const response: any = await api.updateClient(payload.userId, payload.data);
      // Si la mise à jour échoue
      if (!response.success) {
        // Lance une erreur
        throw new Error(response.message || 'Failed to update user');
      }
      // Dispatch l'action de mise à jour
      dispatch({ type: 'update-user', payload });
    },
    [],
  );

  // Service pour supprimer un utilisateur
  const deleteUser = useCallback(
    // Fonction asynchrone qui accepte l'ID utilisateur
    async (userId: string) => {
      // Appelle l'API pour supprimer l'utilisateur
      const response: any = await api.deleteClient(userId);
      // Si la suppression échoue
      if (!response.success) {
        // Lance une erreur
        throw new Error(response.message || 'Failed to delete user');
      }
      // Dispatch l'action de suppression
      dispatch({ type: 'delete-user', payload: { userId } });
    },
    [],
  );

  // Service pour enregistrer une transaction
  const recordTransaction = useCallback(
    // Fonction asynchrone qui accepte les données de la transaction
    async (payload: RecordTransactionPayload) => {
      // Dispatch directement l'action (pas d'appel API ici)
      dispatch({ type: 'record-transaction', payload });
    },
    [],
  );

  // Service pour récupérer tous les actifs cryptographiques
  const fetchCryptoAssets = useCallback(async () => {
    try {
      // Appelle l'API pour récupérer les cryptomonnaies
      const response: any = await api.getCryptocurrencies();
      // Si l'appel réussit
      if (response.success) {
        // Dispatch l'action pour charger les actifs
        dispatch({ type: 'set-crypto-assets', payload: response.cryptoAssets });
      }
    } catch (error) {
      // Affiche une erreur si le chargement échoue
      console.warn('Failed to fetch cryptocurrencies:', error);
    }
  }, []);

  // Service pour récupérer tous les utilisateurs
  const fetchUsers = useCallback(async () => {
    try {
      // Appelle l'API pour récupérer tous les utilisateurs
      const response: any = await api.getAllUsers();
      // Si l'appel réussit
      if (response.success) {
        // Dispatch l'action pour charger les utilisateurs
        dispatch({
          // Type d'action
          type: 'set-users',
          // Transforme les utilisateurs au bon format
          payload: response.users.map((u: any) => ({
            // ID de l'utilisateur
            id: u.id,
            // Prénom
            firstName: u.firstName,
            // Nom de famille
            lastName: u.lastName,
            // Email
            email: u.email,
            // Rôle
            role: u.role,
            // Mot de passe vide
            password: '',
            // Date de création
            createdAt: u.createdAt,
            // Date de dernière mise à jour
            updatedAt: u.updatedAt,
          })),
        });
      }
    } catch (error) {
      // Affiche une erreur si le chargement échoue
      console.warn('Failed to fetch users:', error);
    }
  }, []);

  // Service pour récupérer le compte du client connecté
  const fetchClientAccount = useCallback(async () => {
    try {
      // Appelle l'API pour récupérer le compte du client
      const response: any = await api.getClientAccount();
      // Si l'appel réussit
      if (response.success) {
        // Dispatch l'action pour charger le compte
        dispatch({
          // Type d'action
          type: 'set-client-account',
          // Payload avec l'ID utilisateur et le compte
          payload: {
            // ID de l'utilisateur
            userId: response.account.userId,
            // Compte du client avec les transactions
            account: {
              // ID de l'utilisateur
              userId: response.account.userId,
              // Solde en EUR
              balanceEUR: response.account.balanceEUR,
              // Transforme les transactions au bon format
              transactions: response.account.transactions.map((t: any) => ({
                // ID de la transaction
                id: t.id,
                // ID de la cryptomonnaie
                cryptoId: t.cryptoId,
                // Quantité
                quantity: t.quantity,
                // Prix par unité
                pricePerUnit: t.pricePerUnit,
                // Type de transaction
                type: t.type,
                // Timestamp
                timestamp: t.timestamp,
              })),
            },
          },
        });
      }
    } catch (error) {
      // Affiche une erreur si le chargement échoue
      console.warn('Failed to fetch client account:', error);
    }
  }, []);

  // Crée la valeur du contexte des services en memoisant
  const servicesValue = useMemo(
    () => ({
      // Service de création de client
      createClient,
      // Service de mise à jour du profil courant
      updateCurrentUserProfile,
      // Service de mise à jour d'utilisateur
      updateUser,
      // Service de suppression d'utilisateur
      deleteUser,
      // Service d'enregistrement de transaction
      recordTransaction,
      // Service de récupération des cryptomonnaies
      fetchCryptoAssets,
      // Service de récupération des utilisateurs
      fetchUsers,
      // Service de récupération du compte client
      fetchClientAccount,
    }),
    // Dépendances: toutes les fonctions de service
    [createClient, updateCurrentUserProfile, deleteUser, recordTransaction, updateUser, fetchCryptoAssets, fetchUsers, fetchClientAccount],
  );

  // Retourne les providers imbriqués
  return (
    // Provider d'état (état + dispatch)
    <AppStateContext.Provider value={{ state, dispatch }}>
      {/* Provider de services (fonctions métier) */}
      <AppServicesContext.Provider value={servicesValue}>
        {/* Les enfants accèdent à l'état et aux services via les contextes */}
        {children}
      </AppServicesContext.Provider>
    </AppStateContext.Provider>
  );
}

// Hook pour accéder à l'état global
export function useAppState() {
  // Récupère le contexte d'état
  const context = useContext(AppStateContext);
  // Vérifie que le hook est utilisé dans un AppStateProvider
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  // Retourne l'état global
  return context.state;
}

// Hook pour accéder aux services globaux
export function useAppServices() {
  // Récupère le contexte des services
  const context = useContext(AppServicesContext);
  // Vérifie que le hook est utilisé dans un AppStateProvider
  if (!context) {
    throw new Error('useAppServices must be used within an AppStateProvider');
  }
  // Retourne les services
  return context;
}

// Hook pour accéder au dispatch global
export function useAppDispatch() {
  // Récupère le contexte d'état
  const context = useContext(AppStateContext);
  // Vérifie que le hook est utilisé dans un AppStateProvider
  if (!context) {
    throw new Error('useAppDispatch must be used within an AppStateProvider');
  }
  // Retourne la fonction dispatch
  return context.dispatch;
}

