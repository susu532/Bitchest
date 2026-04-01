
// ============================================================================
// Import des hooks React nécessaires pour la gestion d'état.
// createContext crée un objet Context pour partager des données entre composants.
// useCallback mémorise une fonction pour éviter les re-créations inutiles.
// useContext permet d'accéder aux valeurs d'un Context créé.
// useEffect exécute des effets secondaires après le rendu du composant.
// useMemo mémorise une valeur calculée pour optimiser les performances.
// useReducer gère un état complexe avec un pattern action/reducer.
// ============================================================================
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';

// ============================================================================
// Import des types TypeScript pour la définition des structures de données.
// 'type' importe uniquement les types sans le code d'exécution.
// AppAction définit les actions possibles pour le reducer d'état.
// AppState définit la structure complète de l'état de l'application.
// ClientAccount représente le compte d'un client avec son solde et transactions.
// CreateClientPayload définit les données nécessaires pour créer un client.
// UpdateUserPayload définit les données pour mettre à jour un utilisateur.
// User définit la structure d'un utilisateur du système.
// ============================================================================
import type {
  AppAction,
  AppState,
  ClientAccount,
  CreateClientPayload,
  UpdateUserPayload,
  User,
} from './types';

// ============================================================================
// Import de l'état initial de l'application depuis le fichier initialData.
// INITIAL_STATE contient les valeurs par défaut pour l'état de l'application.
// Cet état est utilisé quand aucune donnée n'est persistée en localStorage.
// ============================================================================
import { INITIAL_STATE } from './initialData';

// ============================================================================
// Import du service API pour les communications avec le backend.
// 'api' est une instance de la classe ApiService configurée pour le backend.
// Ce service encapsule toutes les requêtes HTTP vers le serveur Laravel.
// ============================================================================
import { api } from '../utils/api';

// ============================================================================
// Clé de stockage pour la persistance de l'état dans localStorage.
// 'const' déclare une constante qui ne peut pas être réassignée.
// STORAGE_KEY est la clé sous laquelle l'état est sauvegardé.
// ============================================================================
const STORAGE_KEY = 'bitchest-app-state';

// ============================================================================
// Type pour la valeur du contexte d'état de l'application.
// 'type' crée un alias de type TypeScript pour la vérification statique.
// AppStateContextValue définit ce que le contexte d'état expose.
// ============================================================================
type AppStateContextValue = {
  // state contient l'état complet de l'application (cryptos, users, accounts).
  state: AppState;
  // dispatch est la fonction pour envoyer des actions au reducer.
  dispatch: React.Dispatch<AppAction>;
};

// ============================================================================
// Type pour la valeur du contexte des services de l'application.
// Ce type définit toutes les fonctions métier disponibles via le contexte.
// Ces services encapsulent la logique d'appel API et de mise à jour d'état.
// ============================================================================
type AppServicesContextValue = {
  // createClient crée un nouveau client et retourne le mot de passe temporaire.
  createClient: (payload: CreateClientPayload) => Promise<{ tempPassword: string; user: User }>;
  // updateCurrentUserProfile met à jour le profil de l'utilisateur connecté.
  updateCurrentUserProfile: (data: Partial<Omit<User, 'id' | 'role' | 'createdAt' | 'password'>>) => Promise<User>;
  // updateUser met à jour les informations d'un utilisateur existant.
  updateUser: (payload: UpdateUserPayload) => Promise<void>;
  // deleteUser supprime un utilisateur du système.
  deleteUser: (userId: string) => Promise<void>;
  // fetchCryptoAssets récupère la liste des cryptomonnaies depuis l'API.
  fetchCryptoAssets: () => Promise<void>;
  // fetchUsers récupère la liste des utilisateurs depuis l'API.
  fetchUsers: () => Promise<void>;
  // fetchClientAccount récupère le compte client depuis l'API.
  fetchClientAccount: () => Promise<void>;
};

// ============================================================================
// Création du contexte d'état de l'application avec une valeur initiale undefined.
// createContext<T>(undefined) crée un contexte typé avec T comme type de valeur.
// AppStateContext stocke l'état et la fonction dispatch.
// ============================================================================
const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

