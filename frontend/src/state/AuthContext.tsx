import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { User } from './types';
import { useAppServices, useAppState } from './AppStateProvider';
import { api } from '../utils/api';

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  changePassword: (newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const SESSION_KEY = 'bitchest-active-user';

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const state = useAppState();
  const { updateClientPassword } = useAppServices();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Try to restore session by asking backend for /me if cookie session exists
    async function restore() {
      try {
        const res = await api.getCurrentUser();
        if (res && res.user) {
          const user = res.user;
          // Backend returns: id, first_name, last_name, email, role, balance_eur
          // Store the user ID for session restoration
          setCurrentUserId(String(user.id));
          window.localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: String(user.id) }));
          return;
        }
      } catch (error) {
        console.warn('Unable to restore BitChest session from API', error);
      }

      // fallback to local session
      const stored = window.localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as { userId: string };
        setCurrentUserId(parsed.userId);
      }
    }

    restore();
  }, []);

  const user = useMemo(
    () => state.users.find((candidate) => candidate.id === currentUserId) ?? null,
    [currentUserId, state.users],
  );

  const login: AuthContextValue['login'] = useCallback(
    async ({ email, password }) => {
      try {
        const payload = await api.login(email, password);
        if (payload && payload.user) {
          const user = payload.user;
          // Backend returns: id, first_name, last_name, email, role, balance_eur
          // Map to frontend User type - we'll look this up from state when needed
          setCurrentUserId(String(user.id));
          window.localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: String(user.id) }));
          return { success: true };
        }

        return { success: false, message: 'Login failed' };
      } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Network error' };
      }
    },
    [state.users],
  );

  const logout = useCallback(() => {
    // call backend to destroy session cookie
    api.logout().catch(() => {});
    setCurrentUserId(null);
    window.localStorage.removeItem(SESSION_KEY);
  }, []);

  const changePassword = useCallback(
    async (newPassword: string) => {
      if (!user) {
        throw new Error('No active user');
      }

      updateClientPassword(user.id, newPassword);
    },
    [updateClientPassword, user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
      changePassword,
    }),
    [changePassword, login, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

