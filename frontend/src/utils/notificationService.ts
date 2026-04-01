// ============================================================================
// Import de la bibliothèque axios pour les requêtes HTTP.
// axios est une alternative populaire à fetch avec plus de fonctionnalités.
// Elle gère automatiquement les transformations JSON et les intercepteurs.
// ============================================================================
import axios from 'axios';

// ============================================================================
// URL de base de l'API backend Laravel.
// Cette constante est utilisée comme préfixe pour tous les endpoints.
// En production, elle devrait être configurée via des variables d'environnement.
// ============================================================================
const API_BASE_URL = 'http://localhost:8000';

// ============================================================================
// Interface définissant la structure d'une notification.
// 'export interface' exporte une interface TypeScript.
// NotificationData représente une notification stockée en base de données.
// ============================================================================
export interface NotificationData {
  // Identifiant unique de la notification (clé primaire).
  id: number;
  // Identifiant de l'utilisateur destinataire.
  user_id: number;
  // Type de notification déterminant le style visuel.
  // 'success' | 'error' | 'info' | 'warning' est un type union littéral.
  type: 'success' | 'error' | 'info' | 'warning';
  // Message principal de la notification.
  message: string;
  // Détails optionnels pour plus d'informations.
  // '?' indique une propriété optionnelle.
  details?: string;
  // Indique si la notification a été lue par l'utilisateur.
  is_read: boolean;
  // Date de création au format ISO 8601.
  created_at: string;
  // Date de dernière modification.
  updated_at: string;
}

// ============================================================================
// Interface pour les données de création d'une notification.
// Ce type définit les champs requis pour créer une nouvelle notification.
// ============================================================================
export interface CreateNotificationPayload {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  details?: string;
}

// ============================================================================
// Interface pour la réponse paginée des notifications.
// Ce type représente la structure retournée par l'API avec pagination.
// ============================================================================
export interface NotificationResponse {
  // Tableau des notifications de la page courante.
  data: NotificationData[];
  // Numéro de la page actuelle.
  current_page: number;
  // Nombre total de notifications.
  total: number;
  // Nombre de notifications par page.
  per_page: number;
}

// ============================================================================
// Classe NotificationService encapsulant les appels API notifications.
// Cette classe suit le pattern Service pour centraliser la logique d'API.
// ============================================================================
class NotificationService {
  // ============================================================================
  // Méthode pour récupérer les notifications de l'utilisateur.
  // params permet de filtrer par type, statut de lecture, et page.
  // async indique une méthode asynchrone retournant une Promise.
  // ============================================================================
  async fetchNotifications(params?: {
    type?: string;
    is_read?: boolean;
    page?: number;
  }): Promise<NotificationResponse> {
    try {
      // axios.get effectue une requête GET vers l'endpoint.
      // <NotificationResponse> type la réponse attendue.
      const response = await axios.get<NotificationResponse>(`${API_BASE_URL}/notifications`, {
        // params ajoute les paramètres en query string.
        params,
        // withCredentials envoie les cookies de session.
        withCredentials: true,
      });
      // response.data contient le corps de la réponse JSON.
      return response.data;
    } catch (error) {
      // console.error affiche l'erreur dans la console.
      console.error('Error fetching notifications:', error);
      // throw relance l'erreur pour que l'appelant puisse la gérer.
      throw error;
    }
  }

  // ============================================================================
  // Méthode pour créer une nouvelle notification.
  // payload contient le type, message et détails optionnels.
  // ============================================================================
  async createNotification(payload: CreateNotificationPayload): Promise<NotificationData> {
    try {
      // axios.post effectue une requête POST avec le payload en body.
      const response = await axios.post<NotificationData>(
        `${API_BASE_URL}/notifications`,
        payload,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // ============================================================================
  // Méthode pour marquer une notification comme lue.
  // id est l'identifiant de la notification à marquer.
  // ============================================================================
  async markAsRead(id: number): Promise<NotificationData> {
    try {
      // axios.patch effectue une mise à jour partielle (PATCH).
      // {} comme body car seul l'endpoint déclenche l'action.
      const response = await axios.patch<NotificationData>(
        `${API_BASE_URL}/notifications/${id}/read`,
        {},
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // ============================================================================
  // Méthode pour supprimer une notification spécifique.
  // id identifie la notification à supprimer.
  // Promise<void> indique qu'aucune donnée n'est retournée.
  // ============================================================================
  async deleteNotification(id: number): Promise<void> {
    try {
      // axios.delete effectue une requête DELETE.
      await axios.delete(`${API_BASE_URL}/notifications/${id}`, {
        withCredentials: true,
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // ============================================================================
  // Méthode pour supprimer toutes les notifications lues.
  // Retourne un objet avec un message et le nombre supprimé.
  // ============================================================================
  async deleteAllRead(): Promise<{ message: string; deleted_count: number }> {
    try {
      const response = await axios.delete<{ message: string; deleted_count: number }>(
        `${API_BASE_URL}/notifications/read`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      throw error;
    }
  }
}

// ============================================================================
// Export de l'instance singleton du service.
// 'new NotificationService()' crée une instance unique.
// Cette instance est réutilisée dans toute l'application.
// ============================================================================
export const notificationService = new NotificationService();

