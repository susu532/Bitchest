// Cette constante stocke l'adresse de base du serveur backend de l'application.
// Elle définit l'URL complète (protocole + domaine + port) où tourne l'API Laravel.
// Toutes les requêtes HTTP utiliseront cette valeur comme préfixe pour construire les URLs complètes.
const API_BASE_URL = 'http://localhost:8000';

// Ce type générique définit la structure de toutes les réponses retournées par l'API.
// Il utilise un paramètre de type T pour permettre de typer les données spécifiques retournées.
// Cela garantit la cohérence et la sécurité des types dans toute l'application.
export type ApiResponse<T> = {
  // Ce champ booléen indique si la requête API s'est terminée avec succès ou non.
  // Il permet au code appelant de vérifier rapidement le résultat sans analyser le code HTTP.
  // Une valeur true signifie que l'opération s'est déroulée sans erreur côté serveur.
  success: boolean;
  // Ce champ optionnel contient un message texte descriptif, souvent utilisé pour les erreurs.
  // Il fournit des détails sur ce qui s'est passé, comme "Invalid credentials" ou "User created".
  // Le point d'interrogation indique qu'il peut être absent (undefined) dans certaines réponses.
  message?: string;
  // Ce champ optionnel contient les données réelles retournées par l'API.
  // Le type T est défini lors de l'utilisation du type ApiResponse, comme ApiResponse<User>.
  // Il peut être absent si la réponse ne contient que success et message.
  data?: T;
  // Cette signature d'index permet d'ajouter des propriétés supplémentaires de n'importe quel type.
  // Elle offre de la flexibilité pour les réponses API qui contiennent des champs dynamiques.
  // Le type any signifie que ces propriétés peuvent contenir n'importe quelle valeur.
  [key: string]: any;
};

// Cette classe encapsule toute la logique de communication avec l'API backend.
// Elle centralise les appels HTTP et gère automatiquement les headers, l'authentification et les erreurs.
// L'utilisation d'une classe permet de partager la configuration (baseUrl) entre toutes les méthodes.
class ApiService {
  // Cette propriété privée stocke l'URL de base configurée pour toutes les requêtes.
  // Le mot-clé private empêche l'accès direct depuis l'extérieur de la classe.
  // Elle sera utilisée dans la méthode request pour construire les URLs complètes.
  private baseUrl: string;

  // Ce constructeur initialise une nouvelle instance du service API.
  // Il reçoit l'URL de base en paramètre pour permettre une configuration flexible.
  // Il est appelé une seule fois lors de la création du singleton à la fin du fichier.
  constructor(baseUrl: string) {
    // Cette instruction assigne l'URL de base reçue en paramètre à la propriété de l'instance.
    // Le mot-clé this fait référence à l'instance courante de la classe.
    // Cette valeur sera ensuite accessible dans toutes les méthodes de la classe.
    this.baseUrl = baseUrl;
  }

