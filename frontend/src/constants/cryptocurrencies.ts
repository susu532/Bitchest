export type CryptoDefinition = {
  id: string;
  name: string;
  symbol: string;
  icon: string;
};

export const CRYPTOCURRENCIES: CryptoDefinition[] = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    icon: '/assets/bitcoin.png',
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    icon: '/assets/ethereum.png',
  },
  {
    id: 'ripple',
    name: 'Ripple',
    symbol: 'XRP',
    icon: '/assets/ripple.png',
  },
  {
    id: 'bitcoin-cash',
    name: 'Bitcoin Cash',
    symbol: 'BCH',
    icon: '/assets/bitcoin-cash.png',
  },
  {
    id: 'cardano',
    name: 'Cardano',
    symbol: 'ADA',
    icon: '/assets/cardano.png',
  },
  {
    id: 'litecoin',
    name: 'Litecoin',
    symbol: 'LTC',
    icon: '/assets/litecoin.png',
  },
  {
    id: 'nem',
    name: 'NEM',
    symbol: 'XEM',
    icon: '/assets/nem.png',
  },
  {
    id: 'stellar',
    name: 'Stellar',
    symbol: 'XLM',
    icon: '/assets/stellar.png',
  },
  {
    id: 'iota',
    name: 'IOTA',
    symbol: 'MIOTA',
    icon: '/assets/iota.png',
  },
  {
    id: 'dash',
    name: 'Dash',
    symbol: 'DASH',
    icon: '/assets/dash.png',
  },
];

