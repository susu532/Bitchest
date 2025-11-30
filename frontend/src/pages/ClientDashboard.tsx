// Importe les composants de routage pour gérer la navigation interne du dashboard
import { Navigate, Route, Routes } from 'react-router-dom';
// Importe le hook useEffect pour charger les données au montage
import { useEffect } from 'react';

// Importe le layout principal du dashboard (structure commune avec sidebar)
import DashboardLayout from '../components/layout/DashboardLayout';
// Importe les différents panneaux (pages) du dashboard client
import ClientOverviewPanel from '../components/client/ClientOverviewPanel';
import ClientWalletPanel from '../components/client/ClientWalletPanel';
import MarketOverviewPanel from '../components/common/MarketOverviewPanel';
import ClientProfilePanel from '../components/client/ClientProfilePanel';

// Importe les hooks pour accéder à l'authentification et à l'état global
import { useAuth } from '../state/AuthContext';
import { useAppState, useAppServices } from '../state/AppStateProvider';
import { useNotifications } from '../components/common/Notifications';

// Composant principal du Dashboard Client
// Gère le chargement des données initiales et le routage des sous-pages
export default function ClientDashboard() {
  // Récupère l'utilisateur connecté et la fonction de déconnexion
  const { user, logout } = useAuth();
  // Récupère l'état global (comptes, cryptos)
  const state = useAppState();
  // Récupère les services pour charger les données
  const { fetchCryptoAssets, fetchClientAccount } = useAppServices();
  // Récupère la fonction d'ajout de notifications
  const { addNotification } = useNotifications();

  // Effet pour charger les données nécessaires au démarrage du dashboard
  useEffect(() => {
    // Charge la liste des cryptomonnaies et leurs prix
    fetchCryptoAssets();
    // Si l'utilisateur est connecté, charge son compte (solde, transactions)
    if (user?.id) {
      fetchClientAccount();
    }
  }, [fetchCryptoAssets, fetchClientAccount, user?.id]);

  // Sécurité: Si pas d'utilisateur, redirige vers la page de connexion
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Récupère le compte spécifique de l'utilisateur connecté depuis l'état global
  const account = state.clientAccounts[user.id];

  // Wrapper pour logout avec notification
  const handleLogout = () => {
    addNotification('Logged Out', 'info', 'You have been logged out successfully.', 3000);
    // Petit délai pour laisser voir la notification avant de rediriger
    setTimeout(() => {
      logout();
    }, 500);
  };

  // Si le compte n'est pas encore chargé (ou n'existe pas)
  if (!account) {
    return (
      // Affiche le layout avec un message d'erreur/attente
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

  // Définit les éléments de navigation de la barre latérale
  const navItems = [
    { label: 'Overview', to: '/client/overview', description: 'Portfolio snapshot at a glance' },
    { label: 'Wallet', to: '/client/wallet', description: 'Transactions, holdings, and trading' },
    { label: 'Markets', to: '/client/market', description: 'Crypto prices and performance' },
    { label: 'Profile', to: '/client/profile', description: 'Personal information and security' },
  ];

  // Rendu du layout principal avec les routes imbriquées
  return (
    <DashboardLayout
      title="Client area"
      subtitle="Manage your BitChest wallet and stay on top of the market"
      navItems={navItems}
      user={user}
      onLogout={handleLogout}
    >
      {/* Configuration des routes internes du dashboard client */}
      <Routes>
        {/* Redirection par défaut vers l'aperçu (Overview) */}
        <Route index element={<Navigate to="/client/overview" replace />} />

        {/* Route Aperçu: Affiche le résumé du portefeuille et des marchés */}
        <Route
          path="overview"
          element={<ClientOverviewPanel account={account} cryptoAssets={state.cryptoAssets} user={user} />}
        />

        {/* Route Portefeuille: Affiche les détails des avoirs et permet d'acheter/vendre */}
        <Route
          path="wallet"
          element={<ClientWalletPanel account={account} cryptoAssets={state.cryptoAssets} />}
        />

        {/* Route Marchés: Affiche la liste complète des cryptos et graphiques */}
        <Route path="market" element={<MarketOverviewPanel cryptoAssets={state.cryptoAssets} />} />

        {/* Route Profil: Permet de modifier les infos personnelles et mot de passe */}
        <Route path="profile" element={<ClientProfilePanel user={user} />} />
      </Routes>
    </DashboardLayout>
  );
}

