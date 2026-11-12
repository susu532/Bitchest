// Hedha el système mta3 les notifications - context provider, hooks, w container lel toasts
import { createContext, useCallback, useContext, useState, useEffect } from 'react';

import { notificationService, type NotificationData, type CreateNotificationPayload } from '../../utils/notificationService';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string | number;
  type: NotificationType;
  message: string;
  details?: string;
  duration?: number;
  is_read?: boolean;
  created_at?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  persistentNotifications: NotificationData[];
  addNotification: (message: string, type?: NotificationType, details?: string, duration?: number, persist?: boolean) => Promise<string | number>;
  removeNotification: (id: string | number) => void;
  markAsRead: (id: number) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// El Provider eli ya3ti el context lel components el wled - yfournilhom les notifications w les fonctions
export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [persistentNotifications, setPersistentNotifications] = useState<NotificationData[]>([]);

  useEffect(() => {
    refreshNotifications();
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      const response = await notificationService.fetchNotifications({ is_read: false });
      setPersistentNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  // Fonction eli tzid notification - ya3mel toast temporaire wella ysauvgardiha fel backend
  const addNotification = useCallback(
    async (
      message: string,
      type: NotificationType = 'info',
      details?: string,
      duration = 5000,
      persist = false
    ): Promise<string | number> => {
      if (persist) {
        try {
          const payload: CreateNotificationPayload = {
            type,
            message,
            details,
          };
          const created = await notificationService.createNotification(payload);
          setPersistentNotifications((prev) => [created, ...prev]);
          return created.id;
        } catch (error) {
          console.error('Failed to create persistent notification:', error);
        }
      }

      const id = Math.random().toString(36).slice(2);
      const notification: Notification = { id, type, message, details, duration };

      setNotifications((prev) => [...prev, notification]);

      if (duration > 0) {
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, duration);
      }

      return id;
    },
    []
  );

  const removeNotification = useCallback((id: string | number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Ki el user ya9ra notification, n3ayytou lel API bech nmarquiwha comme lue w nnah7iwha mel liste
  const markAsRead = useCallback(async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setPersistentNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        persistentNotifications,
        addNotification,
        removeNotification,
        markAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationContainerProps {
  notifications: Notification[];
  onRemove: (id: string | number) => void;
}

// El container eli yaffichi les toasts - kol notification 3andha icône, message, w bouton fermeture
export const NotificationContainer = ({ notifications, onRemove }: NotificationContainerProps) => {
  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div key={notification.id} className={`notification notification--${notification.type}`}>
          <div className="notification__content">
            <h4 className="notification__title">
              {notification.type === 'success' && '✓ '}
              {notification.type === 'error' && '✕ '}
              {notification.type === 'info' && 'ℹ '}
              {notification.type === 'warning' && '⚠ '}
              {notification.message}
            </h4>
            {notification.details && <p className="notification__details">{notification.details}</p>}
          </div>
          <button
            className="notification__close"
            onClick={() => onRemove(notification.id)}
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

