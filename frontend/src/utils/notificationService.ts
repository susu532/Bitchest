// Hedha el service mta3 les notifications, yesta3mel axios bech yab3ath requêtes lel backend
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// El interfaces eli ya3rfou el structure mta3 el notification w el réponse paginée
export interface NotificationData {
  id: number;
  user_id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  details?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationPayload {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  details?: string;
}

export interface NotificationResponse {
  data: NotificationData[];
  current_page: number;
  total: number;
  per_page: number;
}

// El class NotificationService fiha kol les méthodes: fetch, create, markAsRead, delete
class NotificationService {
  async fetchNotifications(params?: {
    type?: string;
    is_read?: boolean;
    page?: number;
  }): Promise<NotificationResponse> {
    try {
      const response = await axios.get<NotificationResponse>(`${API_BASE_URL}/notifications`, {
        params,
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async createNotification(payload: CreateNotificationPayload): Promise<NotificationData> {
    try {
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

  // Hne na3mlou markAsRead bech n7ottou el notification comme déjà maqrouya
  async markAsRead(id: number): Promise<NotificationData> {
    try {
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

  async deleteNotification(id: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/notifications/${id}`, {
        withCredentials: true,
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Supprimer kol les notifications el maqrouya d'un coup
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

export const notificationService = new NotificationService();
