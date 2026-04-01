
// ============================================================================
// Import des hooks React pour la gestion d'état et du contexte d'authentification.
// createContext crée un objet Context pour partager l'état d'auth entre composants.
// useCallback mémorise les fonctions pour éviter les re-créations à chaque rendu.
// useContext permet d'accéder aux valeurs du contexte d'authentification.
// useEffect exécute des effets comme la vérification de session au montage.
// useMemo mémorise la valeur du contexte pour optimiser les performances.
// useState gère l'état local de l'utilisateur et du chargement.
// ============================================================================
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// ============================================================================
// Import du type User pour typer les données utilisateur.
// 'type' importe uniquement la définition de type sans le code runtime.
// User contient les propriétés : id, firstName, lastName, email, role, etc.
// ============================================================================
import type { User } from './types';

// ============================================================================
// Import du service API pour les appels d'authentification.
// 'api' est l'instance singleton du service ApiService.
// Ce service gère les requêtes HTTP vers le backend Laravel.
// ============================================================================
import { api } from '../utils/api';

// ============================================================================
// Définition du type AuthContextValue : structure des données du contexte.
// Ce type définit toutes les propriétés et méthodes exposées par le contexte.
// Les composants enfants accèdent à ces valeurs via le hook useAuth.
// ============================================================================
type AuthContextValue = {
  // user contient l'objet utilisateur connecté ou null si déconnecté.
  user: User | null;
  // isAuthenticated est un booléen indiquant si un utilisateur est connecté.
  isAuthenticated: boolean;
  // isLoading est true pendant la vérification initiale de la session.
  isLoading: boolean;
  // login est la fonction asynchrone pour authentifier un utilisateur.
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  // logout est la fonction asynchrone pour déconnecter l'utilisateur.
  logout: () => Promise<void>;
  // changePassword permet de changer le mot de passe de l'utilisateur.
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  // updateUser met à jour les données utilisateur dans l'état local.
  updateUser: (userData: Partial<User>) => void;
};

// ============================================================================
// Création du contexte d'authentification avec valeur initiale undefined.
// createContext<T | undefined>(undefined) crée un contexte typé.
// undefined comme valeur par défaut permet de détecter l'utilisation hors provider.
// ============================================================================
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ============================================================================
// Type pour les props du composant AuthProvider.
// children représente les composants React enfants à envelopper.
// React.ReactNode accepte tout type de contenu rendable par React.
// ============================================================================
type AuthProviderProps = {
  children: React.ReactNode;
};

