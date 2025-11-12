import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';

import { AppStateProvider } from './state/AppStateProvider';
import { AuthProvider, useAuth } from './state/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';

type RequireAuthProps = {
  allowedRoles: Array<'admin' | 'client'>;
};

function RequireAuth({ allowedRoles }: RequireAuthProps) {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const target = user.role === 'admin' ? '/admin' : '/client';
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route element={<RequireAuth allowedRoles={['admin']} />}>
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Route>
      <Route element={<RequireAuth allowedRoles={['client']} />}>
        <Route path="/client/*" element={<ClientDashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </AppStateProvider>
  );
}

