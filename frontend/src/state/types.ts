export type Role = 'admin' | 'client';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  password: string;
  createdAt: string;
  updatedAt: string;
};

export type WalletTransactionType = 'buy' | 'sell';

export type WalletTransaction = {
  id: string;
  cryptoId: string;
  quantity: number;
  pricePerUnit: number;
  timestamp: string;
  type: WalletTransactionType;
};

export type ClientAccount = {
  userId: string;
  balanceEUR: number;
  transactions: WalletTransaction[];
};

export type CryptoPricePoint = {
  date: string;
  value: number;
};

export type CryptoAsset = {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  backendId?: number | string;
  history: CryptoPricePoint[];
};

export type AppState = {
  users: User[];
  clientAccounts: Record<string, ClientAccount>;
  cryptoAssets: Record<string, CryptoAsset>;
};

export type UpdateUserPayload = {
  userId: string;
  data: Partial<Omit<User, 'id' | 'role' | 'createdAt' | 'password'>>;
};

export type UpdateClientPasswordPayload = {
  userId: string;
  newPassword: string;
};

export type CreateClientPayload = {
  firstName: string;
  lastName: string;
  email: string;
};

export type DeleteUserPayload = {
  userId: string;
};

export type RecordTransactionPayload = {
  userId: string;
  transaction: WalletTransaction;
  balanceAdjustment: number;
};

export type AppAction =
  | { type: 'update-user'; payload: UpdateUserPayload }
  | { type: 'create-client'; payload: { user: User; account: ClientAccount } }
  | { type: 'delete-user'; payload: DeleteUserPayload }
  | { type: 'update-client-password'; payload: UpdateClientPasswordPayload }
  | { type: 'record-transaction'; payload: RecordTransactionPayload }
  | { type: 'set-crypto-assets'; payload: Record<string, CryptoAsset> };

