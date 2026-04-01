
// ============================================================================
// Définition de l'URL de base de l'API backend.
// 'const' déclare une constante qui ne peut pas être modifiée après initialisation.
// API_BASE_URL pointe vers le serveur Laravel local sur le port 8000.
// Cette URL est utilisée comme préfixe pour tous les endpoints de l'API.
// ============================================================================
const API_BASE_URL = 'http://localhost:8000';


// ============================================================================
// Export du type générique ApiResponse pour typer les réponses de l'API.
// 'export type' rend ce type disponible pour l'importation dans d'autres fichiers.
// Le paramètre générique <T> permet de spécifier le type des données retournées.
// ============================================================================
export type ApiResponse<T> = {
  // success indique si la requête a réussi (true) ou échoué (false).
  success: boolean;
  // message contient un texte descriptif optionnel (erreur ou confirmation).
  message?: string;
  // data contient les données typées retournées par l'API.
  data?: T;
  // [key: string]: any permet des propriétés additionnelles non définies.
  [key: string]: any;
};


// ============================================================================
// Déclaration de la classe ApiService qui encapsule toutes les requêtes HTTP.
// 'class' est le mot-clé JavaScript pour définir une classe orientée objet.
// ApiService centralise la logique de communication avec le backend Laravel.
// ============================================================================
class ApiService {
  // ============================================================================
  // Propriété privée pour stocker l'URL de base de l'API.
  // 'private' restreint l'accès à cette propriété à l'intérieur de la classe.
  // baseUrl est typé comme une chaîne de caractères (string).
  // ============================================================================
  private baseUrl: string;


  // ============================================================================
  // Constructeur de la classe qui initialise l'URL de base.
  // 'constructor' est une méthode spéciale appelée lors de la création d'instance.
  // baseUrl: string déclare un paramètre de type string.
  // ============================================================================
  constructor(baseUrl: string) {
    // this.baseUrl assigne la valeur du paramètre à la propriété de l'instance.
    this.baseUrl = baseUrl;
  }


  // ============================================================================
  // Méthode privée générique pour effectuer les requêtes HTTP.
  // 'private' signifie que cette méthode n'est accessible qu'à l'intérieur de la classe.
  // 'async' indique que cette méthode retourne une Promise.
  // Le paramètre générique <T> permet de typer le retour de la méthode.
  // ============================================================================
  private async request<T>(
    // endpoint est le chemin relatif de l'API (ex: '/auth/login').
    endpoint: string,
    // options contient les paramètres de la requête fetch (method, body, headers).
    options: RequestInit = {}
  ): Promise<T> {
    // Concaténation de l'URL de base avec l'endpoint pour former l'URL complète.
    const url = `${this.baseUrl}${endpoint}`;


    // ============================================================================
    // Définition des options par défaut pour toutes les requêtes.
    // RequestInit est le type TypeScript pour les options de fetch.
    // Ces options sont fusionnées avec celles passées en paramètre.
    // ============================================================================
    const defaultOptions: RequestInit = {
      // method par défaut est GET pour les requêtes de lecture.
      method: 'GET',
      // headers définit les en-têtes HTTP de la requête.
      headers: {
        // Content-Type indique que le corps de la requête est en JSON.
        'Content-Type': 'application/json',
        // Accept indique que le client attend une réponse en JSON.
        'Accept': 'application/json',
      },
      // credentials: 'include' envoie les cookies de session avec la requête.
      credentials: 'include',
      // ...options fusionne les options passées en paramètre (écrase les défauts).
      ...options,
    };


    // Log de débogage pour afficher les détails de la requête dans la console.
    console.log(`[API] ${defaultOptions.method} ${url}`, defaultOptions);


    // ============================================================================
    // Bloc try-catch pour gérer les erreurs de requête.
    // try contient le code qui peut lever une exception.
    // catch intercepte et traite les erreurs.
    // ============================================================================
    try {
      // fetch effectue la requête HTTP et retourne une Promise<Response>.
      const response = await fetch(url, defaultOptions);


      // Log de débogage pour afficher le statut de la réponse.
      console.log(`[API] Response status: ${response.status}`, {
        // Object.fromEntries convertit les headers en objet pour le logging.
        headers: Object.fromEntries(response.headers),
      });


      // ============================================================================
      // Vérification du statut de la réponse HTTP.
      // response.ok est true si le statut est entre 200 et 299.
      // Si la réponse n'est pas OK, on extrait l'erreur et on la lance.
      // ============================================================================
      if (!response.ok) {
        // Tente de parser le corps JSON de l'erreur, ou utilise un message par défaut.
        const error = await response.json().catch(() => ({
          success: false,
          message: `HTTP ${response.status}`,
        }));
        // throw crée et lance une nouvelle erreur avec le message.
        throw new Error(error.message || `HTTP ${response.status}`);
      }


      // response.json() parse le corps de la réponse comme JSON.
      return response.json();
    } catch (error: any) {
      // Log de l'erreur dans la console pour le débogage.
      console.error(`[API] Error on ${endpoint}:`, error);
      // Re-lance l'erreur pour que l'appelant puisse la gérer.
      throw error;
    }
  }


  // ============================================================================
  // Méthode login pour authentifier un utilisateur.
  // async indique que la méthode retourne une Promise.
  // email et password sont les identifiants de connexion.
  // ============================================================================
  async login(email: string, password: string) {
    // Appelle la méthode request avec l'endpoint /auth/login.
    return this.request('/auth/login', {
      // method: 'POST' pour envoyer les données au serveur.
      method: 'POST',
      // body contient les données sérialisées en JSON.
      body: JSON.stringify({ email, password }),
    });
  }


