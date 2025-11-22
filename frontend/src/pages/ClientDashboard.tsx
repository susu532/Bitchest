import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';

import DashboardLayout from '../components/layout/DashboardLayout';
import ClientOverviewPanel from '../components/client/ClientOverviewPanel';
import ClientWalletPanel from '../components/client/ClientWalletPanel';
import MarketOverviewPanel from '../components/common/MarketOverviewPanel';
import ClientProfilePanel from '../components/client/ClientProfilePanel';
import { useAuth } from '../state/AuthContext';
import { useAppState, useAppServices } from '../state/AppStateProvider';

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const state = useAppState();
  const { fetchCryptoAssets, fetchClientAccount } = useAppServices();

  useEffect(() => {
    // Fetch data when dashboard loads
    fetchCryptoAssets();
    if (user?.id) {
      fetchClientAccount();
    }
  }, [fetchCryptoAssets, fetchClientAccount, user?.id]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const account = state.clientAccounts[user.id];

  if (!account) {
    return (
      <DashboardLayout
        title="Client area"
        subtitle="Manage your BitChest wallet and monitor the market"
        navItems={[]}
        user={user}
        onLogout={logout}
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

  return (
    <DashboardLayout
      title="Client area"
      subtitle="Manage your BitChest wallet and stay on top of the market"
      navItems={navItems}
      user={user}
      onLogout={logout}
    >
      <Routes>
        <Route index element={<Navigate to="/client/overview" replace />} />
        <Route
          path="overview"
          element={<ClientOverviewPanel account={account} cryptoAssets={state.cryptoAssets} user={user} />}
        />
        <Route
          path="wallet"
          element={<ClientWalletPanel account={account} cryptoAssets={state.cryptoAssets} user={user} />}
        />
        <Route path="market" element={<MarketOverviewPanel cryptoAssets={state.cryptoAssets} />} />
        <Route path="profile" element={<ClientProfilePanel user={user} />} />
      </Routes>
    </DashboardLayout>
  );
}

