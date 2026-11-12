// Hedha el dashboard mta3 l'admin, fih gestion mta3 el clients, el profil, w el marché crypto
import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import AdminProfilePanel from '../components/admin/AdminProfilePanel';
import ClientManagementPanel from '../components/admin/ClientManagementPanel';
import MarketOverviewPanel from '../components/common/MarketOverviewPanel';
import { useAuth } from '../state/AuthContext';
import { useAppState, useAppServices } from '../state/AppStateProvider';
import { useNotifications } from '../components/common/Notifications';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const state = useAppState();
  const { fetchCryptoAssets, fetchUsers } = useAppServices();
  const { addNotification } = useNotifications();

  // Ki yetla3 el component, na3mlou fetch lel cryptos w lel users mel API
  useEffect(() => {
    fetchCryptoAssets();
    fetchUsers();
  }, [fetchCryptoAssets, fetchUsers]);

  // Ken mahouch connecté, nraj3ouh lel page mta3 login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Hedhi el function mta3 logout, taffichi notification w ba3dha tdeconnecti
  const handleLogout = () => {
    addNotification('Logged Out', 'info', 'You have been logged out successfully.', 3000);
    setTimeout(() => {
      logout();
    }, 500);
  };

  const navItems = [
    { label: 'Profile', to: '/admin/profile', description: 'Manage your administrator account' },
    { label: 'Clients', to: '/admin/clients', description: 'Create, update, and remove client accounts' },
    { label: 'Markets', to: '/admin/market', description: 'Monitor supported cryptocurrency prices' },
  ];

  // Hne nrenderou el layout w el routes eli jouwwa (profile, clients, market)
  return (
    <DashboardLayout
      title="Administration"
      subtitle="Control BitChest accounts and monitor market activity"
      navItems={navItems}
      user={user}
      onLogout={handleLogout}
    >
      <Routes>
        <Route index element={<Navigate to="/admin/profile" replace />} />
        <Route path="profile" element={<AdminProfilePanel admin={user} />} />
        <Route path="clients" element={<ClientManagementPanel adminId={user.id} users={state.users} />} />
        <Route path="market" element={<MarketOverviewPanel cryptoAssets={state.cryptoAssets} />} />
      </Routes>
    </DashboardLayout>
  );
}

