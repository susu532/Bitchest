// El data el initial mta3 l'app - users demo, comptes clients, w prix mta3 el cryptos
import { nanoid } from 'nanoid';

import { CRYPTOCURRENCIES } from '../constants/cryptocurrencies';

import type { AppState, ClientAccount, User, WalletTransaction, CryptoAsset } from './types';

const ADMIN_ID = nanoid();

const CLIENT_ID = nanoid();

// Hne na3mlou transactions fictives lel client demo - achat BTC w ETH
function seedClientTransactions(): WalletTransaction[] {
  const btc = CRYPTOCURRENCIES.find((crypto) => crypto.id === 'bitcoin');
  const eth = CRYPTOCURRENCIES.find((crypto) => crypto.id === 'ethereum');

  if (!btc || !eth) {
    return [];
  }

  const now = new Date();

  return [
    {
      id: nanoid(),
      cryptoId: btc.id,
      pricePerUnit: 18_500,
      quantity: 0.4,
      timestamp: new Date(now.getFullYear(), now.getMonth() - 5, 12).toISOString(),
      type: 'buy',
    },
    {
      id: nanoid(),
      cryptoId: btc.id,
      pricePerUnit: 25_200,
      quantity: 0.1,
      timestamp: new Date(now.getFullYear(), now.getMonth() - 3, 4).toISOString(),
      type: 'buy',
    },
    {
      id: nanoid(),
      cryptoId: eth.id,
      pricePerUnit: 1_450,
      quantity: 1.5,
      timestamp: new Date(now.getFullYear(), now.getMonth() - 2, 2).toISOString(),
      type: 'buy',
    },
  ];
}

// Users mta3 el demo: admin (Alicia) w client (Bruno) b passwords lel test
const initialUsers: User[] = [
  {
    id: ADMIN_ID,
    firstName: 'Alicia',
    lastName: 'Stone',
    email: 'admin@bitchest.example',
    role: 'admin',
    password: 'admin123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: CLIENT_ID,
    firstName: 'Bruno',
    lastName: 'Martin',
    email: 'bruno@bitchest.example',
    role: 'client',
    password: 'bruno123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const clientAccounts: Record<string, ClientAccount> = {
  [CLIENT_ID]: {
    userId: CLIENT_ID,
    balanceEUR: 500,
    transactions: seedClientTransactions(),
  },
};

// Les prix de base lel 10 cryptos eli 3andna fil app
const basePrices: Record<string, number> = {
  bitcoin: 65000,
  ethereum: 3200,
  ripple: 0.55,
  'bitcoin-cash': 380,
  cardano: 0.42,
  litecoin: 75,
  nem: 0.03,
  stellar: 0.12,
  iota: 0.18,
  dash: 28,
};

const cryptoAssets: Record<string, CryptoAsset> = CRYPTOCURRENCIES.reduce((acc, crypto) => {
  const currentPrice = basePrices[crypto.id] ?? 100;
  acc[crypto.id] = {
    id: crypto.id,
    name: crypto.name,
    symbol: crypto.symbol,
    icon: crypto.icon,
    currentPrice,
    history: [],
  };
  return acc;
}, {} as Record<string, CryptoAsset>);

// INITIAL_STATE: el state eli yetchargi ki yebda l'app lel awel marra
export const INITIAL_STATE: AppState = {
  users: initialUsers,
  clientAccounts,
  cryptoAssets,
};

export const DEFAULT_ADMIN_ID = ADMIN_ID;
