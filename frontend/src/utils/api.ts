/**
 * API Service - Handles all backend API calls
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

const defaultHeaders = {
  'Content-Type': 'application/json',
};

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Include cookies for session-based auth
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Authentication
  login: (email: string, password: string) =>
    apiCall('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiCall('/logout', {
      method: 'POST',
    }),

  getCurrentUser: () =>
    apiCall('/me'),

  // Profile
  updateProfile: (data: { first_name?: string; last_name?: string; email?: string }) =>
    apiCall('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changePassword: (currentPassword: string, newPassword: string, newPasswordConfirmation: string) =>
    apiCall('/password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation,
      }),
    }),

  // Cryptocurrencies
  getCryptocurrencies: () =>
    apiCall('/cryptocurrencies'),

  getCryptoPriceHistory: (cryptoId: number | string) =>
    apiCall(`/cryptocurrencies/${cryptoId}/prices`),

  // Admin - Users
  getAllUsers: () =>
    apiCall('/admin/users'),

  getUser: (userId: number | string) =>
    apiCall(`/admin/users/${userId}`),

  createUser: (firstName: string, lastName: string, email: string) =>
    apiCall('/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
      }),
    }),

  updateUser: (userId: number | string, data: { first_name?: string; last_name?: string; email?: string }) =>
    apiCall(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteUser: (userId: number | string) =>
    apiCall(`/admin/users/${userId}`, {
      method: 'DELETE',
    }),

  // Client - Wallet
  getWallet: () =>
    apiCall('/client/wallet'),

  // Client - Transactions
  getTransactions: () =>
    apiCall('/client/transactions'),

  recordTransaction: (
    cryptocurrencyId: number | string,
    type: 'buy' | 'sell',
    quantity: number,
    pricePerUnit: number,
  ) =>
    apiCall('/client/transactions', {
      method: 'POST',
      body: JSON.stringify({
        cryptocurrency_id: cryptocurrencyId,
        type,
        quantity,
        price_per_unit: pricePerUnit,
      }),
    }),
};
