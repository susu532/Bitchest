
// ============================================================================
// Import des composants de routage de React Router.
// Navigate redirige vers une autre route programmatiquement.
// Route définit une correspondance entre un chemin et un composant.
// Routes est le conteneur pour les définitions de routes.
// ============================================================================
import { Navigate, Route, Routes } from 'react-router-dom';

// ============================================================================
// Import du hook useEffect pour les effets secondaires.
// useEffect charge les données au montage et lors des changements de dépendances.
// ============================================================================
import { useEffect } from 'react';

// ============================================================================
// Import du composant de mise en page du tableau de bord.
// DashboardLayout fournit la structure commune (navigation, header, sidebar).
// ============================================================================
import DashboardLayout from '../components/layout/DashboardLayout';

// ============================================================================
// Import des panneaux spécifiques au client.
// ClientOverviewPanel affiche un résumé du portefeuille.
// ClientWalletPanel permet d'acheter/vendre des cryptos.
// ClientProfilePanel affiche et permet de modifier le profil.
// ============================================================================
import ClientOverviewPanel from '../components/client/ClientOverviewPanel';
import ClientWalletPanel from '../components/client/ClientWalletPanel';
import ClientProfilePanel from '../components/client/ClientProfilePanel';

// ============================================================================
// Import du panneau de vue du marché (partagé avec admin).
// MarketOverviewPanel affiche les prix des cryptomonnaies en temps réel.
// ============================================================================
import MarketOverviewPanel from '../components/common/MarketOverviewPanel';

// ============================================================================
// Import des hooks de contexte pour l'état et l'authentification.
// useAuth fournit l'utilisateur connecté et les fonctions d'auth.
// useAppState fournit l'état global (clientAccounts, cryptoAssets).
// useAppServices fournit les fonctions de chargement des données.
// ============================================================================
import { useAuth } from '../state/AuthContext';
import { useAppState, useAppServices } from '../state/AppStateProvider';

// ============================================================================
// Import du hook de notifications pour afficher des messages toast.
// useNotifications fournit addNotification pour les alertes utilisateur.
// ============================================================================
import { useNotifications } from '../components/common/Notifications';

// ============================================================================
// Composant principal du tableau de bord client.
// 'export default function' exporte ce composant comme export par défaut.
// ClientDashboard gère les routes imbriquées pour les sections client.
// ============================================================================
export default function ClientDashboard() {

  // ============================================================================
  // Extraction de l'utilisateur connecté et de la fonction logout.
  // user contient les données de l'utilisateur (id, role, email, etc.).
  // logout déconnecte l'utilisateur et le redirige vers login.
  // ============================================================================
  const { user, logout } = useAuth();

  // ============================================================================
  // Accès à l'état global de l'application.
  // state contient cryptoAssets, users, et clientAccounts.
  // ============================================================================
  const state = useAppState();

  // ============================================================================
  // Extraction des fonctions de service pour charger les données.
  // fetchCryptoAssets charge les cryptomonnaies depuis l'API.
  // fetchClientAccount charge le compte du client connecté.
  // ============================================================================
  const { fetchCryptoAssets, fetchClientAccount } = useAppServices();

  // ============================================================================
  // Fonction pour afficher des notifications à l'utilisateur.
  // addNotification prend un titre, type, message et durée optionnelle.
  // ============================================================================
  const { addNotification } = useNotifications();

  // ============================================================================
  // Effet pour charger les données au montage du composant.
  // Les dépendances incluent les fonctions de fetch et l'ID utilisateur.
  // ============================================================================
  useEffect(() => {
    // Charge la liste des cryptomonnaies depuis l'API.
    fetchCryptoAssets();
    // Charge le compte client si l'utilisateur est connecté.
    // user?.id utilise l'optional chaining pour éviter les erreurs si user est null.
    if (user?.id) {
      fetchClientAccount();
    }
  }, [fetchCryptoAssets, fetchClientAccount, user?.id]);

  // ============================================================================
  // Redirection vers login si pas d'utilisateur connecté.
  // Cette vérification protège le tableau de bord client.
  // ============================================================================
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // ============================================================================
  // Récupération du compte client depuis l'état global.
  // Le compte est indexé par l'ID utilisateur dans clientAccounts.
  // ============================================================================
  const account = state.clientAccounts[user.id];

  // ============================================================================
  // Gestionnaire de déconnexion avec notification.
  // Affiche un message de confirmation puis déconnecte après un délai.
  // ============================================================================
  const handleLogout = () => {
    addNotification('Logged Out', 'info', 'You have been logged out successfully.', 3000);
    // Délai court pour permettre l'affichage de la notification.
    setTimeout(() => {
      logout();
    }, 500);
  };

  // ============================================================================
  // Affichage d'un message si le compte client n'est pas trouvé.
  // Cela peut arriver si le compte n'a pas encore été créé.
  // ============================================================================
  if (!account) {
    return (
      <DashboardLayout
        title="Client area"
        subtitle="Manage your BitChest wallet and monitor the market"
        navItems={[]}
        user={user}
        onLogout={handleLogout}
      >
        <p>Your wallet is not available at the moment. Please contact support.</p>
      </DashboardLayout>
    );
  }

  // ============================================================================
  // Configuration des éléments de navigation du dashboard client.
  // Chaque item définit un label, un chemin, et une description.
  // ============================================================================
  const navItems = [
    { label: 'Overview', to: '/client/overview', description: 'Portfolio snapshot at a glance' },
    { label: 'Wallet', to: '/client/wallet', description: 'Transactions, holdings, and trading' },
    { label: 'Markets', to: '/client/market', description: 'Crypto prices and performance' },
    { label: 'Profile', to: '/client/profile', description: 'Personal information and security' },
  ];

  // ============================================================================
  // Rendu du dashboard avec les routes imbriquées.
  // DashboardLayout fournit la structure commune (header, nav, footer).
  // ============================================================================
  return (
    <DashboardLayout
      title="Client area"
      subtitle="Manage your BitChest wallet and stay on top of the market"
      navItems={navItems}
      user={user}
      onLogout={handleLogout}
    >
      {/* Conteneur des routes imbriquées */}
      <Routes>
        {/* Route index redirige vers la vue d'ensemble par défaut */}
        <Route index element={<Navigate to="/client/overview" replace />} />

        {/* Route pour la vue d'ensemble du portefeuille */}
        <Route
          path="overview"
          element={<ClientOverviewPanel account={account} cryptoAssets={state.cryptoAssets} user={user} />}
        />

        {/* Route pour le portefeuille et les transactions */}
        <Route
          path="wallet"
          element={<ClientWalletPanel account={account} cryptoAssets={state.cryptoAssets} />}
        />

        {/* Route pour la vue du marché crypto */}
        <Route path="market" element={<MarketOverviewPanel cryptoAssets={state.cryptoAssets} />} />

        {/* Route pour le profil utilisateur */}
        <Route path="profile" element={<ClientProfilePanel user={user} />} />
      </Routes>
    </DashboardLayout>
  );
}

