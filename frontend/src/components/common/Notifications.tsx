import { createContext, useCallback, useContext, useState, useEffect } from 'react';
import { notificationService, type NotificationData, type CreateNotificationPayload } from '../../utils/notificationService';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string | number; // Support both temporary (string) and persisted (number) IDs
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

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [persistentNotifications, setPersistentNotifications] = useState<NotificationData[]>([]);

  // Fetch persistent notifications from backend on mount
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

  const addNotification = useCallback(
    async (
      message: string,
      type: NotificationType = 'info',
      details?: string,
      duration = 5000,
      persist = false
    ): Promise<string | number> => {
      // If persist is true, save to backend and don't show as toast
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
          // Fall back to temporary notification if backend fails
        }
      }

      // Create temporary toast notification
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

