import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';

import type {
  AppAction,
  AppState,
  ClientAccount,
  CreateClientPayload,
  RecordTransactionPayload,
  UpdateUserPayload,
  User,
} from './types';
import { INITIAL_STATE } from './initialData';
import { api } from '../utils/api';
import { echoService } from '../utils/echo';

const STORAGE_KEY = 'bitchest-app-state';

type AppStateContextValue = {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
};

type AppServicesContextValue = {
  createClient: (payload: CreateClientPayload) => Promise<{ tempPassword: string; user: User }>;
  updateUser: (payload: UpdateUserPayload) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  recordTransaction: (payload: RecordTransactionPayload) => Promise<void>;
  fetchCryptoAssets: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchClientAccount: () => Promise<void>;
};

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);
const AppServicesContext = createContext<AppServicesContextValue | undefined>(undefined);

function persistState(state: AppState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Unable to persist BitChest state', error);
  }
}

function loadPersistedState(): AppState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppState) : null;
  } catch (error) {
    console.warn('Unable to load BitChest state from storage', error);
    return null;
  }
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'update-user': {
      const { userId, data } = action.payload;
      const users = state.users.map((user) =>
        user.id === userId
          ? {
              ...user,
              ...data,
              updatedAt: new Date().toISOString(),
            }
          : user,
      );
      return { ...state, users };
    }
    case 'create-client': {
      const { user, account } = action.payload;
      return {
        ...state,
        users: [...state.users, user],
        clientAccounts: {
          ...state.clientAccounts,
          [account.userId]: account,
        },
      };
    }
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
    case 'update-client-password': {
      const { userId, newPassword } = action.payload;
      const updatedUsers = state.users.map((user) =>
        user.id === userId
          ? {
              ...user,
              password: newPassword,
              updatedAt: new Date().toISOString(),
            }
          : user,
      );
      return { ...state, users: updatedUsers };
    }
    case 'record-transaction': {
      const { userId, transaction, balanceAdjustment } = action.payload;
      const account = state.clientAccounts[userId];
      if (!account) {
        return state;
      }

      const updatedAccount: ClientAccount = {
        ...account,
        balanceEUR: Number((account.balanceEUR + balanceAdjustment).toFixed(2)),
        transactions: [...account.transactions, transaction],
      };

      return {
        ...state,
        clientAccounts: { ...state.clientAccounts, [userId]: updatedAccount },
      };
    }
    case 'set-crypto-assets': {
      return {
        ...state,
        cryptoAssets: action.payload,
      };
    }
    case 'set-users': {
      return {
        ...state,
        users: action.payload,
      };
    }
    case 'set-client-account': {
      const { userId, account } = action.payload;
      return {
        ...state,
        clientAccounts: {
          ...state.clientAccounts,
          [userId]: account,
        },
      };
    }
    case 'update-crypto-price': {
      const { cryptoId, price } = action.payload;
      const asset = state.cryptoAssets[cryptoId];
      if (!asset) {
        return state;
      }

      const lastPoint = asset.history[asset.history.length - 1];
      const newHistory = [...asset.history];

      // If today's price already exists, update it; otherwise add new point
      if (lastPoint && lastPoint.date.split('T')[0] === new Date().toISOString().split('T')[0]) {
        newHistory[newHistory.length - 1] = {
          date: lastPoint.date,
          value: price,
        };
      } else {
        newHistory.push({
          date: new Date().toISOString(),
          value: price,
        });
      }

      // Keep only last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const filteredHistory = newHistory.filter((point) => new Date(point.date) >= thirtyDaysAgo);

      return {
        ...state,
        cryptoAssets: {
          ...state.cryptoAssets,
          [cryptoId]: {
            ...asset,
            history: filteredHistory,
          },
        },
      };
    }
    default:
      return state;
  }
}

type AppStateProviderProps = {
  children: React.ReactNode;
};