// ============================================================================
// Création du contexte des services de l'application.
// Ce contexte expose les fonctions métier aux composants enfants.
// La valeur undefined est utilisée comme valeur par défaut.
// ============================================================================
const AppServicesContext = createContext<AppServicesContextValue | undefined>(undefined);

// ============================================================================
// Fonction pour persister l'état dans le localStorage du navigateur.
// 'function' déclare une fonction nommée en JavaScript.
// persistState prend l'état en paramètre et le sauvegarde en JSON.
// ============================================================================
function persistState(state: AppState) {
  // Le bloc try-catch gère les erreurs potentielles d'accès au localStorage.
  try {
    // localStorage.setItem sauvegarde une chaîne sous la clé spécifiée.
    // JSON.stringify convertit l'objet JavaScript en chaîne JSON.
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    // console.warn affiche un avertissement dans la console développeur.
    // Cette erreur peut survenir si le localStorage est plein ou désactivé.
    console.warn('Unable to persist BitChest state', error);
  }
}

// ============================================================================
// Fonction pour charger l'état persisté depuis le localStorage.
// Cette fonction retourne AppState si trouvé, sinon null.
// Elle est appelée lors de l'initialisation de l'application.
// ============================================================================
function loadPersistedState(): AppState | null {
  try {
    // getItem récupère la valeur associée à la clé, ou null si absente.
    const raw = window.localStorage.getItem(STORAGE_KEY);
    // L'opérateur ternaire retourne l'état parsé ou null.
    // JSON.parse convertit la chaîne JSON en objet JavaScript.
    return raw ? (JSON.parse(raw) as AppState) : null;
  } catch (error) {
    console.warn('Unable to load BitChest state from storage', error);
    return null;
  }
}

// ============================================================================
// Fonction reducer qui gère toutes les transitions d'état de l'application.
// appReducer prend l'état actuel et une action, retourne le nouvel état.
// Le pattern reducer assure des mises à jour d'état prévisibles et testables.
// ============================================================================
function appReducer(state: AppState, action: AppAction): AppState {
  // switch évalue action.type et exécute le cas correspondant.
  switch (action.type) {
    // Cas de mise à jour d'un utilisateur existant.
    case 'update-user': {
      // Déstructuration pour extraire userId et data du payload.
      const { userId, data } = action.payload;
      // map crée un nouveau tableau avec les utilisateurs mis à jour.
      const users = state.users.map((user) =>
        user.id === userId
          ? { ...user, ...data, updatedAt: new Date().toISOString() }
          : user,
      );
      // Retourne un nouvel objet état avec le tableau users mis à jour.
      return { ...state, users };
    }

    // Cas de création d'un nouveau client.
    case 'create-client': {
      const { user, account } = action.payload;
      return {
        ...state,
        users: [...state.users, user],
        clientAccounts: { ...state.clientAccounts, [account.userId]: account },
      };
    }

    // Cas de suppression d'un utilisateur.
    case 'delete-user': {
      const { userId } = action.payload;
      return {
        ...state,
        users: state.users.filter((user) => user.id !== userId),
        clientAccounts: Object.fromEntries(
          Object.entries(state.clientAccounts).filter(([key]) => key !== userId),
        ),
      };
    }

    // Cas de définition des actifs crypto depuis l'API.
    case 'set-crypto-assets': {
      return { ...state, cryptoAssets: action.payload };
    }

    // Cas de définition de la liste des utilisateurs.
    case 'set-users': {
      return { ...state, users: action.payload };
    }

    // Cas de définition d'un compte client.
    case 'set-client-account': {
      const { userId, account } = action.payload;
      return { ...state, clientAccounts: { ...state.clientAccounts, [userId]: account } };
    }

    // Cas de mise à jour du prix d'une crypto.
    case 'update-crypto-price': {
      const { cryptoId, price } = action.payload;
      const asset = state.cryptoAssets[cryptoId];
      if (!asset) return state;
      const lastPoint = asset.history[asset.history.length - 1];
      const newHistory = [...asset.history];
      if (lastPoint && lastPoint.date.split('T')[0] === new Date().toISOString().split('T')[0]) {
        newHistory[newHistory.length - 1] = { date: lastPoint.date, value: price };
      } else {
        newHistory.push({ date: new Date().toISOString(), value: price });
      }
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const filteredHistory = newHistory.filter((point) => new Date(point.date) >= thirtyDaysAgo);
      return {
        ...state,
        cryptoAssets: {
          ...state.cryptoAssets,
          [cryptoId]: { ...asset, currentPrice: price, history: filteredHistory },
        },
      };
    }

    // Cas par défaut : retourne l'état inchangé.
    default:
      return state;
  }
}