  // Cette méthode privée générique effectue les requêtes HTTP vers l'API backend.
  // Elle est asynchrone (async) car les appels réseau prennent du temps et retournent des Promises.
  // Le type générique T permet de typer la réponse attendue pour chaque appel spécifique.
  private async request<T>(
    // Ce paramètre définit le chemin relatif de l'endpoint API (ex: /auth/login).
    // Il sera combiné avec baseUrl pour former l'URL complète de la requête.
    // Il ne doit pas inclure le domaine, seulement le chemin après localhost:8000.
    endpoint: string,
    // Ce paramètre optionnel contient les options de configuration de la requête fetch.
    // Il inclut la méthode HTTP, les headers, le body, etc.
    // La valeur par défaut {} signifie qu'on peut appeler request sans options.
    options: RequestInit = {}
  ): Promise<T> {
    // Cette ligne construit l'URL complète en concaténant l'URL de base avec l'endpoint.
    // Les template literals (backticks) permettent d'insérer des variables avec ${}.
    // Par exemple: "http://localhost:8000" + "/auth/login" = "http://localhost:8000/auth/login".
    const url = `${this.baseUrl}${endpoint}`;

    // Cet objet définit les options par défaut qui seront appliquées à toutes les requêtes.
    // Il configure les comportements communs comme les headers JSON et l'inclusion des cookies.
    // Ces valeurs seront fusionnées avec les options passées en paramètre.
    const defaultOptions: RequestInit = {
      // Cette propriété définit la méthode HTTP par défaut pour les requêtes.
      // GET est utilisé par défaut car c'est la méthode la plus courante pour récupérer des données.
      // Les méthodes individuelles (login, createClient, etc.) peuvent la surcharger avec POST, PUT, DELETE.
      method: 'GET',
      // Cet objet définit les en-têtes HTTP qui seront envoyés avec chaque requête.
      // Les headers indiquent au serveur le format des données envoyées et acceptées.
      // Ils sont essentiels pour que Laravel comprenne et traite correctement les requêtes.
      headers: {
        // Ce header indique que le corps de la requête est au format JSON.
        // Il permet au serveur de parser automatiquement le body avec json_decode().
        // Sans cela, Laravel ne pourrait pas lire les données envoyées dans le body.
        'Content-Type': 'application/json',
        // Ce header indique qu'on souhaite recevoir une réponse au format JSON.
        // Il informe le serveur du format de réponse préféré par le client.
        // Laravel utilisera cette information pour formater sa réponse correctement.
        'Accept': 'application/json',
      },
      // Cette option indique que les cookies doivent être inclus dans les requêtes cross-origin.
      // Elle est essentielle pour que les sessions Laravel fonctionnent correctement.
      // Sans cela, le cookie de session ne serait pas envoyé et l'authentification échouerait.
      credentials: 'include',
      // Cet opérateur spread fusionne les options fournies avec les options par défaut.
      // Les propriétés dans options surchargeront celles de defaultOptions si elles existent.
      // Cela permet de personnaliser method, headers ou body pour chaque requête spécifique.
      ...options,
    };

    // Cette instruction affiche un log de débogage dans la console du navigateur.
    // Elle montre la méthode HTTP et l'URL complète de la requête sur le point d'être envoyée.
    // Les defaultOptions sont également affichées pour faciliter le débogage.
    console.log(`[API] ${defaultOptions.method} ${url}`, defaultOptions);

    // Ce bloc try-catch encapsule le code qui peut générer des erreurs.
    // Il permet de capturer les erreurs réseau ou de parsing et de les gérer proprement.
    // Sans cela, une erreur non gérée ferait crasher l'application.
    try {
      // Cette instruction effectue la requête HTTP réelle vers le serveur.
      // La fonction fetch est asynchrone, donc await suspend l'exécution jusqu'à la réponse.
      // L'objet response contient le statut HTTP, les headers et le body de la réponse.
      const response = await fetch(url, defaultOptions);

      // Cette instruction affiche le code de statut HTTP de la réponse dans la console.
      // Elle convertit les headers de la réponse en objet JavaScript pour un affichage plus lisible.
      // Cela aide à déboguer les problèmes en voyant exactement ce que le serveur renvoie.
      console.log(`[API] Response status: ${response.status}`, {
        // Cette expression convertit l'objet Headers en objet JavaScript standard.
        // Object.fromEntries transforme un itérateur de paires [clé, valeur] en objet.
        // response.headers est un objet Headers qui implémente l'interface itérable.
        headers: Object.fromEntries(response.headers),
      });

      // Cette condition vérifie si la réponse HTTP indique une erreur (code 4xx ou 5xx).
      // La propriété ok est true seulement pour les codes 2xx (succès).
      // Si elle est false, on doit traiter la réponse comme une erreur.
      if (!response.ok) {
        // Cette expression tente de parser le body de la réponse en JSON pour obtenir les détails de l'erreur.
        // Le .catch() gère le cas où le body n'est pas du JSON valide.
        // Dans ce cas, on retourne un objet d'erreur générique avec le code HTTP.
        const error = await response.json().catch(() => ({
          // Ce champ success est mis à false pour indiquer une erreur.
          // Il respecte la structure ApiResponse même en cas d'erreur de parsing.
          // Cela permet au code appelant de toujours vérifier error.success.
          success: false,
          // Ce message d'erreur générique inclut le code de statut HTTP.
          // Il sera utilisé si le serveur n'a pas retourné de JSON avec un message.
          // Par exemple: "HTTP 404" ou "HTTP 500".
          message: `HTTP ${response.status}`,
        }));
        // Cette instruction lance une erreur JavaScript avec le message extrait.
        // Elle utilise l'opérateur || pour fournir un message par défaut si error.message est vide.
        // Le throw interrompt l'exécution et passe au bloc catch.
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      // Cette instruction parse le body de la réponse en JSON et le retourne.
      // Elle est asynchrone car lire le body peut prendre du temps.
      // Le type T est inféré par TypeScript pour garantir que la réponse correspond au type attendu.
      return response.json();
    } catch (error: any) {
      // Cette instruction affiche l'erreur dans la console avec le contexte de l'endpoint.
      // Elle aide au débogage en montrant quel endpoint a échoué et pourquoi.
      // Le préfixe [API] permet de filtrer facilement ces logs dans la console.
      console.error(`[API] Error on ${endpoint}:`, error);
      // Cette instruction relance l'erreur pour que le code appelant puisse la gérer.
      // Sans cela, l'erreur serait silencieusement ignorée.
      // Le code appelant peut utiliser try-catch pour afficher un message à l'utilisateur.
      throw error;
    }
  }

  // Cette méthode asynchrone gère la connexion d'un utilisateur à l'application.
  // Elle envoie les identifiants au serveur et retourne les données de l'utilisateur si la connexion réussit.
  // Le mot-clé async permet d'utiliser await à l'intérieur de la méthode.
  async login(email: string, password: string) {
    // Cette instruction appelle la méthode request générique avec l'endpoint de login.
    // Elle retourne directement le résultat sans traitement supplémentaire.
    // Le type de retour est inféré automatiquement par TypeScript.
    return this.request('/auth/login', {
      // Cette propriété définit la méthode HTTP à utiliser pour cette requête.
      // POST est utilisé car on envoie des données sensibles (mot de passe) au serveur.
      // GET ne doit jamais être utilisé pour envoyer des credentials car ils apparaîtraient dans l'URL.
      method: 'POST',
      // Cette propriété contient le corps de la requête avec les identifiants.
      // JSON.stringify convertit l'objet JavaScript en chaîne JSON.
      // L'objet contient les deux paramètres email et password de la méthode.
      body: JSON.stringify({ email, password }),
    });
  }

  // Cette méthode asynchrone gère la déconnexion d'un utilisateur.
  // Elle informe le serveur de détruire la session courante.
  // Le serveur supprimera le cookie de session et la ligne dans la table sessions.
  async logout() {
    // Cette instruction appelle l'endpoint de déconnexion avec la méthode POST.
    // POST est utilisé car cette opération modifie l'état du serveur (détruit la session).
    // Aucun body n'est nécessaire car le serveur identifie l'utilisateur via le cookie de session.
    return this.request('/auth/logout', {
      // Cette propriété indique au serveur qu'on veut effectuer une action (détruire la session).
      // POST est préféré à GET pour les actions qui modifient l'état.
      // La méthode POST est plus sécurisée et respecte les conventions REST.
      method: 'POST',
    });
  }

  // Cette méthode asynchrone récupère les informations de l'utilisateur actuellement connecté.
  // Elle est utilisée au chargement de l'application pour vérifier si une session existe.
  // Si une session valide existe, le serveur retourne les données de l'utilisateur.
  async getCurrentUser() {
    // Cette instruction appelle l'endpoint /auth/me sans options supplémentaires.
    // La méthode GET par défaut est utilisée car on ne fait que récupérer des données.
    // Le cookie de session est automatiquement inclus grâce à credentials: 'include'.
    return this.request('/auth/me');
  }

  // Cette méthode asynchrone permet à un utilisateur de changer son mot de passe.
  // Elle nécessite l'ancien mot de passe pour des raisons de sécurité.
  // Le serveur vérifiera l'ancien mot de passe avant d'appliquer le changement.
  async changePassword(currentPassword: string, newPassword: string) {
    // Cette instruction envoie les deux mots de passe au serveur.
    // Le serveur validera que currentPassword correspond au mot de passe actuel.
    // Si la validation réussit, newPassword remplacera l'ancien mot de passe.
    return this.request('/auth/change-password', {
      // Cette propriété définit la méthode POST car on modifie des données.
      // POST est utilisé pour envoyer des données sensibles de manière sécurisée.
      // Le body ne sera pas visible dans les logs du serveur web.
      method: 'POST',
      // Cette propriété contient les deux mots de passe convertis en JSON.
      // Le serveur parsera ce JSON pour extraire currentPassword et newPassword.
      // La vérification de l'ancien mot de passe se fera côté serveur.
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Cette méthode asynchrone met à jour les informations du profil utilisateur.
  // Elle permet de modifier le prénom, nom et email de l'utilisateur connecté.
  // Les données à modifier sont passées dans le paramètre data.
  async updateProfile(data: any) {
    // Cette instruction envoie les nouvelles données au serveur.
    // Le serveur identifiera l'utilisateur via le cookie de session.
    // Seules les propriétés présentes dans data seront modifiées.
    return this.request('/user/profile', {
      // Cette propriété définit la méthode POST pour envoyer les modifications.
      // POST est approprié car on modifie l'état du serveur (données utilisateur).
      // Le serveur mettra à jour la base de données avec les nouvelles valeurs.
      method: 'POST',
      // Cette propriété convertit l'objet data en chaîne JSON.
      // data peut contenir firstName, lastName, email, ou d'autres champs.
      // Le serveur validera les données avant de les appliquer.
      body: JSON.stringify(data),
    });
  }

  // Cette méthode asynchrone récupère la liste de tous les utilisateurs.
  // Elle est réservée aux administrateurs et retournera une erreur pour les clients.
  // Le serveur vérifiera le rôle de l'utilisateur avant de retourner les données.
  async getAllUsers() {
    // Cette instruction appelle l'endpoint /users avec la méthode GET.
    // Aucune option n'est nécessaire car on ne fait que récupérer des données.
    // Le serveur retournera un tableau d'objets utilisateur (admin et clients).
    return this.request('/users');
  }

  // Cette méthode asynchrone crée un nouveau client dans le système.
  // Elle est réservée aux administrateurs et génère un mot de passe temporaire.
  // Le serveur créera à la fois l'utilisateur et son compte client avec un solde initial.
  async createClient(firstName: string, lastName: string, email: string) {
    // Cette instruction envoie les informations du nouveau client au serveur.
    // Le serveur validera que l'email est unique avant de créer le compte.
    // Un mot de passe temporaire sera généré et retourné dans la réponse.
    return this.request('/clients', {
      // Cette propriété définit POST car on crée une nouvelle ressource.
      // POST est la méthode HTTP standard pour les opérations de création.
      // Le serveur insérera une nouvelle ligne dans la table users.
      method: 'POST',
      // Cette propriété contient les données du nouveau client en JSON.
      // Le serveur extraira firstName, lastName et email pour créer l'utilisateur.
      // Un compte client avec un solde de 500€ sera également créé automatiquement.
      body: JSON.stringify({ firstName, lastName, email }),
    });
  }

  // Cette méthode asynchrone met à jour les informations d'un client existant.
  // Elle nécessite l'ID du client et un objet contenant les champs à modifier.
  // Seuls les administrateurs peuvent appeler cette méthode.
  async updateClient(userId: string, data: any) {
    // Cette instruction envoie les modifications au serveur pour un utilisateur spécifique.
    // L'ID utilisateur est inclus dans l'URL pour identifier quelle ressource modifier.
    // Le serveur validera que l'email est unique si celui-ci est modifié.
    return this.request(`/clients/${userId}`, {
      // Cette propriété définit PUT car on met à jour une ressource existante.
      // PUT est la méthode HTTP conventionnelle pour les mises à jour complètes.
      // Le serveur exécutera une requête UPDATE dans la base de données.
      method: 'PUT',
      // Cette propriété contient les nouvelles valeurs des champs à modifier.
      // data peut inclure firstName, lastName, email, ou d'autres propriétés.
      // Le serveur ne modifiera que les champs présents dans data.
      body: JSON.stringify(data),
    });
  }

  // Cette méthode asynchrone supprime un client et toutes ses données associées.
  // Elle est réservée aux administrateurs et ne peut pas être annulée.
  // Le serveur supprimera l'utilisateur, son compte et toutes ses transactions (CASCADE).
  async deleteClient(userId: string) {
    // Cette instruction envoie une requête de suppression au serveur.
    // L'ID utilisateur dans l'URL identifie quelle ressource supprimer.
    // Le serveur vérifiera que l'admin ne se supprime pas lui-même.
    return this.request(`/clients/${userId}`, {
      // Cette propriété définit DELETE pour supprimer la ressource.
      // DELETE est la méthode HTTP standard pour les suppressions.
      // Le serveur exécutera DELETE FROM users WHERE id = ? dans la base de données.
      method: 'DELETE',
    });
  }

  // Cette méthode asynchrone récupère le compte du client actuellement connecté.
  // Elle retourne le solde EUR et toutes les transactions du client.
  // Seuls les utilisateurs avec le rôle 'client' peuvent appeler cette méthode.
  async getClientAccount() {
    // Cette instruction appelle l'endpoint spécifique au compte du client connecté.
    // Le serveur identifiera le client via le cookie de session.
    // La réponse contiendra balanceEUR et un tableau de transactions.
    return this.request('/clients/account/mine');
  }

  // Cette méthode asynchrone récupère toutes les cryptomonnaies disponibles.
  // Elle retourne les données actuelles (prix, nom, symbole) et l'historique des 30 derniers jours.
  // Cette méthode est accessible à tous les utilisateurs authentifiés.
  async getCryptocurrencies() {
    // Cette instruction appelle l'endpoint qui retourne toutes les cryptos.
    // Le serveur joindra les tables cryptocurrencies et crypto_prices.
    // Pour chaque crypto, les 30 derniers jours de prix seront inclus.
    return this.request('/cryptocurrencies');
  }

  // Cette méthode asynchrone récupère les détails d'une cryptomonnaie spécifique.
  // Elle retourne les mêmes informations que getCryptocurrencies mais pour une seule crypto.
  // L'ID de la crypto (bitcoin, ethereum, etc.) est passé en paramètre.
  async getCryptocurrency(cryptoId: string) {
    // Cette instruction construit l'URL avec l'ID de la crypto spécifique.
    // Le serveur retournera les détails de cette crypto uniquement.
    // Cela inclut le prix actuel et l'historique des 30 derniers jours.
    return this.request(`/cryptocurrencies/${cryptoId}`);
  }

  // Cette méthode asynchrone récupère uniquement le prix actuel d'une crypto.
  // Elle est plus légère que getCryptocurrency car elle ne retourne pas l'historique.
  // Utilisée pour des mises à jour fréquentes du prix sans charger tout l'historique.
  async getCurrentPrice(cryptoId: string) {
    // Cette instruction appelle l'endpoint optimisé pour le prix actuel.
    // Le serveur retournera uniquement le dernier prix enregistré.
    // La requête SQL sera plus rapide car elle ne charge pas l'historique.
    return this.request(`/cryptocurrencies/${cryptoId}/price`);
  }

  // Cette méthode asynchrone effectue un achat de cryptomonnaie.
  // Elle nécessite l'ID de la crypto, la quantité à acheter et le prix unitaire.
  // Le serveur déduira le montant du solde EUR et créera une transaction.
  async buyCryptocurrency(cryptoId: string, quantity: number, pricePerUnit: number) {
    // Cette instruction envoie les détails de l'achat au serveur.
    // Le serveur calculera le coût total (quantity × pricePerUnit).
    // Si le solde est insuffisant, le serveur retournera une erreur 400.
    return this.request('/wallet/buy', {
      // Cette propriété définit POST car on crée une nouvelle transaction.
      // L'achat modifie le solde et crée une ligne dans wallet_transactions.
      // La méthode POST est appropriée pour cette opération de création.
      method: 'POST',
      // Cette propriété contient les détails de l'achat en JSON.
      // Le serveur extraira ces valeurs pour calculer le coût et vérifier le solde.
      // Une transaction de type 'buy' sera créée si tout est valide.
      body: JSON.stringify({ cryptoId, quantity, pricePerUnit }),
    });
  }

  // Cette méthode asynchrone effectue une vente de cryptomonnaie.
  // Elle nécessite l'ID de la crypto, la quantité à vendre et le prix unitaire.
  // Le serveur vérifiera que l'utilisateur possède suffisamment de crypto avant de vendre.
  async sellCryptocurrency(cryptoId: string, quantity: number, pricePerUnit: number) {
    // Cette instruction envoie les détails de la vente au serveur.
    // Le serveur calculera le gain (quantity × pricePerUnit).
    // Si les holdings sont insuffisants, le serveur retournera une erreur 400.
    return this.request('/wallet/sell', {
      // Cette propriété définit POST car on crée une nouvelle transaction de vente.
      // La vente augmente le solde EUR et crée une ligne dans wallet_transactions.
      // La méthode POST est standard pour créer des ressources.
      method: 'POST',
      // Cette propriété contient les détails de la vente en JSON.
      // Le serveur extraira ces valeurs pour calculer le gain et vérifier les holdings.
      // Une transaction de type 'sell' sera créée avec un profit/loss calculé.
      body: JSON.stringify({ cryptoId, quantity, pricePerUnit }),
    });
  }

  // Cette méthode asynchrone récupère un résumé détaillé du portefeuille du client.
  // Elle retourne le solde EUR, les holdings par crypto et le profit/loss total.
  // Le serveur calcule ces valeurs en analysant toutes les transactions du client.
  async getWalletSummary() {
    // Cette instruction appelle l'endpoint qui génère le résumé du portefeuille.
    // Le serveur fera des calculs complexes pour déterminer les holdings et le profit/loss.
    // La réponse inclura des graphiques et statistiques détaillées.
    return this.request('/wallet/summary');
  }
}

// Cette ligne crée et exporte une instance unique (singleton) du service API.
// Le pattern singleton garantit qu'une seule instance existe dans toute l'application.
// Tous les composants importeront cette même instance pour partager la configuration.
export const api = new ApiService(API_BASE_URL);
