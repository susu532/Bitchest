import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Echo: any;
    Pusher: typeof Pusher;
  }
}

// Pusher fallback configuration (using Reverb which uses Pusher protocol)
window.Pusher = Pusher;

export const echoService = {
  echo: null as any,
  isConnected: false,

  initialize(): any {
    if (this.echo) {
      return this.echo;
    }

    // Configuration for Reverb WebSocket server
    // Adjust these values if running on different host/port
    this.echo = new Echo({
      broadcaster: 'pusher' as const,
      key: '7kfpzm9vblwo9jdjebla', // REVERB_APP_KEY from .env
      wsHost: 'localhost', // REVERB_HOST
      wsPort: 8080, // REVERB_PORT
      wssPort: 8080,
      cluster: 'mt1',
      forceTLS: false,
      encrypted: false,
      disableStats: true,
    } as any);

    // Add error and connection handlers
    this.echo.connector.socket.addEventListener('connect', () => {
      console.log('[Echo] WebSocket connected');
      this.isConnected = true;
    });

    this.echo.connector.socket.addEventListener('disconnect', () => {
      console.warn('[Echo] WebSocket disconnected');
      this.isConnected = false;
    });

    this.echo.connector.socket.addEventListener('error', (error: any) => {
      console.error('[Echo] WebSocket error:', error);
      this.isConnected = false;
    });

    return this.echo;
  },

  // Subscribe to crypto price updates
  subscribeToprices(callback: (data: any) => void) {
    const echo = this.initialize();
    echo.channel('crypto-prices').listen('price-updated', (data: any) => {
      callback(data);
    });
  },

  // Subscribe to specific crypto price
  subscribeToSpecificPrice(cryptoId: string, callback: (data: any) => void) {
    const echo = this.initialize();
    echo.channel(`crypto-price.${cryptoId}`).listen('price-updated', (data: any) => {
      callback(data);
    });
  },

  // Subscribe to user-specific events (balance changes, transactions)
  subscribeToUserEvents(userId: number | string, balanceCallback?: (data: any) => void, transactionCallback?: (data: any) => void) {
    const echo = this.initialize();

    echo.private(`user.${userId}`).listen('balance-changed', (data: any) => {
      if (balanceCallback) {
        balanceCallback(data);
      }
    });

    echo.private(`user.${userId}`).listen('transaction-completed', (data: any) => {
      if (transactionCallback) {
        transactionCallback(data);
      }
    });
  },

  // Unsubscribe from channel
  unsubscribe(channelName: string) {
    const echo = this.initialize();
    echo.leave(channelName);
  },

  // Get current echo instance
  getEcho(): any {
    return this.initialize();
  },

  // Check connection status
  isWebSocketConnected(): boolean {
    return this.isConnected;
  },

  // Disconnect
  disconnect() {
    if (this.echo) {
      this.echo.disconnect();
      this.echo = null;
      this.isConnected = false;
    }
  },
};
