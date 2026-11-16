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

const API_BASE_URL = (process.env.API_BASE_URL || process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const wsHost = process.env.REVERB_HOST || (isLocal ? 'localhost' : '');
const wsPort = Number(process.env.REVERB_PORT || (isLocal ? 8080 : 443));
const reverbKey = process.env.REVERB_KEY || '7kfpzm9vblwo9jdjebla';
const forceTLS = !isLocal;

export const echoService = {
  echo: null as any,

  initialize(): any {
    if (this.echo) {
      return this.echo;
    }

    if (!wsHost) {
      return null;
    }

    this.echo = new Echo({
      broadcaster: 'pusher' as const,
      key: reverbKey,
      wsHost,
      wsPort,
      wssPort: wsPort,
      cluster: 'mt1',
      forceTLS,
      encrypted: forceTLS,
      disableStats: true,
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${API_BASE_URL}/broadcasting/auth`,
      authorizer: (channel: any) => {
        return {
          authorize: (socketId: any, callback: any) => {
            axios.post(`${API_BASE_URL}/broadcasting/auth`, {
              socket_id: socketId,
              channel_name: channel.name,
            }, {
              withCredentials: true,
              headers: {
                'X-XSRF-TOKEN': decodeURIComponent(document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1] || ''),
                'Accept': 'application/json',
              },
            })
            .then((response) => {
              callback(false, response.data);
            })
            .catch((error) => {
              callback(true, error);
            });
          },
        };
      },
    } as any);

    console.log('[Echo] Initialized with config:', this.echo.options);
    return this.echo;
  },

  subscribeToUserEvents(userId: number | string, balanceCallback?: (data: any) => void, transactionCallback?: (data: any) => void) {
    const echo = this.initialize();
    if (!echo) return;

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
    if (!this.echo) return;
    this.echo.leave(channelName);
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
