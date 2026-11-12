// Hedha el context mta3 l'authentification - ydabber 3la login, logout, w session mta3 el user
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { User } from './types';

import { api } from '../utils/api';

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {

  const [user, setUser] = useState<User | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  // Ki yetmounte el component, nchoufou ka3d el user connecté wella le
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response: any = await api.getCurrentUser();
        if (response.success && response.user) {
          setUser({
            id: response.user.id,
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            email: response.user.email,
            role: response.user.role,
            password: '',
            createdAt: response.user.createdAt,
            updatedAt: response.user.updatedAt,
          });
        }
      } catch (error) {
        console.warn('Unable to restore session', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Na3mlou login bel email w password w nsajlou el user fil state
  const login: AuthContextValue['login'] = useCallback(
    async ({ email, password }) => {
      try {
        const response: any = await api.login(email, password);
        if (response.success && response.user) {
          setUser({
            id: response.user.id,
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            email: response.user.email,
            role: response.user.role,
            password: '',
            createdAt: response.user.createdAt,
            updatedAt: response.user.updatedAt,
          });
          return { success: true };
        }
        return { success: false, message: response.message || 'Login failed' };
      } catch (error: any) {
        return { success: false, message: error.message || 'Login failed' };
      }
    },
    [],
  );

  // Logout: na7yiw el session mel serveur w nfar8ou el state mta3 el user
  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch (error) {
      console.warn('Logout error:', error);
    } finally {
      setUser(null);
    }
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!user) {
        throw new Error('No active user');
      }
      try {
        const response: any = await api.changePassword(currentPassword, newPassword);
        if (!response.success) {
          throw new Error(response.message || 'Failed to change password');
        }
      } catch (error) {
        throw error;
      }
    },
    [user],
  );

  const updateUserData = useCallback((userData: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) {
        return null;
      }
      return {
        ...prevUser,
        ...userData,
      };
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
      changePassword,
      updateUser: updateUserData,
    }),
    [changePassword, isLoading, login, logout, user, updateUserData],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook useAuth: kol component ynejem yosel lel user connecté w les fonctions mta3 l'auth
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
