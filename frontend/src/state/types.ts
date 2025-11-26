// Définit le type pour les rôles d'utilisateur (admin ou client)
export type Role = 'admin' | 'client';

// Définit la structure complète d'un utilisateur
export type User = {
  // Identifiant unique de l'utilisateur
  id: string;
  // Prénom de l'utilisateur
  firstName: string;
  // Nom de famille de l'utilisateur
  lastName: string;
  // Adresse email de l'utilisateur
  email: string;
  // Rôle de l'utilisateur: 'admin' ou 'client'
  role: Role;
  // Mot de passe haché (stocké côté serveur uniquement)
  password: string;
  // Date de création de l'utilisateur au format ISO
  createdAt: string;
  // Date de dernière modification au format ISO
  updatedAt: string;
};

// Type pour déterminer le type de transaction (achat ou vente)
export type WalletTransactionType = 'buy' | 'sell';

// Définit la structure d'une transaction de portefeuille
export type WalletTransaction = {
  // Identifiant unique de la transaction
  id: string;
  // ID de la cryptomonnaie concernée (ex: 'bitcoin')
  cryptoId: string;
  // Quantité de cryptomonnaie achetée ou vendue
  quantity: number;
  // Prix unitaire au moment de la transaction
  pricePerUnit: number;
  // Date et heure de la transaction au format ISO
  timestamp: string;
  // Type de transaction: 'buy' (achat) ou 'sell' (vente)
  type: WalletTransactionType;
};

// Définit la structure d'un compte client
export type ClientAccount = {
  // ID de l'utilisateur propriétaire du compte
  userId: string;
  // Solde en euros EUR disponible sur le compte
  balanceEUR: number;
  // Historique de toutes les transactions du compte
  transactions: WalletTransaction[];
};

// Définit un point du graphique historique de prix
export type CryptoPricePoint = {
  // Date au format ISO
  date: string;
  // Valeur du prix en EUR pour cette date
  value: number;
};

// Définit la structure d'une cryptomonnaie avec son historique et prix
export type CryptoAsset = {
  // Identifiant unique de la cryptomonnaie
  id: string;
  // Nom complet de la cryptomonnaie (ex: "Bitcoin")
  name: string;
  // Symbole d'échange (ex: "BTC")
  symbol: string;
  // Chemin vers l'icône de la cryptomonnaie
  icon: string;
  // Prix actuel de la cryptomonnaie en EUR
  currentPrice: number;
  // Historique des 30 derniers jours de prix
  history: CryptoPricePoint[];
};

// Définit l'état global de l'application
export type AppState = {
  // Liste de tous les utilisateurs du système
  users: User[];
  // Mapping des comptes clients par ID utilisateur
  clientAccounts: Record<string, ClientAccount>;
  // Mapping des actifs cryptographiques par ID
  cryptoAssets: Record<string, CryptoAsset>;
};

// Définit les données pour mettre à jour un utilisateur
export type UpdateUserPayload = {
  // ID de l'utilisateur à mettre à jour
  userId: string;
  // Données partielles de l'utilisateur à modifier
  data: Partial<Omit<User, 'id' | 'role' | 'createdAt' | 'password'>>;
};

// Définit les données pour mettre à jour le mot de passe d'un client
export type UpdateClientPasswordPayload = {
  // ID de l'utilisateur dont le mot de passe doit être changé
  userId: string;
  // Nouveau mot de passe
  newPassword: string;
};

// Définit les données pour créer un nouveau client
export type CreateClientPayload = {
  // Prénom du nouveau client
  firstName: string;
  // Nom de famille du nouveau client
  lastName: string;
  // Adresse email du nouveau client
  email: string;
};

// Définit les données pour supprimer un utilisateur
export type DeleteUserPayload = {
  // ID de l'utilisateur à supprimer
  userId: string;
};

// Définit les données pour enregistrer une transaction
export type RecordTransactionPayload = {
  // ID de l'utilisateur qui effectue la transaction
  userId: string;
  // Détails de la transaction à enregistrer
  transaction: WalletTransaction;
  // Montant d'ajustement du solde EUR (négatif pour achat, positif pour vente)
  balanceAdjustment: number;
};

// Définit tous les types d'actions possibles pour le reducer
export type AppAction =
  // Action pour mettre à jour les informations d'un utilisateur existant
  | { type: 'update-user'; payload: UpdateUserPayload }
  // Action pour créer un nouveau client avec son compte
  | { type: 'create-client'; payload: { user: User; account: ClientAccount } }
  // Action pour supprimer un utilisateur et son compte client
  | { type: 'delete-user'; payload: DeleteUserPayload }
  // Action pour mettre à jour le mot de passe d'un client
  | { type: 'update-client-password'; payload: UpdateClientPasswordPayload }
  // Action pour enregistrer une nouvelle transaction (achat ou vente)
  | { type: 'record-transaction'; payload: RecordTransactionPayload }
  // Action pour charger/mettre à jour tous les actifs cryptographiques
  | { type: 'set-crypto-assets'; payload: Record<string, CryptoAsset> }
  // Action pour charger/mettre à jour la liste de tous les utilisateurs
  | { type: 'set-users'; payload: User[] }
  // Action pour charger/mettre à jour le compte d'un client spécifique
  | { type: 'set-client-account'; payload: { userId: string; account: ClientAccount } }
  // Action pour mettre à jour le prix actuel d'une cryptomonnaie
  | { type: 'update-crypto-price'; payload: { cryptoId: string; price: number } };

