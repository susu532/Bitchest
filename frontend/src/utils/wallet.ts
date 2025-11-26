// Importe les types pour les transactions et actifs cryptographiques
import type { CryptoAsset, WalletTransaction } from '../state/types';

// Définit un résumé des actifs détenus dans un portefeuille
export type HoldingSummary = {
  // ID de la cryptomonnaie
  cryptoId: string;
  // Quantité totale détenue
  quantity: number;
  // Coût total d'acquisition (prix d'achat × quantité)
  costBasis: number;
  // Prix moyen d'acquisition
  averagePrice: number;
  // Date de la dernière transaction concernant cette crypto
  lastTransactionAt: string;
};

// Extension du résumé avec les valeurs actuelles du marché
export type HoldingWithValue = HoldingSummary & {
  // Prix actuel de la cryptomonnaie
  currentPrice: number;
  // Valeur actuelle de la participation (quantité × prix actuel)
  currentValue: number;
  // Profit ou perte réalisée (valeur actuelle - coût d'acquisition)
  profitLoss: number;
};

// Résume les participations cryptographiques à partir de l'historique des transactions
export function summarizeHoldings(transactions: WalletTransaction[]): Record<string, HoldingSummary> {
  // Crée une copie triée des transactions par date
  const sorted = [...transactions].sort(
    // Trie en ordre croissant de date
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  // Objet pour stocker les résumés par ID de cryptomonnaie
  const summaries: Record<string, HoldingSummary> = {};

  // Traite chaque transaction dans l'ordre chronologique
  sorted.forEach((transaction) => {
    // Déstructure les données de la transaction
    const { cryptoId, type, quantity, pricePerUnit, timestamp } = transaction;

    // Si c'est la première transaction pour cette crypto
    if (!summaries[cryptoId]) {
      // Initialise le résumé avec des valeurs nulles
      summaries[cryptoId] = {
        // ID de la cryptomonnaie
        cryptoId,
        // Quantité initiale: 0
        quantity: 0,
        // Coût d'acquisition initial: 0
        costBasis: 0,
        // Prix moyen initial: 0
        averagePrice: 0,
        // Date de dernière transaction
        lastTransactionAt: timestamp,
      };
    }

    // Récupère le résumé courant
    const summary = summaries[cryptoId];

    // Si c'est un achat
    if (type === 'buy') {
      // Ajoute le coût à la base de coût
      summary.costBasis += quantity * pricePerUnit;
      // Ajoute la quantité au total
      summary.quantity += quantity;
    } else {
      // Type 'sell': vente de cryptomonnaie
      // Récupère la quantité actuelle avant la vente
      const remainingQuantity = summary.quantity;
      // Si la quantité n'est pas nulle
      if (remainingQuantity > 0) {
        // Calcule le coût moyen
        const averageCost = summary.costBasis / remainingQuantity;
        // Réduit la base de coût en fonction du coût moyen
        summary.costBasis -= averageCost * quantity;
      }
      // Réduit la quantité vendue
      summary.quantity -= quantity;
    }

    // Arrondit la quantité à 8 décimales
    summary.quantity = Number(summary.quantity.toFixed(8));
    // Assure que la base de coût est positive (minimum 0)
    summary.costBasis = Number(Math.max(summary.costBasis, 0).toFixed(2));
    // Calcule le prix moyen (0 si quantité est 0)
    summary.averagePrice = summary.quantity > 0 ? Number((summary.costBasis / summary.quantity).toFixed(2)) : 0;
    // Met à jour la date de dernière transaction
    summary.lastTransactionAt = timestamp;

    // Si la quantité est très proche de zéro (arrondi)
    if (summary.quantity <= 0.00000001) {
      // Réinitialise à 0 pour éviter les erreurs d'arrondi
      summary.quantity = 0;
      // Réinitialise le coût
      summary.costBasis = 0;
      // Réinitialise le prix moyen
      summary.averagePrice = 0;
    }
  });

  // Retourne tous les résumés calculés
  return summaries;
}

// Enrichit les résumés de participations avec les prix actuels du marché
export function enrichHoldingsWithPrices(
  // Résumés des participations sans prix
  holdings: Record<string, HoldingSummary>,
  // Actifs cryptographiques avec prix actuels
  cryptoAssets: Record<string, CryptoAsset>,
): HoldingWithValue[] {
  // Convertit les résumés en tableau, filtre ceux non pertinents
  return Object.values(holdings)
    // Filtre pour ne garder que les holdings avec quantité ou coût
    .filter((holding) => holding.quantity > 0 || holding.costBasis > 0)
    // Enrichit chaque holding avec les prix actuels
    .map((holding) => {
      // Récupère l'actif correspondant
      const asset = cryptoAssets[holding.cryptoId];
      // Récupère le prix actuel (dernier prix de l'historique)
      const currentPrice = asset?.history.at(-1)?.value ?? 0;
      // Calcule la valeur actuelle (quantité × prix)
      const currentValue = Number((currentPrice * holding.quantity).toFixed(2));
      // Calcule le profit ou la perte (valeur actuelle - coût)
      const profitLoss = Number((currentValue - holding.costBasis).toFixed(2));

      // Retourne le holding enrichi
      return {
        // Spread tous les champs du résumé original
        ...holding,
        // Ajoute le prix actuel
        currentPrice,
        // Ajoute la valeur actuelle
        currentValue,
        // Ajoute le profit/perte
        profitLoss,
      };
    });
}

// Calcule la valeur totale du portefeuille
export function calculatePortfolioValue(
  // Holdings enrichis avec prix actuel
  holdings: HoldingWithValue[],
  // Solde en cash (EUR)
  cashBalance: number,
): { invested: number; marketValue: number; profitLoss: number; totalBalance: number } {
  // Calcule l'investissement total (somme des coûts d'acquisition)
  const invested = holdings.reduce((acc, holding) => acc + holding.costBasis, 0);
  // Calcule la valeur de marché totale (somme des valeurs actuelles)
  const marketValue = holdings.reduce((acc, holding) => acc + holding.currentValue, 0);
  // Calcule le profit/perte total (différence entre valeur de marché et investissement)
  const profitLoss = Number((marketValue - invested).toFixed(2));
  // Calcule le solde total (valeur de marché + cash)
  const totalBalance = Number((marketValue + cashBalance).toFixed(2));

  // Retourne tous les calculs
  return {
    // Investissement total arrondi à 2 décimales
    invested: Number(invested.toFixed(2)),
    // Valeur de marché totale arrondie à 2 décimales
    marketValue: Number(marketValue.toFixed(2)),
    // Profit/perte total
    profitLoss,
    // Solde total du portefeuille
    totalBalance,
  };
}

// Récupère la quantité disponible d'une cryptomonnaie spécifique
export function getAvailableQuantity(transactions: WalletTransaction[], cryptoId: string): number {
  // Résume toutes les participations
  const holdings = summarizeHoldings(transactions);
  // Retourne la quantité pour cette crypto, ou 0 si non présente
  return holdings[cryptoId]?.quantity ?? 0;
}

