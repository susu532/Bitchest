// Importe la fonction nanoid pour générer des identifiants uniques aléatoires
import { nanoid } from 'nanoid';

// Importe la liste des cryptomonnaies supportées
import { CRYPTOCURRENCIES } from '../constants/cryptocurrencies';
// Importe la fonction pour générer les données de prix des cryptomonnaies
import { generateCryptoAssets } from '../utils/priceGenerator';
// Importe les types TypeScript pour AppState, ClientAccount, User et WalletTransaction
import type { AppState, ClientAccount, User, WalletTransaction } from './types';

// Génère et stocke l'ID unique pour le compte administrateur
const ADMIN_ID = nanoid();
// Génère et stocke l'ID unique pour le compte client de démonstration
const CLIENT_ID = nanoid();

// Fonction pour créer des transactions de démonstration pour le client initial
function seedClientTransactions(): WalletTransaction[] {
  // Recherche Bitcoin dans la liste des cryptomonnaies
  const btc = CRYPTOCURRENCIES.find((crypto) => crypto.id === 'bitcoin');
  // Recherche Ethereum dans la liste des cryptomonnaies
  const eth = CRYPTOCURRENCIES.find((crypto) => crypto.id === 'ethereum');

  // Si Bitcoin ou Ethereum n'existe pas dans la liste, retourne un tableau vide
  if (!btc || !eth) {
    return [];
  }

  // Obtient la date actuelle
  const now = new Date();

  // Retourne un tableau de transactions de démonstration
  return [
    {
      // Génère un ID unique pour cette transaction
      id: nanoid(),
      // Utilise l'ID de Bitcoin
      cryptoId: btc.id,
      // Prix d'achat: 18 500 € par BTC
      pricePerUnit: 18_500,
      // Quantité achetée: 0.4 BTC
      quantity: 0.4,
      // Date de la transaction: il y a 5 mois
      timestamp: new Date(now.getFullYear(), now.getMonth() - 5, 12).toISOString(),
      // Type de transaction: achat
      type: 'buy',
    },
    {
      // Génère un ID unique pour cette transaction
      id: nanoid(),
      // Utilise l'ID de Bitcoin
      cryptoId: btc.id,
      // Prix d'achat: 25 200 € par BTC
      pricePerUnit: 25_200,
      // Quantité achetée: 0.1 BTC
      quantity: 0.1,
      // Date de la transaction: il y a 3 mois
      timestamp: new Date(now.getFullYear(), now.getMonth() - 3, 4).toISOString(),
      // Type de transaction: achat
      type: 'buy',
    },
    {
      // Génère un ID unique pour cette transaction
      id: nanoid(),
      // Utilise l'ID d'Ethereum
      cryptoId: eth.id,
      // Prix d'achat: 1 450 € par ETH
      pricePerUnit: 1_450,
      // Quantité achetée: 1.5 ETH
      quantity: 1.5,
      // Date de la transaction: il y a 2 mois
      timestamp: new Date(now.getFullYear(), now.getMonth() - 2, 2).toISOString(),
      // Type de transaction: achat
      type: 'buy',
    },
  ];
}

// Définit la liste initiale des utilisateurs du système
const initialUsers: User[] = [
  {
    // Identifiant unique de l'admin
    id: ADMIN_ID,
    // Prénom de l'admin
    firstName: 'Alicia',
    // Nom de l'admin
    lastName: 'Stone',
    // Email de l'admin
    email: 'admin@bitchest.example',
    // Rôle: administrateur
    role: 'admin',
    // Mot de passe initial (pour la démo)
    password: 'admin123',
    // Date de création du compte
    createdAt: new Date().toISOString(),
    // Date de dernière mise à jour
    updatedAt: new Date().toISOString(),
  },
  {
    // Identifiant unique du client de démonstration
    id: CLIENT_ID,
    // Prénom du client
    firstName: 'Bruno',
    // Nom du client
    lastName: 'Martin',
    // Email du client
    email: 'bruno@bitchest.example',
    // Rôle: client
    role: 'client',
    // Mot de passe initial (pour la démo)
    password: 'bruno123',
    // Date de création du compte
    createdAt: new Date().toISOString(),
    // Date de dernière mise à jour
    updatedAt: new Date().toISOString(),
  },
];

// Mapping des comptes clients par leur ID utilisateur
const clientAccounts: Record<string, ClientAccount> = {
  // Crée le compte client pour Bruno
  [CLIENT_ID]: {
    // Lie le compte à l'utilisateur Bruno
    userId: CLIENT_ID,
    // Solde initial en EUR: 500€
    balanceEUR: 500,
    // Charge les transactions de démonstration
    transactions: seedClientTransactions(),
  },
};

// Génère les données des cryptomonnaies avec historique de prix
const cryptoAssets = generateCryptoAssets();

// Exporte l'état initial complet de l'application
export const INITIAL_STATE: AppState = {
  // Liste des utilisateurs initiaux
  users: initialUsers,
  // Mapping des comptes clients initiaux
  clientAccounts,
  // Actifs cryptographiques avec prix et historique
  cryptoAssets,
};

// Exporte l'ID de l'administrateur par défaut (utile pour les tests et la configuration)
export const DEFAULT_ADMIN_ID = ADMIN_ID;

