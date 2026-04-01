
// ============================================================================
// Import des types nécessaires pour les transactions et actifs crypto.
// 'type' importe uniquement les définitions de type sans le code runtime.
// CryptoAsset représente une cryptomonnaie avec son prix et historique.
// WalletTransaction représente une transaction d'achat ou de vente.
// ============================================================================
import type { CryptoAsset, WalletTransaction } from '../state/types';

// ============================================================================
// Export du type HoldingSummary qui résume les positions d'un utilisateur.
// 'export type' rend ce type disponible pour l'importation externe.
// Ce type agrège les transactions pour calculer la position nette.
// ============================================================================
export type HoldingSummary = {
  // cryptoId identifie la cryptomonnaie concernée.
  cryptoId: string;
  // quantity est la quantité totale détenue après toutes les transactions.
  quantity: number;
  // costBasis est le coût total d'acquisition des cryptos détenues.
  costBasis: number;
  // averagePrice est le prix moyen d'achat par unité.
  averagePrice: number;
  // lastTransactionAt est la date de la dernière transaction.
  lastTransactionAt: string;
};

// ============================================================================
// Export du type HoldingWithValue qui étend HoldingSummary avec les valeurs actuelles.
// Le symbole & crée un type intersection combinant HoldingSummary et les nouvelles propriétés.
// Ce type ajoute les calculs de valeur et profit/perte basés sur les prix actuels.
// ============================================================================
export type HoldingWithValue = HoldingSummary & {
  // currentPrice est le prix actuel de la cryptomonnaie.
  currentPrice: number;
  // currentValue est la valeur totale actuelle (quantity * currentPrice).
  currentValue: number;
  // profitLoss est la différence entre currentValue et costBasis.
  profitLoss: number;
};

// ============================================================================
// Fonction summarizeHoldings qui calcule les positions à partir des transactions.
// 'export function' exporte la fonction pour utilisation externe.
// Cette fonction agrège les achats et ventes pour obtenir la position nette.
// transactions est le tableau de toutes les transactions à analyser.
// ============================================================================
export function summarizeHoldings(transactions: WalletTransaction[]): Record<string, HoldingSummary> {
  // Tri des transactions par date chronologique pour traitement FIFO.
  // [...transactions] crée une copie pour ne pas modifier l'original.
  // sort avec une fonction de comparaison ordonne par timestamp.
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  // Objet pour stocker les résumés par cryptoId.
  // Record<string, HoldingSummary> type un objet avec clés string et valeurs HoldingSummary.
  const summaries: Record<string, HoldingSummary> = {};

  // forEach itère sur chaque transaction triée.
  sorted.forEach((transaction) => {
    const { cryptoId, type, quantity, pricePerUnit, timestamp } = transaction;

    if (!summaries[cryptoId]) {
      summaries[cryptoId] = {
        cryptoId,
        quantity: 0,
        costBasis: 0,
        averagePrice: 0,
        lastTransactionAt: timestamp,
      };
    }

    const summary = summaries[cryptoId];

    if (type === 'buy') {
      summary.costBasis += quantity * pricePerUnit;
      summary.quantity += quantity;
    } else {
      // For sales, we reduce the Cost Basis proportionally
      // This ensures the Average Price remains exactly constant for the remaining tokens
      const remainingQuantity = summary.quantity;
      if (remainingQuantity > 0) {
        const fractionRemaining = (remainingQuantity - quantity) / remainingQuantity;
        summary.costBasis = summary.costBasis * fractionRemaining;
      }
      summary.quantity -= quantity;
    }

    // Update last transaction time
    summary.lastTransactionAt = timestamp;
  });

  // Final cleanup and rounding pass
  Object.values(summaries).forEach((summary) => {
    // Avoid negative zero or tiny floating point residuals
    if (summary.quantity <= 0.00000001) {
      summary.quantity = 0;
      summary.costBasis = 0;
      summary.averagePrice = 0;
    } else {
      // Standardize precision at the end
      // 8 decimals for crypto quantity
      summary.quantity = Number(summary.quantity.toFixed(8));
      // Cost basis might have more decimals internally, but cost basis is money. 
      // Keep generous precision for basis to allow accurate avg price for small holdings.
      // Use max(0) to prevent negative basis
      summary.costBasis = Math.max(0, summary.costBasis);
      
      // Calculate Average Price based on final aggregates
      summary.averagePrice = summary.quantity > 0 
        ? summary.costBasis / summary.quantity 
        : 0;
    }
  });

  return summaries;
}

