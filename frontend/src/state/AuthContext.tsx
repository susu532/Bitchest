// Importe les fonctions React essentielles pour la gestion d'état et contexte
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// Importe le type User depuis les types de l'état
import type { User } from './types';
// Importe le service API pour les requêtes d'authentification
import { api } from '../utils/api';

// Définit le type pour les valeurs du contexte d'authentification
type AuthContextValue = {
  // Utilisateur actuellement connecté (null si non connecté)
  user: User | null;
  // Booléen indiquant si un utilisateur est actuellement connecté
  isAuthenticated: boolean;
  // Booléen indiquant si la vérification d'authentification est en cours de chargement
  isLoading: boolean;
  // Fonction pour connecter un utilisateur avec email et mot de passe
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  // Fonction pour déconnecter l'utilisateur actuellement connecté
  logout: () => Promise<void>;
  // Fonction pour changer le mot de passe de l'utilisateur connecté
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  // Fonction pour mettre à jour les données de l'utilisateur dans le contexte
  updateUser: (userData: Partial<User>) => void;
};

// Crée le contexte React pour l'authentification
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Définit le type pour les props du provider d'authentification
type AuthProviderProps = {
  // Éléments enfants à envelopper avec le provider
  children: React.ReactNode;
};

// Composant provider qui gère l'état d'authentification global
export function AuthProvider({ children }: AuthProviderProps) {
  // État pour stocker l'utilisateur actuellement connecté
  const [user, setUser] = useState<User | null>(null);
  // État pour indiquer si le chargement initial de la session est en cours
  const [isLoading, setIsLoading] = useState(true);

  // Effet qui s'exécute au montage du composant pour vérifier la session existante
  useEffect(() => {
    // Fonction asynchrone pour vérifier si un utilisateur a une session active
    const checkAuth = async () => {
      try {
        // Appelle l'API pour récupérer l'utilisateur actuellement connecté
        const response: any = await api.getCurrentUser();
        // Si l'API retourne succès et un utilisateur
        if (response.success && response.user) {
          // Crée un objet utilisateur avec les données de la réponse
          setUser({
            // ID de l'utilisateur
            id: response.user.id,
            // Prénom de l'utilisateur
            firstName: response.user.firstName,
            // Nom de famille de l'utilisateur
            lastName: response.user.lastName,
            // Email de l'utilisateur
            email: response.user.email,
            // Rôle de l'utilisateur (admin ou client)
            role: response.user.role,
            // Mot de passe (vide pour des raisons de sécurité)
            password: '',
            // Date de création de l'utilisateur
            createdAt: response.user.createdAt,
            // Date de dernière mise à jour
            updatedAt: response.user.updatedAt,
          });
        }
      } catch (error) {
        // Affiche un avertissement si la vérification de session échoue
        console.warn('Unable to restore session', error);
      } finally {
        // Marque le chargement comme terminé
        setIsLoading(false);
      }
    };

    // Exécute la vérification de session au montage
    checkAuth();
  }, []);

  // Fonction de connexion mémoïsée qui accepte email et mot de passe
  const login: AuthContextValue['login'] = useCallback(
    async ({ email, password }) => {
      try {
        // Envoie les identifiants à l'API
        const response: any = await api.login(email, password);
        // Si la connexion réussit et un utilisateur est retourné
        if (response.success && response.user) {
          // Met à jour l'état utilisateur avec les données du serveur
          setUser({
            // ID de l'utilisateur
            id: response.user.id,
            // Prénom de l'utilisateur
            firstName: response.user.firstName,
            // Nom de famille de l'utilisateur
            lastName: response.user.lastName,
            // Email de l'utilisateur
            email: response.user.email,
            // Rôle de l'utilisateur
            role: response.user.role,
            // Mot de passe (vide)
            password: '',
            // Date de création
            createdAt: response.user.createdAt,
            // Date de dernière mise à jour
            updatedAt: response.user.updatedAt,
          });
          // Retourne le succès
          return { success: true };
        }
        // Retourne un échec avec le message du serveur
        return { success: false, message: response.message || 'Login failed' };
      } catch (error: any) {
        // Retourne un échec avec le message d'erreur
        return { success: false, message: error.message || 'Login failed' };
      }
    },
    [],
  );

  // Fonction de déconnexion mémoïsée
  const logout = useCallback(async () => {
    try {
      // Appelle l'API pour se déconnecter
      await api.logout();
    } catch (error) {
      // Affiche un avertissement si la déconnexion échoue
      console.warn('Logout error:', error);
    } finally {
      // Réinitialise l'utilisateur à null (déconnecte même en cas d'erreur)
      setUser(null);
    }
  }, []);

  // Fonction pour changer le mot de passe de l'utilisateur connecté
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      // Vérifie qu'un utilisateur est connecté
      if (!user) {
        // Lance une erreur si aucun utilisateur n'est connecté
        throw new Error('No active user');
      }

      try {
        // Envoie les anciens et nouveaux mots de passe à l'API
        const response: any = await api.changePassword(currentPassword, newPassword);
        // Si le changement échoue
        if (!response.success) {
          // Lance une erreur avec le message du serveur
          throw new Error(response.message || 'Failed to change password');
        }
      } catch (error) {
        // Relance l'erreur pour la gérer au niveau du composant appelant
        throw error;
      }
    },
    [user],
  );

  // Fonction pour mettre à jour les données de l'utilisateur dans le contexte
  const updateUserData = useCallback((userData: Partial<User>) => {
    // Met à jour l'état utilisateur en fusionnant les nouvelles données
    setUser((prevUser) => {
      // Si pas d'utilisateur précédent, retourne null
      if (!prevUser) {
        return null;
      }
      // Fusionne les données précédentes avec les nouvelles
      return {
        ...prevUser,
        ...userData,
      };
    });
  }, []);

  // Crée la valeur du contexte en memoisant pour optimiser les re-rendus
  const value = useMemo<AuthContextValue>(
    () => ({
      // L'utilisateur actuellement connecté
      user,
      // Booléen indiquant si un utilisateur est connecté
      isAuthenticated: Boolean(user),
      // État du chargement initial
      isLoading,
      // Fonction de connexion
      login,
      // Fonction de déconnexion
      logout,
      // Fonction de changement de mot de passe
      changePassword,
      // Fonction de mise à jour des données utilisateur
      updateUser: updateUserData,
    }),
    [changePassword, isLoading, login, logout, user, updateUserData],
  );

  // Retourne le provider avec la valeur du contexte
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook pour accéder au contexte d'authentification
export function useAuth() {
  // Récupère le contexte
  const context = useContext(AuthContext);
  // Si le contexte n'existe pas, lance une erreur
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // Retourne le contexte
  return context;
}

