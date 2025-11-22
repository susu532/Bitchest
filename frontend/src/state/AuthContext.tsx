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
    // Try to restore session by asking backend for /me if cookie session exists
    async function restore() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE}/me`, {
          credentials: 'include',
        });
        if (res.ok) {
          const user = await res.json();
          if (user && user.id) {
            setCurrentUserId(String(user.id));
            window.localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: String(user.id) }));
            return;
          }
        }

        // fallback to local session
        const stored = window.localStorage.getItem(SESSION_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as { userId: string };
          setCurrentUserId(parsed.userId);
        }
      } catch (error) {
        console.warn('Unable to restore BitChest session from API', error);
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
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { success: false, message: data.message ?? 'Login failed' };
      }

      const payload = await res.json();
      if (payload.user && payload.user.id) {
        setCurrentUserId(String(payload.user.id));
        window.localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: String(payload.user.id) }));
        return { success: true };
      }

      return { success: false, message: 'Login failed' };
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
    },
    [state.users],
  );

  const logout = useCallback(() => {
    // call backend to destroy session cookie
    fetch(`${import.meta.env.VITE_API_BASE}/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
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