// ============================================================================
// Fonction enrichHoldingsWithPrices qui ajoute les valeurs actuelles aux positions.
// holdings est l'objet des positions calculées par summarizeHoldings.
// cryptoAssets contient les prix actuels des cryptomonnaies.
// Retourne un tableau de HoldingWithValue avec les calculs de P&L.
// ============================================================================
export function enrichHoldingsWithPrices(
  holdings: Record<string, HoldingSummary>,
  cryptoAssets: Record<string, CryptoAsset>,
): HoldingWithValue[] {
  // Object.values convertit l'objet en tableau de ses valeurs.
  return Object.values(holdings)
    // filter garde uniquement les positions non vides.
    .filter((holding) => holding.quantity > 0 || holding.costBasis > 0)
    // map transforme chaque HoldingSummary en HoldingWithValue.
    .map((holding) => {
      // Récupération de l'actif crypto correspondant.
      const asset = cryptoAssets[holding.cryptoId];
      // .at(-1) récupère le dernier élément de l'historique (prix actuel).
      // ?? 0 fournit une valeur par défaut si non trouvé.
      const currentPrice = asset?.history.at(-1)?.value ?? 0;
      // Calcul de la valeur actuelle avec arrondi à 2 décimales.
      const currentValue = Number((currentPrice * holding.quantity).toFixed(2));
      // Calcul du profit/perte = valeur actuelle - coût d'acquisition.
      const profitLoss = Number((currentValue - holding.costBasis).toFixed(2));

      // Retourne l'objet enrichi avec les nouvelles propriétés.
      return {
        ...holding,
        currentPrice,
        currentValue,
        profitLoss,
      };
    });
}

// ============================================================================
// Fonction calculatePortfolioValue qui calcule les totaux du portefeuille.
// holdings est le tableau des positions enrichies avec valeurs actuelles.
// cashBalance est le solde en euros du client.
// Retourne un objet avec invested, marketValue, profitLoss, totalBalance.
// ============================================================================
export function calculatePortfolioValue(
  holdings: HoldingWithValue[],
  cashBalance: number,
): { invested: number; marketValue: number; profitLoss: number; totalBalance: number } {
  // reduce accumule le costBasis de toutes les positions.
  const invested = holdings.reduce((acc, holding) => acc + holding.costBasis, 0);
  // reduce accumule la valeur actuelle de toutes les positions.
  const marketValue = holdings.reduce((acc, holding) => acc + holding.currentValue, 0);
  // profitLoss est la différence entre valeur de marché et montant investi.
  const profitLoss = Number((marketValue - invested).toFixed(2));
  // totalBalance inclut les cryptos et le cash disponible.
  const totalBalance = Number((marketValue + cashBalance).toFixed(2));

  return {
    invested: Number(invested.toFixed(2)),
    marketValue: Number(marketValue.toFixed(2)),
    profitLoss,
    totalBalance,
  };
}

// ============================================================================
// Fonction getAvailableQuantity qui retourne la quantité disponible d'une crypto.
// transactions est le tableau de toutes les transactions du client.
// cryptoId identifie la cryptomonnaie dont on veut la quantité.
// Utilisée pour valider si une vente est possible.
// ============================================================================
export function getAvailableQuantity(transactions: WalletTransaction[], cryptoId: string): number {
  // summarizeHoldings calcule les positions à partir des transactions.
  const holdings = summarizeHoldings(transactions);
  // Retourne la quantité pour cette crypto, ou 0 si non trouvée.
  // ?? 0 est l'opérateur de coalescence nulle (retourne 0 si undefined).
  return holdings[cryptoId]?.quantity ?? 0;
}

