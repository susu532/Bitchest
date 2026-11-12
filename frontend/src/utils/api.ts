// Hedha el service ApiService eli ya3mel kol les requetes HTTP lel backend Laravel: login, logout, CRUD users w crypto
const API_BASE_URL = 'http://localhost:8000';

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
};

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Hedhi el méthode el asesiya eli tab3ath kol requête HTTP w tgéri les headers w les erreurs
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultOptions: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      ...options,
    };

    console.log(`[API] ${defaultOptions.method} ${url}`, defaultOptions);

    try {
      const response = await fetch(url, defaultOptions);

      console.log(`[API] Response status: ${response.status}`, {
        headers: Object.fromEntries(response.headers),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          success: false,
          message: `HTTP ${response.status}`,
        }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      console.error(`[API] Error on ${endpoint}:`, error);
      throw error;
    }
  }

  // Les méthodes mta3 el authentification: login, logout, getCurrentUser, changePassword
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async updateProfile(data: any) {
    return this.request('/user/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // CRUD mta3 les clients: getAllUsers, createClient, updateClient, deleteClient
  async getAllUsers() {
    return this.request('/users');
  }

  async createClient(firstName: string, lastName: string, email: string) {
    return this.request('/clients', {
      method: 'POST',
      body: JSON.stringify({ firstName, lastName, email }),
    });
  }

  async updateClient(userId: string, data: any) {
    return this.request(`/clients/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteClient(userId: string) {
    return this.request(`/clients/${userId}`, {
      method: 'DELETE',
    });
  }

  async getClientAccount() {
    return this.request('/clients/account/mine');
  }

  async getCryptocurrencies() {
    return this.request('/cryptocurrencies');
  }

  async getCryptocurrency(cryptoId: string) {
    return this.request(`/cryptocurrencies/${cryptoId}`);
  }

  async getCurrentPrice(cryptoId: string) {
    return this.request(`/cryptocurrencies/${cryptoId}/price`);
  }

  // Chri w bi3 el crypto: buyCryptocurrency w sellCryptocurrency w getWalletSummary
  async buyCryptocurrency(cryptoId: string, quantity: number, pricePerUnit: number) {
    return this.request('/wallet/buy', {
      method: 'POST',
      body: JSON.stringify({ cryptoId, quantity, pricePerUnit }),
    });
  }

  async sellCryptocurrency(cryptoId: string, quantity: number, pricePerUnit: number) {
    return this.request('/wallet/sell', {
      method: 'POST',
      body: JSON.stringify({ cryptoId, quantity, pricePerUnit }),
    });
  }

  async getWalletSummary() {
    return this.request('/wallet/summary');
  }
}

export const api = new ApiService(API_BASE_URL);
