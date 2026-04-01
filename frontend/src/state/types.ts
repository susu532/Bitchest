
// ============================================================================
// Définition du type Role pour les rôles utilisateur dans l'application.
// 'export type' crée et exporte un alias de type TypeScript.
// 'admin' | 'client' est un type union littéral limitant les valeurs possibles.
// Ce type assure que seuls 'admin' ou 'client' sont acceptés comme rôles.
// ============================================================================
export type Role = 'admin' | 'client';


// ============================================================================
// Définition du type User représentant un utilisateur du système.
// 'export type' exporte ce type pour utilisation dans d'autres fichiers.
// Ce type définit la structure complète des données utilisateur.
// ============================================================================
export type User = {
  // id : identifiant unique de l'utilisateur (string pour cohérence API).
  id: string;
  // firstName : prénom de l'utilisateur.
  firstName: string;
  // lastName : nom de famille de l'utilisateur.
  lastName: string;
  // email : adresse email unique de l'utilisateur.
  email: string;
  // role : rôle de l'utilisateur, limité aux valeurs du type Role.
  role: Role;
  // password : mot de passe (vide côté client pour sécurité).
  password: string;
  // createdAt : date de création du compte au format ISO 8601.
  createdAt: string;
  // updatedAt : date de dernière modification au format ISO 8601.
  updatedAt: string;
};


// ============================================================================
// Définition du type WalletTransactionType pour les types de transaction.
// 'buy' représente un achat de cryptomonnaie.
// 'sell' représente une vente de cryptomonnaie.
// ============================================================================
export type WalletTransactionType = 'buy' | 'sell';


// ============================================================================
// Définition du type WalletTransaction représentant une transaction.
// Ce type contient toutes les informations d'une opération d'achat ou vente.
// ============================================================================
export type WalletTransaction = {
  // id : identifiant unique de la transaction.
  id: string;
  // cryptoId : identifiant de la cryptomonnaie concernée.
  cryptoId: string;
  // quantity : quantité de crypto achetée ou vendue.
  quantity: number;
  // pricePerUnit : prix unitaire au moment de la transaction en euros.
  pricePerUnit: number;
  // timestamp : date et heure de la transaction au format ISO 8601.
  timestamp: string;
  // type : type de transaction ('buy' ou 'sell').
  type: WalletTransactionType;
};


// ============================================================================
// Définition du type ClientAccount représentant le compte d'un client.
// Ce type contient le solde et l'historique des transactions d'un client.
// ============================================================================
export type ClientAccount = {
  // userId : identifiant de l'utilisateur propriétaire du compte.
  userId: string;
  // balanceEUR : solde disponible en euros.
  balanceEUR: number;
  // transactions : tableau de toutes les transactions du client.
  transactions: WalletTransaction[];
};


// ============================================================================
// Définition du type CryptoPricePoint pour un point de prix historique.
// Ce type représente le prix d'une crypto à une date donnée.
// ============================================================================
export type CryptoPricePoint = {
  // date : date du prix au format ISO 8601.
  date: string;
  // value : valeur du prix en euros à cette date.
  value: number;
};


// ============================================================================
// Définition du type CryptoAsset représentant une cryptomonnaie.
// Ce type contient toutes les informations d'une crypto disponible.
// ============================================================================
export type CryptoAsset = {
  // id : identifiant unique de la cryptomonnaie (ex: 'bitcoin').
  id: string;
  // name : nom complet de la cryptomonnaie (ex: 'Bitcoin').
  name: string;
  // symbol : symbole de la crypto (ex: 'BTC').
  symbol: string;
  // icon : emoji ou URL de l'icône de la crypto.
  icon: string;
  // currentPrice : prix actuel en euros.
  currentPrice: number;
  // history : tableau des points de prix historiques.
  history: CryptoPricePoint[];
};


// ============================================================================
// Définition du type AppState représentant l'état global de l'application.
// Ce type définit la structure complète du state géré par le reducer.
// ============================================================================
export type AppState = {
  // users : tableau de tous les utilisateurs du système.
  users: User[];
  // clientAccounts : objet mappant userId vers ClientAccount.
  // Record<string, ClientAccount> est un type d'objet avec clés string.
  clientAccounts: Record<string, ClientAccount>;
  // cryptoAssets : objet mappant cryptoId vers CryptoAsset.
  cryptoAssets: Record<string, CryptoAsset>;
};


// ============================================================================
// Définition du type UpdateUserPayload pour les mises à jour utilisateur.
// Ce type définit les données nécessaires pour modifier un utilisateur.
// ============================================================================
export type UpdateUserPayload = {
  // userId : identifiant de l'utilisateur à modifier.
  userId: string;
  // data : données partielles à mettre à jour.
  // Partial<> rend toutes les propriétés optionnelles.
  // Omit<> exclut les propriétés spécifiées (id, role, createdAt, password).
  data: Partial<Omit<User, 'id' | 'role' | 'createdAt' | 'password'>>;
};





// ============================================================================
// Définition du type CreateClientPayload pour créer un nouveau client.
// Ce type contient les informations minimales pour créer un compte.
// ============================================================================
export type CreateClientPayload = {
  firstName: string;
  lastName: string;
  email: string;
};


// ============================================================================
// Définition du type DeleteUserPayload pour supprimer un utilisateur.
// Ce type contient uniquement l'identifiant de l'utilisateur à supprimer.
// ============================================================================
export type DeleteUserPayload = {
  userId: string;
};





// ============================================================================
// Définition du type AppAction représentant toutes les actions du reducer.
// Ce type est une union discriminée basée sur la propriété 'type'.
// Chaque variante correspond à une action spécifique du reducer.
// ============================================================================
export type AppAction =
  // Action pour mettre à jour un utilisateur existant.
  | { type: 'update-user'; payload: UpdateUserPayload }
  // Action pour créer un nouveau client avec son compte.
  | { type: 'create-client'; payload: { user: User; account: ClientAccount } }
  // Action pour supprimer un utilisateur.
  | { type: 'delete-user'; payload: DeleteUserPayload }

  // Action pour définir la liste des cryptomonnaies depuis l'API.
  | { type: 'set-crypto-assets'; payload: Record<string, CryptoAsset> }
  // Action pour définir la liste des utilisateurs depuis l'API.
  | { type: 'set-users'; payload: User[] }
  // Action pour définir le compte d'un client depuis l'API.
  | { type: 'set-client-account'; payload: { userId: string; account: ClientAccount } }
  // Action pour mettre à jour le prix d'une cryptomonnaie.
  | { type: 'update-crypto-price'; payload: { cryptoId: string; price: number } };