export function AppStateProvider({ children }: AppStateProviderProps) {
  const [state, dispatch] = useReducer(
    appReducer,
    INITIAL_STATE,
    (initial): AppState => {
      if (typeof window === 'undefined') {
        return initial;
      }
      const persisted = loadPersistedState();
      return persisted ?? initial;
    },
  );

  useEffect(() => {
    persistState(state);
  }, [state]);

  // Subscribe to live cryptocurrency price updates
  useEffect(() => {
    echoService.subscribeToprices((data: any) => {
      dispatch({
        type: 'update-crypto-price',
        payload: {
          cryptoId: data.cryptoId,
          price: data.price,
        },
      });
    });

    return () => {
      echoService.unsubscribe('crypto-prices');
    };
  }, []);

  const createClient = useCallback(
    async (payload: CreateClientPayload) => {
      const response: any = await api.createClient(payload.firstName, payload.lastName, payload.email);
      if (!response.success) {
        throw new Error(response.message || 'Failed to create client');
      }

      const user: User = {
        id: response.user.id,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        email: response.user.email,
        role: 'client',
        password: '',
        createdAt: response.user.createdAt,
        updatedAt: response.user.updatedAt,
      };

      const account: ClientAccount = {
        userId: user.id,
        balanceEUR: 500,
        transactions: [],
      };

      dispatch({ type: 'create-client', payload: { user, account } });

      return { tempPassword: response.temporaryPassword, user };
    },
    [],
  );

  const updateUser = useCallback(
    async (payload: UpdateUserPayload) => {
      const response: any = await api.updateProfile(payload.data);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update profile');
      }
      dispatch({ type: 'update-user', payload });
    },
    [],
  );

  const deleteUser = useCallback(
    async (userId: string) => {
      const response: any = await api.deleteClient(userId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete user');
      }
      dispatch({ type: 'delete-user', payload: { userId } });
    },
    [],
  );

  const recordTransaction = useCallback(
    async (payload: RecordTransactionPayload) => {
      dispatch({ type: 'record-transaction', payload });
    },
    [],
  );

  const fetchCryptoAssets = useCallback(async () => {
    try {
      const response: any = await api.getCryptocurrencies();
      if (response.success) {
        dispatch({ type: 'set-crypto-assets', payload: response.cryptoAssets });
      }
    } catch (error) {
      console.warn('Failed to fetch cryptocurrencies:', error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response: any = await api.getAllUsers();
      if (response.success) {
        dispatch({
          type: 'set-users',
          payload: response.users.map((u: any) => ({
            id: u.id,
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            role: u.role,
            password: '',
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
          })),
        });
      }
    } catch (error) {
      console.warn('Failed to fetch users:', error);
    }
  }, []);

  const fetchClientAccount = useCallback(async () => {
    try {
      const response: any = await api.getClientAccount();
      if (response.success) {
        dispatch({
          type: 'set-client-account',
          payload: {
            userId: response.account.userId,
            account: {
              userId: response.account.userId,
              balanceEUR: response.account.balanceEUR,
              transactions: response.account.transactions.map((t: any) => ({
                id: t.id,
                cryptoId: t.cryptoId,
                quantity: t.quantity,
                pricePerUnit: t.pricePerUnit,
                type: t.type,
                timestamp: t.timestamp,
              })),
            },
          },
        });
      }
    } catch (error) {
      console.warn('Failed to fetch client account:', error);
    }
  }, []);

  const servicesValue = useMemo(
    () => ({
      createClient,
      updateUser,
      deleteUser,
      recordTransaction,
      fetchCryptoAssets,
      fetchUsers,
      fetchClientAccount,
    }),
    [createClient, deleteUser, recordTransaction, updateUser, fetchCryptoAssets, fetchUsers, fetchClientAccount],
  );

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      <AppServicesContext.Provider value={servicesValue}>{children}</AppServicesContext.Provider>
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context.state;
}

export function useAppServices() {
  const context = useContext(AppServicesContext);
  if (!context) {
    throw new Error('useAppServices must be used within an AppStateProvider');
  }
  return context;
}

export function useAppDispatch() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppDispatch must be used within an AppStateProvider');
  }
  return context.dispatch;
}

