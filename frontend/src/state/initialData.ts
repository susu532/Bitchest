
// ============================================================================
// Import de nanoid pour générer des identifiants uniques.
// nanoid est une bibliothèque qui crée des IDs courts et sécurisés.
// Ces IDs sont utilisés pour identifier les utilisateurs et transactions.
// ============================================================================
import { nanoid } from 'nanoid';

// ============================================================================
// Import des données de cryptomonnaies depuis les constantes.
// CRYPTOCURRENCIES est un tableau contenant les infos de base des cryptos.
// Ce tableau définit les cryptos disponibles dans l'application.
// ============================================================================
import { CRYPTOCURRENCIES } from '../constants/cryptocurrencies';

// ============================================================================
// Import du générateur d'actifs crypto avec historique de prix.
// generateCryptoAssets crée les objets CryptoAsset avec prix simulés.
// Cette fonction génère l'historique de prix pour chaque crypto.
// ============================================================================
import { generateCryptoAssets } from '../utils/priceGenerator';

// ============================================================================
// Import des types pour typer les données initiales.
// 'type' importe uniquement les définitions de type sans code runtime.
// Ces types assurent la cohérence des structures de données.
// ============================================================================
import type { AppState, ClientAccount, User, WalletTransaction } from './types';

// ============================================================================
// Génération de l'ID unique pour l'administrateur par défaut.
// nanoid() génère un identifiant unique de 21 caractères.
// 'const' déclare une constante qui ne peut pas être modifiée.
// ============================================================================
const ADMIN_ID = nanoid();

// ============================================================================
// Génération de l'ID unique pour le client de démonstration.
// Ce client est pré-créé avec des transactions d'exemple.
// ============================================================================
const CLIENT_ID = nanoid();

// ============================================================================
// Fonction pour créer des transactions d'exemple pour le client démo.
// Cette fonction génère des achats fictifs de Bitcoin et Ethereum.
// Elle retourne un tableau de WalletTransaction pour la démo.
// ============================================================================
function seedClientTransactions(): WalletTransaction[] {
  // Recherche de Bitcoin dans le tableau des cryptomonnaies.
  // find() retourne le premier élément correspondant au prédicat.
  const btc = CRYPTOCURRENCIES.find((crypto) => crypto.id === 'bitcoin');
  // Recherche d'Ethereum dans le tableau des cryptomonnaies.
  const eth = CRYPTOCURRENCIES.find((crypto) => crypto.id === 'ethereum');

  // Retourne un tableau vide si les cryptos ne sont pas trouvées.
  if (!btc || !eth) {
    return [];
  }

  // Création d'une date actuelle pour calculer les dates passées.
  const now = new Date();

  // Retour d'un tableau de transactions fictives pour la démo.
  return [
    {
      // Génération d'un ID unique pour cette transaction.
      id: nanoid(),
      // Utilisation de l'ID Bitcoin trouvé précédemment.
      cryptoId: btc.id,
      // Prix d'achat fictif de 18 500€ par Bitcoin.
      // Le underscore (18_500) est un séparateur numérique pour lisibilité.
      pricePerUnit: 18_500,
      // Quantité achetée : 0.4 Bitcoin.
      quantity: 0.4,
      // Date d'achat : il y a 5 mois.
      // toISOString() convertit la date au format ISO 8601.
      timestamp: new Date(now.getFullYear(), now.getMonth() - 5, 12).toISOString(),
      // Type de transaction : achat.
      type: 'buy',
    },
    {
      id: nanoid(),
      cryptoId: btc.id,
      pricePerUnit: 25_200,
      quantity: 0.1,
      // Date d'achat : il y a 3 mois.
      timestamp: new Date(now.getFullYear(), now.getMonth() - 3, 4).toISOString(),
      type: 'buy',
    },
    {
      id: nanoid(),
      cryptoId: eth.id,
      pricePerUnit: 1_450,
      quantity: 1.5,
      // Date d'achat : il y a 2 mois.
      timestamp: new Date(now.getFullYear(), now.getMonth() - 2, 2).toISOString(),
      type: 'buy',
    },
  ];
}

// ============================================================================
// Tableau des utilisateurs initiaux pour la démonstration.
// Ce tableau contient un administrateur et un client de test.
// ============================================================================
const initialUsers: User[] = [
  {
    // ID unique généré pour l'administrateur.
    id: ADMIN_ID,
    // Prénom de l'administrateur de démonstration.
    firstName: 'Alicia',
    // Nom de famille de l'administrateur.
    lastName: 'Stone',
    // Email de l'administrateur (fictif pour la démo).
    email: 'admin@bitchest.example',
    // Rôle administrateur pour accéder au panneau d'admin.
    role: 'admin',
    // Mot de passe de démonstration (non sécurisé, uniquement pour test).
    password: 'admin123',
    // Date de création du compte.
    createdAt: new Date().toISOString(),
    // Date de dernière modification.
    updatedAt: new Date().toISOString(),
  },
  {
    // ID unique généré pour le client de démonstration.
    id: CLIENT_ID,
    firstName: 'Bruno',
    lastName: 'Martin',
    email: 'bruno@bitchest.example',
    // Rôle client pour accéder au tableau de bord client.
    role: 'client',
    password: 'bruno123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ============================================================================
// Objet des comptes clients mappés par userId.
// Record<string, ClientAccount> type un objet avec clés string.
// Seul le client démo a un compte pré-configuré.
// ============================================================================
const clientAccounts: Record<string, ClientAccount> = {
  // Utilisation de la syntaxe [CLIENT_ID] pour une clé dynamique.
  [CLIENT_ID]: {
    // Référence à l'ID du client propriétaire.
    userId: CLIENT_ID,
    // Solde initial de 500€ pour le client démo.
    balanceEUR: 500,
    // Transactions générées par la fonction seedClientTransactions.
    transactions: seedClientTransactions(),
  },
};

// ============================================================================
// Génération des actifs crypto avec historique de prix simulé.
// generateCryptoAssets() crée les objets CryptoAsset complets.
// Cette fonction est définie dans utils/priceGenerator.ts.
// ============================================================================
const cryptoAssets = generateCryptoAssets();

// ============================================================================
// Export de l'état initial de l'application.
// INITIAL_STATE est utilisé pour initialiser le reducer useReducer.
// Cette constante contient les utilisateurs, comptes et cryptos de départ.
// ============================================================================
export const INITIAL_STATE: AppState = {
  // Liste des utilisateurs de démonstration.
  users: initialUsers,
  // Comptes clients mappés par userId.
  clientAccounts,
  // Actifs crypto avec prix et historiques.
  cryptoAssets,
};

// ============================================================================
// Export de l'ID administrateur par défaut pour référence.
// Cette constante peut être utilisée pour des vérifications spéciales.
// ============================================================================
export const DEFAULT_ADMIN_ID = ADMIN_ID;

