import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';

import { nanoid } from 'nanoid';

import type {
  AppAction,
  AppState,
  ClientAccount,
  CreateClientPayload,
  CryptoAsset,
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
    case 'set-crypto-assets': {
      return { ...state, cryptoAssets: action.payload };
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

  // Try to fetch cryptos from backend and merge with local assets (to obtain icons / ids)
  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE;
    async function loadBackendCryptos() {
      try {
        const res = await fetch(`${apiBase}/cryptos`, { credentials: 'include' });
        if (!res.ok) return;

        const list = await res.json();
        // list items: { id, symbol, name, price }
        const mapped: Record<string, CryptoAsset> = {} as Record<string, CryptoAsset>;
        // use constants to keep icons and stable ids
        const { CRYPTOCURRENCIES } = await import('../constants/cryptocurrencies');

        await Promise.all(
          list.map(async (c: any) => {
            const local = CRYPTOCURRENCIES.find((lc) => lc.symbol === c.symbol);
            const assetId = local?.id ?? String(c.id);
            const icon = local?.icon ?? '/assets/placeholder.png';

            // fetch history
            const hRes = await fetch(`${apiBase}/cryptos/${c.id}/history`, { credentials: 'include' });
            const historyRaw = hRes.ok ? await hRes.json() : [];
            const history = historyRaw.map((r: any) => ({ date: new Date(r.date).toISOString(), value: Number(r.price) }));

            mapped[assetId] = {
              id: assetId,
              name: c.name,
              symbol: c.symbol,
              icon,
              // numeric id in backend DB
              backendId: c.id,
              history,
            } as CryptoAsset;
          }),
        );

        // replace crypto assets in state, keeping existing ones if backend unavailable
        dispatch({ type: 'set-crypto-assets', payload: { ...(state.cryptoAssets ?? {}), ...mapped } });
      } catch (err) {
        // ignore failures; keep local generated data
      }
    }

    loadBackendCryptos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const apiBase = import.meta.env.VITE_API_BASE;
      (async () => {
        try {
          await fetch(`${apiBase}/admin/users/${payload.userId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload.data),
          });
        } catch (err) {
          // ignore network failure and fall through to local update
        } finally {
          dispatch({ type: 'update-user', payload });
        }
      })();
    },
    [dispatch],
  );

  const updateClientPassword = useCallback(
    (userId: string, password: string) => {
      const apiBase = import.meta.env.VITE_API_BASE;
      (async () => {
        try {
          await fetch(`${apiBase}/me/password`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ current_password: password, new_password: password, new_password_confirmation: password }),
          });
        } catch (err) {
          // ignore network error; local update still applied
        } finally {
          dispatch({ type: 'update-client-password', payload: { userId, newPassword: password } });
        }
      })();
    },
    [dispatch],
  );

  const deleteUser = useCallback(
    (userId: string) => {
      const apiBase = import.meta.env.VITE_API_BASE;
      (async () => {
        try {
          await fetch(`${apiBase}/admin/users/${userId}`, { method: 'DELETE', credentials: 'include' });
        } catch (err) {
          // ignore
        } finally {
          dispatch({ type: 'delete-user', payload: { userId } });
        }
      })();
    },
    [dispatch],
  );

  const recordTransaction = useCallback(
    (payload: RecordTransactionPayload) => {
      const apiBase = import.meta.env.VITE_API_BASE;
      (async () => {
        try {
          // call appropriate endpoint
          const type = payload.transaction.type;
          const cryptoId = payload.transaction.cryptoId;
          const asset = state.cryptoAssets[cryptoId];
          const backendCryptoId = asset?.backendId ?? cryptoId;
          const quantity = payload.transaction.quantity;

          const endpoint = type === 'buy' ? 'wallet/buy' : 'wallet/sell';
          const res = await fetch(`${apiBase}/${endpoint}`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cryptocurrency_id: backendCryptoId, quantity }),
          });

          if (!res.ok) throw new Error('Transaction failed');

          // Transaction recorded, state updated via dispatch above
          // Balance updates would be handled by fetching fresh wallet data if needed
        } catch (err) {
          // network failure -> fall back to local operations
          dispatch({ type: 'record-transaction', payload });
        }
      })();
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

