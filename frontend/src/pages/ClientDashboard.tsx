// Hedha el dashboard mta3 el client, fih el wallet, el marché, el profil, w vue d'ensemble mta3 el portefeuille
import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import ClientOverviewPanel from '../components/client/ClientOverviewPanel';
import ClientWalletPanel from '../components/client/ClientWalletPanel';
import ClientProfilePanel from '../components/client/ClientProfilePanel';
import MarketOverviewPanel from '../components/common/MarketOverviewPanel';
import { useAuth } from '../state/AuthContext';
import { useAppState, useAppServices } from '../state/AppStateProvider';
import { useNotifications } from '../components/common/Notifications';

export default function ClientDashboard() {

  const { user, logout } = useAuth();
  const state = useAppState();
  const { fetchCryptoAssets, fetchClientAccount } = useAppServices();
  const { addNotification } = useNotifications();

  // Ki yetla3 el component, njibou el cryptos w el compte mta3 el client mel API
  useEffect(() => {
    fetchCryptoAssets();
    if (user?.id) {
      fetchClientAccount();
    }
  }, [fetchCryptoAssets, fetchClientAccount, user?.id]);

  // Ken mahouch connecté, nraj3ouh lel login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const account = state.clientAccounts[user.id];

  const handleLogout = () => {
    addNotification('Logged Out', 'info', 'You have been logged out successfully.', 3000);
    setTimeout(() => {
      logout();
    }, 500);
  };

  // Ken el compte mta3 el client ma mawjoudch, naffichou message d'erreur
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

  const navItems = [
    { label: 'Overview', to: '/client/overview', description: 'Portfolio snapshot at a glance' },
    { label: 'Wallet', to: '/client/wallet', description: 'Transactions, holdings, and trading' },
    { label: 'Markets', to: '/client/market', description: 'Crypto prices and performance' },
    { label: 'Profile', to: '/client/profile', description: 'Personal information and security' },
  ];

  // Nrenderou el layout w el routes imbriquées lel kol section mta3 el client
  return (
    <DashboardLayout
      title="Client area"
      subtitle="Manage your BitChest wallet and stay on top of the market"
      navItems={navItems}
      user={user}
      onLogout={handleLogout}
    >
      <Routes>
        <Route index element={<Navigate to="/client/overview" replace />} />
        <Route
          path="overview"
          element={<ClientOverviewPanel account={account} cryptoAssets={state.cryptoAssets} user={user} />}
        />
        <Route
          path="wallet"
          element={<ClientWalletPanel account={account} cryptoAssets={state.cryptoAssets} />}
        />
        <Route path="market" element={<MarketOverviewPanel cryptoAssets={state.cryptoAssets} />} />
        <Route path="profile" element={<ClientProfilePanel user={user} />} />
      </Routes>
    </DashboardLayout>
  );
}

