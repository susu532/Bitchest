// Définit l'URL de base pour toutes les requêtes API
const API_BASE_URL = 'http://localhost:8000';

// Définit le type générique pour toutes les réponses API
export type ApiResponse<T> = {
  // Booléen indiquant si la requête a réussi
  success: boolean;
  // Message optionnel (par exemple, message d'erreur)
  message?: string;
  // Données optionnelles retournées par l'API
  data?: T;
  // Propriétés supplémentaires possibles
  [key: string]: any;
};

// Classe pour gérer toutes les requêtes API
class ApiService {
  // URL de base de l'API (localhost:8000)
  private baseUrl: string;

  // Constructeur qui reçoit l'URL de base
  constructor(baseUrl: string) {
    // Stocke l'URL de base
    this.baseUrl = baseUrl;
  }

  // Méthode générique privée pour effectuer une requête HTTP
  private async request<T>(
    // Endpoint relatif (ex: /auth/login)
    endpoint: string,
    // Options de la requête fetch (méthode, body, etc.)
    options: RequestInit = {}
  ): Promise<T> {
    // Construit l'URL complète
    const url = `${this.baseUrl}${endpoint}`;
    
    // Définit les options par défaut pour toutes les requêtes
    const defaultOptions: RequestInit = {
      // Méthode HTTP par défaut: GET
      method: 'GET',
      // Headers par défaut
      headers: {
        // Indique que le body est du JSON
        'Content-Type': 'application/json',
        // Accepte les réponses JSON
        'Accept': 'application/json',
      },
      // Inclut les cookies pour l'authentification par session
      credentials: 'include',
      // Fusionne les options fournies
      ...options,
    };

    // Affiche un log de la requête
    console.log(`[API] ${defaultOptions.method} ${url}`, defaultOptions);
    
    try {
      // Effectue la requête fetch
      const response = await fetch(url, defaultOptions);
      
      // Affiche un log du statut de la réponse
      console.log(`[API] Response status: ${response.status}`, {
        // Convertit les headers en objet
        headers: Object.fromEntries(response.headers),
      });

      // Si la réponse n'est pas OK (2xx)
      if (!response.ok) {
        // Essaie de parser le JSON ou utilise un message générique
        const error = await response.json().catch(() => ({
          // Flag de succès false
          success: false,
          // Message d'erreur HTTP
          message: `HTTP ${response.status}`,
        }));
        // Lance une erreur avec le message
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      // Parse et retourne la réponse JSON
      return response.json();
    } catch (error: any) {
      // Affiche une erreur console
      console.error(`[API] Error on ${endpoint}:`, error);
      // Relance l'erreur
      throw error;
    }
  }

  // Endpoint pour la connexion utilisateur
  async login(email: string, password: string) {
    // Appelle l'API avec méthode POST
    return this.request('/auth/login', {
      // Méthode HTTP
      method: 'POST',
      // Convertit les identifiants en JSON
      body: JSON.stringify({ email, password }),
    });
  }

  // Endpoint pour la déconnexion
  async logout() {
    // Appelle l'API avec méthode POST
    return this.request('/auth/logout', {
      // Méthode HTTP
      method: 'POST',
    });
  }

  // Endpoint pour récupérer l'utilisateur actuellement connecté
  async getCurrentUser() {
    // Appelle l'API avec méthode GET
    return this.request('/auth/me');
  }

  // Endpoint pour changer le mot de passe
  async changePassword(currentPassword: string, newPassword: string) {
    // Appelle l'API avec méthode POST
    return this.request('/auth/change-password', {
      // Méthode HTTP
      method: 'POST',
      // Envoie les deux mots de passe
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Endpoint pour mettre à jour le profil utilisateur
  async updateProfile(data: any) {
    // Appelle l'API avec méthode POST
    return this.request('/user/profile', {
      // Méthode HTTP
      method: 'POST',
      // Convertit les données en JSON
      body: JSON.stringify(data),
    });
  }

  // Endpoint pour obtenir tous les utilisateurs
  async getAllUsers() {
    // Appelle l'API avec méthode GET
    return this.request('/users');
  }

  // Endpoint pour créer un nouveau client
  async createClient(firstName: string, lastName: string, email: string) {
    // Appelle l'API avec méthode POST
    return this.request('/clients', {
      // Méthode HTTP
      method: 'POST',
      // Envoie les données du client
      body: JSON.stringify({ firstName, lastName, email }),
    });
  }

  // Endpoint pour mettre à jour un client existant
  async updateClient(userId: string, data: any) {
    // Appelle l'API avec méthode PUT
    return this.request(`/clients/${userId}`, {
      // Méthode HTTP
      method: 'PUT',
      // Envoie les données à mettre à jour
      body: JSON.stringify(data),
    });
  }

  // Endpoint pour supprimer un client
  async deleteClient(userId: string) {
    // Appelle l'API avec méthode DELETE
    return this.request(`/clients/${userId}`, {
      // Méthode HTTP
      method: 'DELETE',
    });
  }

  // Endpoint pour obtenir le compte du client actuellement connecté
  async getClientAccount() {
    // Appelle l'API avec méthode GET
    return this.request('/clients/account/mine');
  }

  // Endpoint pour obtenir toutes les cryptomonnaies
  async getCryptocurrencies() {
    // Appelle l'API avec méthode GET
    return this.request('/cryptocurrencies');
  }

  // Endpoint pour obtenir une cryptomonnaie spécifique
  async getCryptocurrency(cryptoId: string) {
    // Appelle l'API avec méthode GET
    return this.request(`/cryptocurrencies/${cryptoId}`);
  }

  // Endpoint pour obtenir le prix actuel d'une cryptomonnaie
  async getCurrentPrice(cryptoId: string) {
    // Appelle l'API avec méthode GET
    return this.request(`/cryptocurrencies/${cryptoId}/price`);
  }

  // Endpoint pour acheter une cryptomonnaie
  async buyCryptocurrency(cryptoId: string, quantity: number, pricePerUnit: number) {
    // Appelle l'API avec méthode POST
    return this.request('/wallet/buy', {
      // Méthode HTTP
      method: 'POST',
      // Envoie les détails d'achat
      body: JSON.stringify({ cryptoId, quantity, pricePerUnit }),
    });
  }

  // Endpoint pour vendre une cryptomonnaie
  async sellCryptocurrency(cryptoId: string, quantity: number, pricePerUnit: number) {
    // Appelle l'API avec méthode POST
    return this.request('/wallet/sell', {
      // Méthode HTTP
      method: 'POST',
      // Envoie les détails de vente
      body: JSON.stringify({ cryptoId, quantity, pricePerUnit }),
    });
  }

  // Endpoint pour obtenir le résumé du portefeuille
  async getWalletSummary() {
    // Appelle l'API avec méthode GET
    return this.request('/wallet/summary');
  }
}

// Exporte une instance singleton du service API
export const api = new ApiService(API_BASE_URL);
