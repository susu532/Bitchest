import { nanoid } from 'nanoid';

import { CRYPTOCURRENCIES } from '../constants/cryptocurrencies';
import { generateCryptoAssets } from '../utils/priceGenerator';
import type { AppState, ClientAccount, User, WalletTransaction } from './types';

const ADMIN_ID = nanoid();
const CLIENT_ID = nanoid();

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
    balanceEUR: 1_250,
    transactions: seedClientTransactions(),
  },
};

const cryptoAssets = generateCryptoAssets();

export const INITIAL_STATE: AppState = {
  users: initialUsers,
  clientAccounts,
  cryptoAssets,
};

export const DEFAULT_ADMIN_ID = ADMIN_ID;

