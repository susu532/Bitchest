// ============================================================================
// Import des hooks React pour la gestion d'état et du contexte.
// createContext crée un contexte React pour partager des données.
// useCallback mémorise les fonctions pour éviter les re-rendus inutiles.
// useContext accède aux données d'un contexte.
// useState gère l'état local du composant.
// useEffect exécute des effets secondaires.
// ============================================================================
import { createContext, useCallback, useContext, useState, useEffect } from 'react';

// ============================================================================
// Import du service de notifications et de ses types.
// notificationService encapsule les appels API pour les notifications.
// NotificationData et CreateNotificationPayload sont les types de données.
// ============================================================================
import { notificationService, type NotificationData, type CreateNotificationPayload } from '../../utils/notificationService';

// ============================================================================
// Export du type des types de notification disponibles.
// Ce type limite les valeurs possibles pour le champ type.
// 'success' | 'error' | 'info' | 'warning' est un type union littéral.
// ============================================================================
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

// ============================================================================
// Export de l'interface Notification pour les toasts temporaires.
// Cette interface définit la structure d'une notification affichée.
// ============================================================================
export interface Notification {
  // id peut être string (temporaire) ou number (persistée en BD).
  id: string | number;
  // type détermine le style visuel (couleur, icône).
  type: NotificationType;
  // message est le texte principal de la notification.
  message: string;
  // details optionnel pour des informations supplémentaires.
  details?: string;
  // duration en ms avant disparition automatique.
  duration?: number;
  // is_read indique si la notification a été lue (persistées).
  is_read?: boolean;
  // created_at est la date de création (persistées).
  created_at?: string;
}

// ============================================================================
// Interface définissant les valeurs fournies par le contexte.
// Ce type liste toutes les propriétés et méthodes exposées.
// ============================================================================
interface NotificationContextType {
  // Tableau des notifications temporaires (toasts).
  notifications: Notification[];
  // Tableau des notifications persistées depuis le backend.
  persistentNotifications: NotificationData[];
  // Fonction pour ajouter une notification (toast ou persistée).
  addNotification: (message: string, type?: NotificationType, details?: string, duration?: number, persist?: boolean) => Promise<string | number>;
  // Fonction pour supprimer une notification par ID.
  removeNotification: (id: string | number) => void;
  // Fonction pour marquer une notification comme lue.
  markAsRead: (id: number) => Promise<void>;
  // Fonction pour rafraîchir les notifications depuis le backend.
  refreshNotifications: () => Promise<void>;
}

// ============================================================================
// Création du contexte React pour les notifications.
// createContext<T | undefined> permet undefined avant l'initialisation.
// La valeur par défaut undefined est utilisée si hors du Provider.
// ============================================================================
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// ============================================================================
// Composant Provider qui fournit le contexte aux composants enfants.
// 'export const' exporte une constante nommée.
// children représente les composants enfants à envelopper.
// ============================================================================
export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  // État pour les notifications temporaires (toasts).
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // État pour les notifications persistées depuis le backend.
  const [persistentNotifications, setPersistentNotifications] = useState<NotificationData[]>([]);

  // ============================================================================
  // Effet pour charger les notifications persistées au montage.
  // Le tableau de dépendances vide [] exécute l'effet une seule fois.
  // ============================================================================
  useEffect(() => {
    refreshNotifications();
  }, []);

  // ============================================================================
  // Fonction pour rafraîchir les notifications depuis le backend.
  // useCallback mémorise la fonction pour éviter les re-rendus.
  // async permet l'utilisation de await dans la fonction.
  // ============================================================================
  const refreshNotifications = useCallback(async () => {
    try {
      // Appel API pour récupérer les notifications non lues.
      const response = await notificationService.fetchNotifications({ is_read: false });
      // Mise à jour de l'état avec les données reçues.
      setPersistentNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  // ============================================================================
  // Fonction pour ajouter une nouvelle notification.
  // Peut créer un toast temporaire ou une notification persistée.
  // ============================================================================
  const addNotification = useCallback(
    async (
      message: string,
      type: NotificationType = 'info',
      details?: string,
      duration = 5000,
      persist = false
    ): Promise<string | number> => {
      // Si persist est true, sauvegarde dans le backend.
      if (persist) {
        try {
          const payload: CreateNotificationPayload = {
            type,
            message,
            details,
          };
          // Appel API pour créer la notification.
          const created = await notificationService.createNotification(payload);
          // Ajoute au début du tableau des notifications persistées.
          setPersistentNotifications((prev) => [created, ...prev]);
          return created.id;
        } catch (error) {
          console.error('Failed to create persistent notification:', error);
          // Continue pour créer un toast temporaire en cas d'échec.
        }
      }

      // ============================================================================
      // Création d'une notification temporaire (toast).
      // L'ID est généré avec Math.random + base36 pour unicité.
      // ============================================================================
      const id = Math.random().toString(36).slice(2);
      const notification: Notification = { id, type, message, details, duration };

      // Ajoute la notification à la fin du tableau.
      setNotifications((prev) => [...prev, notification]);

      // ============================================================================
      // Suppression automatique après la durée spécifiée.
      // setTimeout planifie l'exécution après duration ms.
      // ============================================================================
      if (duration > 0) {
        setTimeout(() => {
          // Filtre pour retirer la notification par ID.
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, duration);
      }

      return id;
    },
    []
  );

  // ============================================================================
  // Fonction pour supprimer manuellement une notification.
  // Filtre le tableau pour exclure l'ID spécifié.
  // ============================================================================
  const removeNotification = useCallback((id: string | number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // ============================================================================
  // Fonction pour marquer une notification comme lue.
  // Appelle l'API puis retire de la liste des non lues.
  // ============================================================================
  const markAsRead = useCallback(async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      // Retire la notification marquée comme lue.
      setPersistentNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // ============================================================================
  // Rendu du Provider avec les valeurs du contexte.
  // value contient toutes les données et fonctions exposées.
  // ============================================================================
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

// ============================================================================
// Hook personnalisé pour accéder au contexte des notifications.
// useNotifications simplifie l'accès au contexte.
// Lève une erreur si utilisé hors du Provider.
// ============================================================================
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// ============================================================================
// Interface définissant les props du conteneur de notifications.
// notifications est le tableau des toasts à afficher.
// onRemove est la fonction appelée pour fermer une notification.
// ============================================================================
interface NotificationContainerProps {
  notifications: Notification[];
  onRemove: (id: string | number) => void;
}

// ============================================================================
// Composant d'affichage des notifications (toasts).
// Ce composant rend visuellement les notifications à l'écran.
// ============================================================================
export const NotificationContainer = ({ notifications, onRemove }: NotificationContainerProps) => {
  return (
    // Conteneur positionné en haut à droite de l'écran.
    <div className="notification-container">
      {/* Itération sur les notifications à afficher */}
      {notifications.map((notification) => (
        <div key={notification.id} className={`notification notification--${notification.type}`}>
          <div className="notification__content">
            <h4 className="notification__title">
              {/* Icône conditionnelle selon le type */}
              {notification.type === 'success' && '✓ '}
              {notification.type === 'error' && '✕ '}
              {notification.type === 'info' && 'ℹ '}
              {notification.type === 'warning' && '⚠ '}
              {notification.message}
            </h4>
            {/* Affichage conditionnel des détails */}
            {notification.details && <p className="notification__details">{notification.details}</p>}
          </div>
          {/* Bouton de fermeture */}
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

