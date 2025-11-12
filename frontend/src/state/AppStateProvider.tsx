import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';

import { nanoid } from 'nanoid';

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

const STORAGE_KEY = 'bitchest-app-state';

type AppStateContextValue = {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
};

type AppServicesContextValue = {
  createClient: (payload: CreateClientPayload) => { tempPassword: string; user: User };
  updateUser: (payload: UpdateUserPayload) => void;
  updateClientPassword: (userId: string, password: string) => void;
  deleteUser: (userId: string) => void;
  recordTransaction: (payload: RecordTransactionPayload) => void;
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
    default:
      return state;
  }
}

function generateTempPassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  return Array.from({ length: 10 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
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

  const createClient = useCallback(
    (payload: CreateClientPayload) => {
      const now = new Date().toISOString();
      const tempPassword = generateTempPassword();
      const user: User = {
        id: nanoid(),
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email.toLowerCase(),
        role: 'client',
        password: tempPassword,
        createdAt: now,
        updatedAt: now,
      };

      const account: ClientAccount = {
        userId: user.id,
        balanceEUR: 500,
        transactions: [],
      };

      dispatch({ type: 'create-client', payload: { user, account } });

      return { tempPassword, user };
    },
    [dispatch],
  );

  const updateUser = useCallback(
    (payload: UpdateUserPayload) => {
      dispatch({ type: 'update-user', payload });
    },
    [dispatch],
  );

  const updateClientPassword = useCallback(
    (userId: string, password: string) => {
      dispatch({ type: 'update-client-password', payload: { userId, newPassword: password } });
    },
    [dispatch],
  );

  const deleteUser = useCallback(
    (userId: string) => {
      dispatch({ type: 'delete-user', payload: { userId } });
    },
    [dispatch],
  );

  const recordTransaction = useCallback(
    (payload: RecordTransactionPayload) => {
      dispatch({ type: 'record-transaction', payload });
    },
    [dispatch],
  );

  const servicesValue = useMemo(
    () => ({ createClient, updateUser, updateClientPassword, deleteUser, recordTransaction }),
    [createClient, updateClientPassword, deleteUser, recordTransaction, updateUser],
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

