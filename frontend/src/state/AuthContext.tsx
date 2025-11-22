import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { User } from './types';
import { useAppServices, useAppState } from './AppStateProvider';

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
    try {
      const stored = window.localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as { userId: string };
        setCurrentUserId(parsed.userId);
      }
    } catch (error) {
      console.warn('Unable to restore BitChest session', error);
    }
  }, []);

  const user = useMemo(
    () => state.users.find((candidate) => candidate.id === currentUserId) ?? null,
    [currentUserId, state.users],
  );

  const login: AuthContextValue['login'] = useCallback(
    async ({ email, password }) => {
      const normalizedEmail = email.trim().toLowerCase();
      const found = state.users.find((candidate) => candidate.email === normalizedEmail);

      if (!found) {
        return { success: false, message: 'Account not found' };
      }

      if (found.password !== password) {
        return { success: false, message: 'Invalid credentials' };
      }

      setCurrentUserId(found.id);
      window.localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: found.id }));

      return { success: true };
    },
    [state.users],
  );

  const logout = useCallback(() => {
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

