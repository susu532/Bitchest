// Hedha el service mta3 Laravel Echo w Pusher bech nrecevw el events en temps reel
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import axios from 'axios';

declare global {
  interface Window {
    Echo: any;
    Pusher: typeof Pusher;
  }
}

window.Pusher = Pusher;

export const echoService = {
  echo: null as any,

  initialize(): any {
    if (this.echo) {
      return this.echo;
    }

    this.echo = new Echo({
      broadcaster: 'pusher' as const,
      key: '7kfpzm9vblwo9jdjebla',
      wsHost: 'localhost',
      wsPort: 8080,
      wssPort: 8080,
      cluster: 'mt1',
      forceTLS: false,
      encrypted: false,
      disableStats: true,
      enabledTransports: ['ws', 'wss'],
      authEndpoint: 'http://localhost:8000/broadcasting/auth',
      authorizer: (channel: any, _options: any) => {
        return {
          authorize: (socketId: any, callback: any) => {
            axios.post('http://localhost:8000/broadcasting/auth', {
              socket_id: socketId,
              channel_name: channel.name
            }, {
              withCredentials: true,
              headers: {
                'X-XSRF-TOKEN': decodeURIComponent(document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1] || ''),
                'Accept': 'application/json'
              }
            })
            .then((response) => {
              callback(false, response.data);
            })
            .catch((error) => {
              callback(true, error);
            });
          }
        };
      },
    } as any);

    console.log('[Echo] Initialized with config:', this.echo.options);

    return this.echo;
  },

  subscribeToprices(callback: (data: any) => void) {
    const echo = this.initialize();
    echo.channel('crypto-prices').listen('price-updated', (data: any) => {
      callback(data);
    });
  },

  subscribeToSpecificPrice(cryptoId: string, callback: (data: any) => void) {
    const echo = this.initialize();
    echo.channel(`crypto-price.${cryptoId}`).listen('price-updated', (data: any) => {
      callback(data);
    });
  },

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

  unsubscribe(channelName: string) {
    const echo = this.initialize();
    echo.leave(channelName);
  },

  getEcho(): any {
    return this.initialize();
  },

  disconnect() {
    if (this.echo) {
      this.echo.disconnect();
      this.echo = null;
    }
  },
};
