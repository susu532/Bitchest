// Hedha el fichier eli fih kol el types mta3 l'app - Users, Transactions, Cryptos, w el State global
export type Role = 'admin' | 'client';


// El User 3andou id, esm, email, role (admin wella client), w dates mta3 creation
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


// Transaction mta3 el wallet: chri wella bi3 crypto b prix w quantity mo3ayen
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
  currentPrice: number;
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


export type CreateClientPayload = {
  firstName: string;
  lastName: string;
  email: string;
};


export type DeleteUserPayload = {
  userId: string;
};


// AppAction: kol les actions eli ynejem el reducer ya3melhom - CRUD users w update cryptos
export type AppAction =
  | { type: 'update-user'; payload: UpdateUserPayload }
  | { type: 'create-client'; payload: { user: User; account: ClientAccount } }
  | { type: 'delete-user'; payload: DeleteUserPayload }
  | { type: 'set-crypto-assets'; payload: Record<string, CryptoAsset> }
  | { type: 'set-users'; payload: User[] }
  | { type: 'set-client-account'; payload: { userId: string; account: ClientAccount } }
  | { type: 'update-crypto-price'; payload: { cryptoId: string; price: number } };
