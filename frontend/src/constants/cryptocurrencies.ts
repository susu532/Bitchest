// Définit la structure de type pour une cryptomonnaie
export type CryptoDefinition = {
  // Identifiant unique pour la cryptomonnaie (utilisé comme clé)
  id: string;
  // Nom complet de la cryptomonnaie (ex: "Bitcoin")
  name: string;
  // Symbole d'échange court (ex: "BTC")
  symbol: string;
  // Chemin vers l'icône de la cryptomonnaie
  icon: string;
};

// Liste constante de toutes les cryptomonnaies supportées par la plateforme
export const CRYPTOCURRENCIES: CryptoDefinition[] = [
  {
    // Identifiant unique pour Bitcoin
    id: 'bitcoin',
    // Nom complet: Bitcoin
    name: 'Bitcoin',
    // Symbole d'échange: BTC
    symbol: 'BTC',
    // Chemin vers l'icône PNG de Bitcoin
    icon: '/assets/bitcoin.png',
  },
  {
    // Identifiant unique pour Ethereum
    id: 'ethereum',
    // Nom complet: Ethereum
    name: 'Ethereum',
    // Symbole d'échange: ETH
    symbol: 'ETH',
    // Chemin vers l'icône PNG d'Ethereum
    icon: '/assets/ethereum.png',
  },
  {
    // Identifiant unique pour Ripple
    id: 'ripple',
    // Nom complet: Ripple
    name: 'Ripple',
    // Symbole d'échange: XRP
    symbol: 'XRP',
    // Chemin vers l'icône PNG de Ripple
    icon: '/assets/ripple.png',
  },
  {
    // Identifiant unique pour Bitcoin Cash
    id: 'bitcoin-cash',
    // Nom complet: Bitcoin Cash
    name: 'Bitcoin Cash',
    // Symbole d'échange: BCH
    symbol: 'BCH',
    // Chemin vers l'icône PNG de Bitcoin Cash
    icon: '/assets/bitcoin-cash.png',
  },
  {
    // Identifiant unique pour Cardano
    id: 'cardano',
    // Nom complet: Cardano
    name: 'Cardano',
    // Symbole d'échange: ADA
    symbol: 'ADA',
    // Chemin vers l'icône PNG de Cardano
    icon: '/assets/cardano.png',
  },
  {
    // Identifiant unique pour Litecoin
    id: 'litecoin',
    // Nom complet: Litecoin
    name: 'Litecoin',
    // Symbole d'échange: LTC
    symbol: 'LTC',
    // Chemin vers l'icône PNG de Litecoin
    icon: '/assets/litecoin.png',
  },
  {
    // Identifiant unique pour NEM
    id: 'nem',
    // Nom complet: NEM
    name: 'NEM',
    // Symbole d'échange: XEM
    symbol: 'XEM',
    // Chemin vers l'icône PNG de NEM
    icon: '/assets/nem.png',
  },
  {
    // Identifiant unique pour Stellar
    id: 'stellar',
    // Nom complet: Stellar
    name: 'Stellar',
    // Symbole d'échange: XLM
    symbol: 'XLM',
    // Chemin vers l'icône PNG de Stellar
    icon: '/assets/stellar.png',
  },
  {
    // Identifiant unique pour IOTA
    id: 'iota',
    // Nom complet: IOTA
    name: 'IOTA',
    // Symbole d'échange: MIOTA
    symbol: 'MIOTA',
    // Chemin vers l'icône PNG d'IOTA
    icon: '/assets/iota.png',
  },
  {
    // Identifiant unique pour Dash
    id: 'dash',
    // Nom complet: Dash
    name: 'Dash',
    // Symbole d'échange: DASH
    symbol: 'DASH',
    // Chemin vers l'icône PNG de Dash
    icon: '/assets/dash.png',
  },
];

