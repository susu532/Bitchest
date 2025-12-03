
import Echo from 'laravel-echo';

import Pusher from 'pusher-js';


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
    } as any);


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
