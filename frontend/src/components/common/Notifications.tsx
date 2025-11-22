import { useCallback, useState } from 'react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  details?: string;
  duration?: number;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (message: string, type: NotificationType = 'info', details?: string, duration = 5000) => {
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
    [],
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notifications, addNotification, removeNotification };
};

interface NotificationContainerProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
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