  // ============================================================================
  // Méthode logout pour déconnecter l'utilisateur actuel.
  // Cette méthode invalide la session côté serveur.
  // Elle ne prend aucun paramètre car elle utilise la session courante.
  // ============================================================================
  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }


  // ============================================================================
  // Méthode getCurrentUser pour récupérer les infos de l'utilisateur connecté.
  // Cette méthode vérifie si une session valide existe côté serveur.
  // Elle retourne les données utilisateur ou une erreur 401 si non authentifié.
  // ============================================================================
  async getCurrentUser() {
    return this.request('/auth/me');
  }


  // ============================================================================
  // Méthode changePassword pour modifier le mot de passe de l'utilisateur.
  // currentPassword est le mot de passe actuel pour vérification.
  // newPassword est le nouveau mot de passe à définir.
  // ============================================================================
  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }


  // ============================================================================
  // Méthode updateProfile pour mettre à jour le profil utilisateur.
  // data contient les champs à modifier (firstName, lastName, email).
  // Le type 'any' permet de passer n'importe quelle structure de données.
  // ============================================================================
  async updateProfile(data: any) {
    return this.request('/user/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }


  // ============================================================================
  // Méthode getAllUsers pour récupérer la liste de tous les utilisateurs.
  // Cette méthode est principalement utilisée par les administrateurs.
  // Elle retourne un tableau d'objets utilisateur.
  // ============================================================================
  async getAllUsers() {
    return this.request('/users');
  }


  // ============================================================================
  // Méthode createClient pour créer un nouveau compte client.
  // firstName, lastName, email sont les informations du nouveau client.
  // Le serveur génère et retourne un mot de passe temporaire.
  // ============================================================================
  async createClient(firstName: string, lastName: string, email: string) {
    return this.request('/clients', {
      method: 'POST',
      body: JSON.stringify({ firstName, lastName, email }),
    });
  }


  // ============================================================================
  // Méthode updateClient pour modifier les informations d'un client.
  // userId identifie le client à modifier.
  // data contient les champs à mettre à jour.
  // ============================================================================
  async updateClient(userId: string, data: any) {
    return this.request(`/clients/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }


  // ============================================================================
  // Méthode deleteClient pour supprimer un compte client.
  // userId est l'identifiant unique du client à supprimer.
  // Cette action supprime également les données associées (transactions, compte).
  // ============================================================================
  async deleteClient(userId: string) {
    return this.request(`/clients/${userId}`, {
      method: 'DELETE',
    });
  }


  // ============================================================================
  // Méthode getClientAccount pour récupérer le compte du client connecté.
  // Cette méthode retourne le solde et les transactions du client.
  // L'endpoint '/clients/account/mine' utilise la session pour identifier le client.
  // ============================================================================
  async getClientAccount() {
    return this.request('/clients/account/mine');
  }


  // ============================================================================
  // Méthode getCryptocurrencies pour récupérer toutes les cryptomonnaies.
  // Cette méthode retourne la liste des cryptos avec leurs prix et historiques.
  // Utilisée pour afficher le marché et les options d'achat/vente.
  // ============================================================================
  async getCryptocurrencies() {
    return this.request('/cryptocurrencies');
  }


  // ============================================================================
  // Méthode getCryptocurrency pour récupérer une crypto spécifique.
  // cryptoId est l'identifiant unique de la cryptomonnaie.
  // Retourne les détails complets incluant l'historique des prix.
  // ============================================================================
  async getCryptocurrency(cryptoId: string) {
    return this.request(`/cryptocurrencies/${cryptoId}`);
  }


  // ============================================================================
  // Méthode getCurrentPrice pour obtenir le prix actuel d'une crypto.
  // cryptoId identifie la cryptomonnaie dont on veut le prix.
  // Utilisée pour afficher les prix en temps réel.
  // ============================================================================
  async getCurrentPrice(cryptoId: string) {
    return this.request(`/cryptocurrencies/${cryptoId}/price`);
  }


  // ============================================================================
  // Méthode buyCryptocurrency pour acheter de la cryptomonnaie.
  // cryptoId identifie quelle crypto acheter.
  // quantity est le nombre d'unités à acheter.
  // pricePerUnit est le prix unitaire au moment de l'achat.
  // ============================================================================
  async buyCryptocurrency(cryptoId: string, quantity: number, pricePerUnit: number) {
    return this.request('/wallet/buy', {
      method: 'POST',
      body: JSON.stringify({ cryptoId, quantity, pricePerUnit }),
    });
  }


  // ============================================================================
  // Méthode sellCryptocurrency pour vendre de la cryptomonnaie.
  // cryptoId identifie quelle crypto vendre.
  // quantity est le nombre d'unités à vendre.
  // pricePerUnit est le prix unitaire au moment de la vente.
  // ============================================================================
  async sellCryptocurrency(cryptoId: string, quantity: number, pricePerUnit: number) {
    return this.request('/wallet/sell', {
      method: 'POST',
      body: JSON.stringify({ cryptoId, quantity, pricePerUnit }),
    });
  }


  // ============================================================================
  // Méthode getWalletSummary pour récupérer le résumé du portefeuille.
  // Cette méthode retourne le solde en EUR et les positions crypto.
  // Utilisée pour afficher le tableau de bord du client.
  // ============================================================================
  async getWalletSummary() {
    return this.request('/wallet/summary');
  }
}


// ============================================================================
// Création et export de l'instance singleton du service API.
// 'export const' exporte une constante nommée pour l'importation.
// 'new ApiService(API_BASE_URL)' crée une instance avec l'URL de base.
// Cette instance unique est utilisée dans toute l'application.
// ============================================================================
export const api = new ApiService(API_BASE_URL);