// ============================================================================
// Type pour les props du composant AppStateProvider.
// children représente les composants enfants à envelopper.
// ============================================================================
type AppStateProviderProps = {
  children: React.ReactNode;
};

// ============================================================================
// Composant provider principal pour l'état de l'application.
// Ce composant initialise le reducer et fournit l'état à tous les enfants.
// 'export function' exporte et déclare le composant simultanément.
// ============================================================================
export function AppStateProvider({ children }: AppStateProviderProps) {
  // useReducer initialise l'état avec le reducer et la fonction d'init.
  const [state, dispatch] = useReducer(
    appReducer,
    INITIAL_STATE,
    (initial): AppState => {
      if (typeof window === 'undefined') return initial;
      const persisted = loadPersistedState();
      return persisted ?? initial;
    },
  );

  // Effet pour persister l'état à chaque changement.
  useEffect(() => {
    persistState(state);
  }, [state]);

  // Effet pour le polling des prix (toutes les 5 secondes).
  useEffect(() => {
    const pollPrices = async () => {
      try {
        const response: any = await api.getCryptocurrencies();
        if (response.success) {
          Object.entries(response.cryptoAssets).forEach(([cryptoId, asset]: [string, any]) => {
            const currentStateAsset = state.cryptoAssets[cryptoId];
            if (currentStateAsset && currentStateAsset.currentPrice !== asset.currentPrice) {
              dispatch({ type: 'update-crypto-price', payload: { cryptoId, price: asset.currentPrice } });
            }
          });
        }
      } catch (error) {
        console.warn('[Price Poll] Failed to fetch prices:', error);
      }
    };
    
    // Premier appel immédiat seulement si pas de données (pour éviter doublon avec init)
    // pollPrices(); 
    
    const interval = setInterval(pollPrices, 5000);
    return () => clearInterval(interval);
  }, [state.cryptoAssets]);

  // Effet pour la connexion WebSocket (SÉPARÉ pour éviter les déconnexions/reconversions)
  useEffect(() => {
    let cleanupFn: (() => void) | undefined;

    console.log('[WebSocket] Initializing subscription...');

    import('../utils/echo').then(({ echoService }) => {
      // Callback global pour les prix
      echoService.subscribeToprices((data: any) => {
        console.log('[WebSocket] Price update received:', data);
        dispatch({ type: 'update-crypto-price', payload: { cryptoId: data.cryptoId, price: data.price } });
      });
      
      cleanupFn = () => {
        console.log('[WebSocket] Unsubscribing from crypto-prices');
        echoService.unsubscribe('crypto-prices');
      };
    });

    return () => {
      if (cleanupFn) cleanupFn();
    };
  }, []); // Dépendance vide : ne s'exécute qu'une fois au montage

  // Service createClient : crée un client via l'API.
  const createClient = useCallback(async (payload: CreateClientPayload) => {
    const response: any = await api.createClient(payload.firstName, payload.lastName, payload.email);
    if (!response.success) throw new Error(response.message || 'Failed to create client');
    const user: User = {
      id: response.user.id, firstName: response.user.firstName, lastName: response.user.lastName,
      email: response.user.email, role: 'client', password: '',
      createdAt: response.user.createdAt, updatedAt: response.user.updatedAt,
    };
    const account: ClientAccount = { userId: user.id, balanceEUR: 500, transactions: [] };
    dispatch({ type: 'create-client', payload: { user, account } });
    return { tempPassword: response.temporaryPassword, user };
  }, []);

  // Service updateCurrentUserProfile : met à jour le profil.
  const updateCurrentUserProfile = useCallback(async (data: Partial<Omit<User, 'id' | 'role' | 'createdAt' | 'password'>>) => {
    const response: any = await api.updateProfile(data);
    if (!response.success) throw new Error(response.message || 'Failed to update profile');
    return response.user;
  }, []);

  // Service updateUser : met à jour un utilisateur.
  const updateUser = useCallback(async (payload: UpdateUserPayload) => {
    const response: any = await api.updateClient(payload.userId, payload.data);
    if (!response.success) throw new Error(response.message || 'Failed to update user');
    dispatch({ type: 'update-user', payload });
  }, []);

  // Service deleteUser : supprime un utilisateur.
  const deleteUser = useCallback(async (userId: string) => {
    const response: any = await api.deleteClient(userId);
    if (!response.success) throw new Error(response.message || 'Failed to delete user');
    dispatch({ type: 'delete-user', payload: { userId } });
  }, []);

  // Service fetchCryptoAssets : récupère les cryptos depuis l'API.
  const fetchCryptoAssets = useCallback(async () => {
    try {
      const response: any = await api.getCryptocurrencies();
      if (response.success) dispatch({ type: 'set-crypto-assets', payload: response.cryptoAssets });
    } catch (error) { console.warn('Failed to fetch cryptocurrencies:', error); }
  }, []);

  // Service fetchUsers : récupère les utilisateurs depuis l'API.
  const fetchUsers = useCallback(async () => {
    try {
      const response: any = await api.getAllUsers();
      if (response.success) {
        dispatch({
          type: 'set-users',
          payload: response.users.map((u: any) => ({
            id: u.id, firstName: u.firstName, lastName: u.lastName,
            email: u.email, role: u.role, password: '', createdAt: u.createdAt, updatedAt: u.updatedAt,
          })),
        });
      }
    } catch (error) { console.warn('Failed to fetch users:', error); }
  }, []);

  // Service fetchClientAccount : récupère le compte client.
  const fetchClientAccount = useCallback(async () => {
    try {
      const response: any = await api.getClientAccount();
      if (response.success) {
        dispatch({
          type: 'set-client-account',
          payload: {
            userId: response.account.userId,
            account: {
              userId: response.account.userId, balanceEUR: response.account.balanceEUR,
              transactions: response.account.transactions.map((t: any) => ({
                id: t.id, cryptoId: t.cryptoId, quantity: t.quantity,
                pricePerUnit: t.pricePerUnit, type: t.type, timestamp: t.timestamp,
              })),
            },
          },
        });
      }
    } catch (error) { console.warn('Failed to fetch client account:', error); }
  }, []);

  // Mémorisation des services pour éviter les re-rendus inutiles.
  const servicesValue = useMemo(() => ({
    createClient, updateCurrentUserProfile, updateUser, deleteUser,
    fetchCryptoAssets, fetchUsers, fetchClientAccount,
  }), [createClient, updateCurrentUserProfile, deleteUser, updateUser, fetchCryptoAssets, fetchUsers, fetchClientAccount]);

  // Rendu des providers imbriqués avec les enfants.
  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      <AppServicesContext.Provider value={servicesValue}>
        {children}
      </AppServicesContext.Provider>
    </AppStateContext.Provider>
  );
}

// ============================================================================
// Hook useAppState : accède à l'état de l'application.
// Lance une erreur si utilisé en dehors du provider.
// ============================================================================
export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used within an AppStateProvider');
  return context.state;
}

// ============================================================================
// Hook useAppServices : accède aux services de l'application.
// Lance une erreur si utilisé en dehors du provider.
// ============================================================================
export function useAppServices() {
  const context = useContext(AppServicesContext);
  if (!context) throw new Error('useAppServices must be used within an AppStateProvider');
  return context;
}

