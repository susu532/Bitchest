import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Echo: any;
    Pusher: typeof Pusher;
  }
  interface ImportMeta {
    env: Record<string, string>;
  }
}

// Pusher fallback configuration (using Reverb which uses Pusher protocol)
window.Pusher = Pusher;

export const echoService = {
  echo: null as any,

  initialize(): any {
    if (this.echo) {
      return this.echo;
    }

    this.echo = new Echo({
      broadcaster: 'pusher',
      key: import.meta.env.VITE_REVERB_APP_KEY || '7kfpzm9vblwo9jdjebla',
      wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
      wsPort: parseInt(import.meta.env.VITE_REVERB_PORT || '8080'),
      wssPort: parseInt(import.meta.env.VITE_REVERB_PORT || '8080'),
      cluster: 'mt1',
      forceTLS: false,
      encrypted: false,
      disableStats: true,
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

  // Disconnect
  disconnect() {
    if (this.echo) {
      this.echo.disconnect();
      this.echo = null;
    }
  },
};