// ============================================================================
// Composant AuthProvider : fournit le contexte d'authentification.
// 'export function' exporte et déclare le composant simultanément.
// Ce provider doit envelopper tous les composants nécessitant l'authentification.
// ============================================================================
export function AuthProvider({ children }: AuthProviderProps) {

  // ============================================================================
  // État local pour stocker l'utilisateur connecté.
  // useState<User | null>(null) initialise user à null (non connecté).
  // setUser est la fonction pour mettre à jour l'état user.
  // ============================================================================
  const [user, setUser] = useState<User | null>(null);

  // ============================================================================
  // État local pour indiquer si la vérification d'auth est en cours.
  // useState(true) initialise isLoading à true car on vérifie au démarrage.
  // setIsLoading permet de passer à false une fois la vérification terminée.
  // ============================================================================
  const [isLoading, setIsLoading] = useState(true);

  // ============================================================================
  // Effet pour vérifier la session au montage du composant.
  // useEffect avec tableau vide [] s'exécute une seule fois au montage.
  // checkAuth est une fonction asynchrone définie à l'intérieur de l'effet.
  // ============================================================================
  useEffect(() => {
    // Fonction asynchrone pour vérifier l'authentification existante.
    const checkAuth = async () => {
      try {
        // Appel API pour récupérer l'utilisateur actuellement connecté.
        const response: any = await api.getCurrentUser();
        // Si la réponse est positive et contient un user, on met à jour l'état.
        if (response.success && response.user) {
          // setUser met à jour l'état avec les données utilisateur structurées.
          setUser({
            id: response.user.id,
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            email: response.user.email,
            role: response.user.role,
            password: '', // Le mot de passe n'est jamais exposé côté client.
            createdAt: response.user.createdAt,
            updatedAt: response.user.updatedAt,
          });
        }
      } catch (error) {
        // console.warn affiche un avertissement si la session ne peut être restaurée.
        console.warn('Unable to restore session', error);
      } finally {
        // finally s'exécute toujours, que try réussisse ou échoue.
        // On passe isLoading à false car la vérification est terminée.
        setIsLoading(false);
      }
    };
    // Appel de la fonction checkAuth définie ci-dessus.
    checkAuth();
  }, []);

  // ============================================================================
  // Fonction login mémorisée pour l'authentification des utilisateurs.
  // useCallback évite de recréer la fonction à chaque rendu.
  // Le type AuthContextValue['login'] assure la conformité avec l'interface.
  // ============================================================================
  const login: AuthContextValue['login'] = useCallback(
    async ({ email, password }) => {
      try {
        // Appel API pour authentifier avec email et mot de passe.
        const response: any = await api.login(email, password);
        // Si authentification réussie, on met à jour l'état user.
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
        // Si échec, retourne success: false avec le message d'erreur.
        return { success: false, message: response.message || 'Login failed' };
      } catch (error: any) {
        // En cas d'exception, retourne un objet d'erreur.
        return { success: false, message: error.message || 'Login failed' };
      }
    },
    [], // Tableau de dépendances vide car pas de dépendances externes.
  );

  // ============================================================================
  // Fonction logout mémorisée pour la déconnexion.
  // useCallback avec [] signifie que la fonction ne change jamais.
  // async indique que cette fonction retourne une Promise.
  // ============================================================================
  const logout = useCallback(async () => {
    try {
      // Appel API pour déconnecter côté serveur (invalider la session).
      await api.logout();
    } catch (error) {
      // On log l'erreur mais on déconnecte quand même côté client.
      console.warn('Logout error:', error);
    } finally {
      // setUser(null) réinitialise l'état pour indiquer qu'aucun user n'est connecté.
      setUser(null);
    }
  }, []);

  // ============================================================================
  // Fonction changePassword mémorisée pour changer le mot de passe.
  // Cette fonction dépend de 'user' car elle vérifie l'existence d'un utilisateur.
  // Elle lance une erreur si aucun utilisateur n'est connecté.
  // ============================================================================
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      // Vérifie qu'un utilisateur est connecté avant de continuer.
      if (!user) {
        throw new Error('No active user');
      }
      try {
        // Appel API pour changer le mot de passe.
        const response: any = await api.changePassword(currentPassword, newPassword);
        // Si l'API retourne un échec, on lance une erreur.
        if (!response.success) {
          throw new Error(response.message || 'Failed to change password');
        }
      } catch (error) {
        // Re-lance l'erreur pour que l'appelant puisse la gérer.
        throw error;
      }
    },
    [user], // Dépend de user pour la vérification.
  );

  // ============================================================================
  // Fonction updateUserData mémorisée pour mettre à jour les données locales.
  // Cette fonction ne fait pas d'appel API, elle met juste à jour l'état.
  // Partial<User> permet de ne passer que les propriétés à modifier.
  // ============================================================================
  const updateUserData = useCallback((userData: Partial<User>) => {
    // setUser avec une fonction reçoit l'état précédent.
    setUser((prevUser) => {
      // Si pas d'utilisateur précédent, retourne null.
      if (!prevUser) {
        return null;
      }
      // Fusionne les anciennes données avec les nouvelles.
      return {
        ...prevUser,
        ...userData,
      };
    });
  }, []);

  // ============================================================================
  // Mémorisation de la valeur du contexte pour éviter les re-rendus inutiles.
  // useMemo recalcule la valeur seulement si les dépendances changent.
  // Le type générique <AuthContextValue> assure le typage correct.
  // ============================================================================
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user), // Convertit user en booléen.
      isLoading,
      login,
      logout,
      changePassword,
      updateUser: updateUserData,
    }),
    [changePassword, isLoading, login, logout, user, updateUserData],
  );

  // ============================================================================
  // Rendu du provider avec la valeur mémorisée.
  // AuthContext.Provider fournit 'value' à tous les composants enfants.
  // {children} rend les composants enfants passés au provider.
  // ============================================================================
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// Hook useAuth pour accéder au contexte d'authentification.
// 'export function' exporte le hook pour l'utilisation dans d'autres fichiers.
// Ce hook lance une erreur s'il est utilisé en dehors d'un AuthProvider.
// ============================================================================
export function useAuth() {
  // useContext récupère la valeur actuelle du contexte.
  const context = useContext(AuthContext);
  // Si context est undefined, le hook est utilisé hors du provider.
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // Retourne le contexte contenant user, login, logout, etc.
  return context;
}

