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
      credentials: 'include', // Include cookies for session-based auth
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

  // Authentication endpoints
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

  // User endpoints
  async updateProfile(data: any) {
    return this.request('/user/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAllUsers() {
    return this.request('/users');
  }

  // Client management endpoints
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

  // Cryptocurrency endpoints
  async getCryptocurrencies() {
    return this.request('/cryptocurrencies');
  }

  async getCryptocurrency(cryptoId: string) {
    return this.request(`/cryptocurrencies/${cryptoId}`);
  }

  async getCurrentPrice(cryptoId: string) {
    return this.request(`/cryptocurrencies/${cryptoId}/price`);
  }

  // Wallet endpoints
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
