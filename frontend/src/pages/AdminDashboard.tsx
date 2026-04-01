// ============================================================================
// Import des composants de routage de React Router.
// Navigate permet de rediriger programmatiquement vers une autre route.
// Route définit une correspondance entre un chemin et un composant.
// Routes est le conteneur pour les définitions de routes.
// ============================================================================
import { Navigate, Route, Routes } from 'react-router-dom';

// ============================================================================
// Import du hook useEffect pour les effets secondaires.
// useEffect est utilisé pour charger les données au montage du composant.
// ============================================================================
import { useEffect } from 'react';

// ============================================================================
// Import du composant de mise en page du tableau de bord.
// DashboardLayout fournit la structure commune (nav, header, sidebar).
// ============================================================================
import DashboardLayout from '../components/layout/DashboardLayout';

// ============================================================================
// Import des panneaux spécifiques à l'administration.
// AdminProfilePanel affiche et permet de modifier le profil admin.
// ClientManagementPanel permet de gérer les comptes clients.
// ============================================================================
import AdminProfilePanel from '../components/admin/AdminProfilePanel';
import ClientManagementPanel from '../components/admin/ClientManagementPanel';

// ============================================================================
// Import du panneau de vue du marché (partagé avec clients).
// MarketOverviewPanel affiche les prix des cryptomonnaies.
// ============================================================================
import MarketOverviewPanel from '../components/common/MarketOverviewPanel';

// ============================================================================
// Import des hooks de contexte pour l'état et l'auth.
// useAuth fournit l'utilisateur connecté et la fonction logout.
// useAppState fournit l'état global (users, cryptoAssets).
// useAppServices fournit les fonctions pour charger les données.
// ============================================================================
import { useAuth } from '../state/AuthContext';
import { useAppState, useAppServices } from '../state/AppStateProvider';

// ============================================================================
// Import du hook de notifications pour afficher des messages.
// useNotifications fournit addNotification pour les toasts.
// ============================================================================
import { useNotifications } from '../components/common/Notifications';

// ============================================================================
// Composant principal du tableau de bord administrateur.
// 'export default function' exporte ce composant comme export par défaut.
// AdminDashboard contient les routes imbriquées pour les sections admin.
// ============================================================================
export default function AdminDashboard() {
  // Extraction de l'utilisateur connecté et de la fonction logout.
  const { user, logout } = useAuth();
  // Accès à l'état global de l'application.
  const state = useAppState();
  // Extraction des fonctions de service pour charger les données.
  const { fetchCryptoAssets, fetchUsers } = useAppServices();
  // Fonction pour afficher des notifications.
  const { addNotification } = useNotifications();

  // ============================================================================
  // Effet pour charger les données au montage du composant.
  // useEffect avec tableau de dépendances exécute l'effet quand elles changent.
  // ============================================================================
  useEffect(() => {
    // Charge la liste des cryptomonnaies depuis l'API.
    fetchCryptoAssets();
    // Charge la liste des utilisateurs depuis l'API.
    fetchUsers();
  }, [fetchCryptoAssets, fetchUsers]);

  // ============================================================================
  // Redirection vers login si pas d'utilisateur connecté.
  // Cette vérification protège le tableau de bord.
  // ============================================================================
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // ============================================================================
  // Gestionnaire de déconnexion avec notification.
  // Affiche un message puis déconnecte après un délai.
  // ============================================================================
  const handleLogout = () => {
    addNotification('Logged Out', 'info', 'You have been logged out successfully.', 3000);
    // Délai pour permettre l'affichage de la notification.
    setTimeout(() => {
      logout();
    }, 500);
  };

  // ============================================================================
  // Configuration des éléments de navigation du dashboard.
  // Chaque item définit un label, un chemin, et une description.
  // ============================================================================
  const navItems = [
    { label: 'Profile', to: '/admin/profile', description: 'Manage your administrator account' },
    { label: 'Clients', to: '/admin/clients', description: 'Create, update, and remove client accounts' },
    { label: 'Markets', to: '/admin/market', description: 'Monitor supported cryptocurrency prices' },
  ];

  // ============================================================================
  // Rendu du dashboard avec les routes imbriquées.
  // DashboardLayout fournit la structure commune.
  // ============================================================================
  return (
    <DashboardLayout
      title="Administration"
      subtitle="Control BitChest accounts and monitor market activity"
      navItems={navItems}
      user={user}
      onLogout={handleLogout}
    >
      {/* Routes imbriquées dans le layout */}
      <Routes>
        {/* Route index redirige vers le profil par défaut */}
        <Route index element={<Navigate to="/admin/profile" replace />} />
        {/* Route pour la gestion du profil admin */}
        <Route path="profile" element={<AdminProfilePanel admin={user} />} />
        {/* Route pour la gestion des clients */}
        <Route path="clients" element={<ClientManagementPanel adminId={user.id} users={state.users} />} />
        {/* Route pour la vue du marché */}
        <Route path="market" element={<MarketOverviewPanel cryptoAssets={state.cryptoAssets} />} />
      </Routes>
    </DashboardLayout>
  );
}

