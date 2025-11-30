// Importe les composants de routage de react-router-dom pour créer les routes de l'application
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
// Importe le hook useEffect pour les effets secondaires (subscriptions WebSocket)
import { useEffect } from 'react';

// Importe le provider d'état global de l'application (utilisateurs, cryptos, transactions)
import { AppStateProvider } from './state/AppStateProvider';
// Importe le provider d'authentification et le hook useAuth pour accéder à l'état auth
import { AuthProvider, useAuth } from './state/AuthContext';
// Importe le hook, composant et provider pour gérer les notifications utilisateur (affichées en temps réel)
import { useNotifications, NotificationContainer, NotificationProvider } from './components/common/Notifications';
// Importe le service echo pour la communication WebSocket (prix des cryptos, transactions, balance)
import { echoService } from './utils/echo';
// Importe les pages de l'application
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';

/**
 * Type RequireAuthProps: Props du composant de protection des routes
 */
type RequireAuthProps = {
  // Tableau des rôles autorisés à accéder à cette route ('admin' ou 'client')
  allowedRoles: Array<'admin' | 'client'>;
};

/**
 * Composant RequireAuth: Protection des routes basée sur le rôle
 * 
 * Vérifie que l'utilisateur est authentifié et qu'il a le rôle requis
 * pour accéder à la route protégée, sinon le redirige
 */
function RequireAuth({ allowedRoles }: RequireAuthProps) {
  // Obtient la location actuelle (pour rediriger après connexion)
  const location = useLocation();
  // Récupère l'état d'authentification depuis le contexte Auth
  const { user, isAuthenticated, isLoading } = useAuth();

  // Pendant que l'authentification se charge, affiche "Loading..."
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Si non authentifié ou pas d'utilisateur, redirige vers la page de connexion
  if (!isAuthenticated || !user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Si le rôle de l'utilisateur n'est pas dans la liste des rôles autorisés
  // redirige l'utilisateur vers son dashboard approprié (admin ou client)
  if (!allowedRoles.includes(user.role)) {
    // Détermine la cible de redirection selon le rôle
    const target = user.role === 'admin' ? '/admin' : '/client';
    return <Navigate to={target} replace />;
  }

  // Si tout est OK, affiche les routes enfantes via Outlet
  return <Outlet />;
}

/**
 * Composant AppRoutes: Configuration des routes de l'application
 * 
 * Configure les routes protégées par rôle et les abonnements WebSocket
 * pour mettre à jour l'utilisateur en temps réel des changements (prix, transactions, balance)
 */
function AppRoutes() {
  // Récupère l'état de chargement et les données utilisateur authentifié
  const { isLoading, user } = useAuth();
  // Récupère les fonctions pour gérer les notifications utilisateur
  const { addNotification } = useNotifications();

  /**
   * Effect: Abonnement aux événements WebSocket utilisateur
   * 
   * S'abonne aux canaux privés pour recevoir en temps réel:
   * - Les changements de solde EUR (balance-changed)
   * - Les transactions complétées (transaction-completed)
   */
  useEffect(() => {
    // Vérifie que l'utilisateur est connecté avant d'écouter les événements
    if (user?.id) {
      // S'abonne aux événements utilisateur via WebSocket (canaux privés sécurisés)
      echoService.subscribeToUserEvents(
        user.id,
        // Callback: quand le solde EUR change (achat, vente, ou autres raisons)
        (data) => {
          // Ajoute une notification chaque fois que le solde EUR change
          addNotification(
            `Balance Changed: ${data.reason}`,     // Titre avec raison du changement
            'info',                                // Type: information
            // Description: nouveau solde et différence (+ ou -)
            `New balance: €${data.newBalance.toFixed(2)} (${data.balanceChange > 0 ? '+' : ''}€${data.balanceChange.toFixed(2)})`,
          );
        },
        // Callback: quand une transaction (achat/vente) est complétée avec succès
        (data) => {
          // Ajoute une notification de succès quand une transaction est complétée
          addNotification(
            // Titre: \"Purchase Completed\" (achat) ou \"Sale Completed\" (vente)
            `${data.type === 'buy' ? 'Purchase' : 'Sale'} Completed`,
            'success',  // Type: succès (notification positive, couleur verte)
            // Message détaillé de la transaction: quantité, prix, type
            `${data.message}`,
          );
        },
      );

      /**
       * Cleanup function: se désabonne du canal quand le composant se démonte
       * ou que l'ID utilisateur change (reconnexion)
       */
      return () => {
        echoService.unsubscribe(`user.${user.id}`);
      };
    }
  }, [user?.id, addNotification]);  // Dépendances: se réabonne si l'ID utilisateur change

  // Pendant que l'authentification se charge, affiche "Loading..."
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Retourne la structure de routage de l'application
  return (
    <Routes>
      {/* Route publique: page de connexion (accessible à tous) */}
      <Route path="/" element={<LoginPage />} />

      {/* Routes administrateur: protégées avec rôle 'admin' uniquement */}
      <Route element={<RequireAuth allowedRoles={['admin']} />}>
        {/* Tous les chemins /admin/* sont gérés par AdminDashboard */}
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Route>

      {/* Routes client: protégées avec rôle 'client' uniquement */}
      <Route element={<RequireAuth allowedRoles={['client']} />}>
        {/* Tous les chemins /client/* sont gérés par ClientDashboard */}
        <Route path="/client/*" element={<ClientDashboard />} />
      </Route>

      {/* Route catch-all: redirige toute route non reconnue vers la page de connexion */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * Composant NotificationWrapper: Affiche le conteneur de notifications
 * Doit être à l'intérieur de NotificationProvider
 */
function NotificationWrapper() {
  const { notifications, removeNotification } = useNotifications();
  return <NotificationContainer notifications={notifications} onRemove={removeNotification} />;
}

/**
 * Composant App: Point d'entrée de l'application React
 * 
 * Enveloppe l'application avec les providers d'état global:
 * - AppStateProvider: gère l'état global (utilisateurs, cryptos, transactions)
 * - AuthProvider: gère l'authentification et l'utilisateur connecté
 * - NotificationProvider: gère les notifications partagées
 */
export default function App() {
  return (
    // Provider d'état applicatif global pour accéder aux utilisateurs, cryptos, transactions
    <AppStateProvider>
      {/* Provider d'authentification pour accéder à l'utilisateur connecté et son rôle */}
      <AuthProvider>
        {/* Provider de notifications pour partager l'état des notifications entre tous les composants */}
        <NotificationProvider>
          {/* Composant de routage qui configure toutes les routes de l'application */}
          <AppRoutes />
          {/* Conteneur des notifications: affiche toutes les notifications de l'application */}
          <NotificationWrapper />
        </NotificationProvider>
      </AuthProvider>
    </AppStateProvider>
  );
}

