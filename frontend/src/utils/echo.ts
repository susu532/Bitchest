// Importe la bibliothèque Echo pour WebSocket (compatible avec Reverb)
import Echo from 'laravel-echo';
// Importe Pusher pour la connexion WebSocket (protocole utilisé par Reverb)
import Pusher from 'pusher-js';

// Déclare les interfaces globales pour la fenêtre du navigateur
declare global {
  // Interface pour la fenêtre du navigateur
  interface Window {
    // Instance Echo globale
    Echo: any;
    // Classe Pusher globale
    Pusher: typeof Pusher;
  }
}

// Configure Pusher comme fallback global (Reverb utilise le protocole Pusher)
window.Pusher = Pusher;

// Crée un service centralisé pour les WebSockets
export const echoService = {
  // Instance Echo pour les connexions WebSocket
  echo: null as any,

  // Initialise la connexion WebSocket avec Reverb
  initialize(): any {
    // Si déjà initialisé, retourne l'instance existante
    if (this.echo) {
      return this.echo;
    }

    // Crée une nouvelle instance Echo avec configuration Reverb
    this.echo = new Echo({
      // Utilise le protocole Pusher
      broadcaster: 'pusher' as const,
      // Clé d'application Reverb (REVERB_APP_KEY)
      key: '7kfpzm9vblwo9jdjebla',
      // Adresse du serveur WebSocket
      wsHost: 'localhost',
      // Port du serveur WebSocket
      wsPort: 8080,
      // Port SSL/TLS du serveur WebSocket
      wssPort: 8080,
      // Cluster pour le routage
      cluster: 'mt1',
      // Force la connexion avec TLS (désactivé en local)
      forceTLS: false,
      // Désactive le chiffrement SSL (local)
      encrypted: false,
      // Désactive la collecte de statistiques
      disableStats: true,
    } as any);

    // Retourne l'instance Echo initialisée
    return this.echo;
  },

  // S'abonne aux mises à jour de prix des cryptomonnaies
  subscribeToprices(callback: (data: any) => void) {
    // Initialise Echo si nécessaire
    const echo = this.initialize();
    // S'abonne au canal public des mises à jour de prix
    echo.channel('crypto-prices').listen('price-updated', (data: any) => {
      // Exécute le callback à chaque mise à jour
      callback(data);
    });
  },

  // S'abonne aux mises à jour de prix d'une cryptomonnaie spécifique
  subscribeToSpecificPrice(cryptoId: string, callback: (data: any) => void) {
    // Initialise Echo si nécessaire
    const echo = this.initialize();
    // S'abonne au canal public de la cryptomonnaie spécifique
    echo.channel(`crypto-price.${cryptoId}`).listen('price-updated', (data: any) => {
      // Exécute le callback à chaque mise à jour
      callback(data);
    });
  },

  // S'abonne aux événements spécifiques à un utilisateur (changements de balance, transactions)
  subscribeToUserEvents(userId: number | string, balanceCallback?: (data: any) => void, transactionCallback?: (data: any) => void) {
    // Initialise Echo si nécessaire
    const echo = this.initialize();

    // S'abonne au canal privé de l'utilisateur pour les changements de balance
    echo.private(`user.${userId}`).listen('balance-changed', (data: any) => {
      // Exécute le callback de balance s'il existe
      if (balanceCallback) {
        balanceCallback(data);
      }
    });

    // S'abonne au canal privé de l'utilisateur pour les transactions complétées
    echo.private(`user.${userId}`).listen('transaction-completed', (data: any) => {
      // Exécute le callback de transaction s'il existe
      if (transactionCallback) {
        transactionCallback(data);
      }
    });
  },

  // Se désabonne d'un canal spécifique
  unsubscribe(channelName: string) {
    // Initialise Echo si nécessaire
    const echo = this.initialize();
    // Quitte le canal
    echo.leave(channelName);
  },

  // Récupère l'instance Echo actuelle
  getEcho(): any {
    // Initialise et retourne l'instance
    return this.initialize();
  },

  // Ferme la connexion WebSocket
  disconnect() {
    // Si une connexion Echo existe
    if (this.echo) {
      // Déconnecte la connexion
      this.echo.disconnect();
      // Réinitialise la variable
      this.echo = null;
    }
  },
};
