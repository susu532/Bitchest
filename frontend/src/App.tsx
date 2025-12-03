

import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';

import { useEffect } from 'react';

import { AppStateProvider } from './state/AppStateProvider';

import { AuthProvider, useAuth } from './state/AuthContext';

import { useNotifications, NotificationContainer, NotificationProvider } from './components/common/Notifications';

import { echoService } from './utils/echo';

import LoginPage from './pages/LoginPage';

import AdminDashboard from './pages/AdminDashboard';

import ClientDashboard from './pages/ClientDashboard';

type RequireAuthProps = {

  allowedRoles: Array<'admin' | 'client'>;
};

function RequireAuth({ allowedRoles }: RequireAuthProps) {

  const location = useLocation();

  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {

    return <div>Loading...</div>;
  }

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

  const { isLoading, user } = useAuth();

  const { addNotification } = useNotifications();

  useEffect(() => {

    if (user?.id) {

      echoService.subscribeToUserEvents(

        user.id,

        (data) => {

          addNotification(

            `Balance Changed: ${data.reason}`,

            'info',

            `New balance: €${data.newBalance.toFixed(2)} (${data.balanceChange > 0 ? '+' : ''}€${data.balanceChange.toFixed(2)})`,
          );
        },

        (data) => {

          addNotification(

            `${data.type === 'buy' ? 'Purchase' : 'Sale'} Completed`,

            'success',

            `${data.message}`,
          );
        },
      );

      return () => {

        echoService.unsubscribe(`user.${user.id}`);
      };
    }

  }, [user?.id, addNotification]);

  if (isLoading) {

    return <div>Loading...</div>;
  }

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

function NotificationWrapper() {

  const { notifications, removeNotification } = useNotifications();

  return <NotificationContainer notifications={notifications} onRemove={removeNotification} />;
}

export default function App() {

  return (

    <AppStateProvider>
  
      <AuthProvider>
       
        <NotificationProvider>
        
          <AppRoutes />
        
          <NotificationWrapper />
        </NotificationProvider>
      </AuthProvider>
    </AppStateProvider>
  );
}
