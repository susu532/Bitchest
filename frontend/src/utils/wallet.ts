
import type { CryptoAsset, WalletTransaction } from '../state/types';

export type HoldingSummary = {

  cryptoId: string;

  quantity: number;

  costBasis: number;

  averagePrice: number;

  lastTransactionAt: string;
};

export type HoldingWithValue = HoldingSummary & {

  currentPrice: number;

  currentValue: number;

  profitLoss: number;
};

export function summarizeHoldings(transactions: WalletTransaction[]): Record<string, HoldingSummary> {

  const sorted = [...transactions].sort(

    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const summaries: Record<string, HoldingSummary> = {};

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

      const remainingQuantity = summary.quantity;

      if (remainingQuantity > 0) {

        const averageCost = summary.costBasis / remainingQuantity;

        summary.costBasis -= averageCost * quantity;
      }

      summary.quantity -= quantity;
    }

    summary.quantity = Number(summary.quantity.toFixed(8));

    summary.costBasis = Number(Math.max(summary.costBasis, 0).toFixed(2));

    summary.averagePrice = summary.quantity > 0 ? Number((summary.costBasis / summary.quantity).toFixed(8)) : 0;

    summary.lastTransactionAt = timestamp;

    if (summary.quantity <= 0.00000001) {

      summary.quantity = 0;

      summary.costBasis = 0;

      summary.averagePrice = 0;
    }
  });

  return summaries;
}

export function enrichHoldingsWithPrices(

  holdings: Record<string, HoldingSummary>,

  cryptoAssets: Record<string, CryptoAsset>,
): HoldingWithValue[] {

  return Object.values(holdings)

    .filter((holding) => holding.quantity > 0 || holding.costBasis > 0)

    .map((holding) => {

      const asset = cryptoAssets[holding.cryptoId];

      const currentPrice = asset?.history.at(-1)?.value ?? 0;

      const currentValue = Number((currentPrice * holding.quantity).toFixed(2));

      const profitLoss = Number((currentValue - holding.costBasis).toFixed(2));

      return {

        ...holding,

        currentPrice,

        currentValue,

        profitLoss,
      };
    });
}

export function calculatePortfolioValue(

  holdings: HoldingWithValue[],

  cashBalance: number,
): { invested: number; marketValue: number; profitLoss: number; totalBalance: number } {

  const invested = holdings.reduce((acc, holding) => acc + holding.costBasis, 0);

  const marketValue = holdings.reduce((acc, holding) => acc + holding.currentValue, 0);

  const profitLoss = Number((marketValue - invested).toFixed(2));

  const totalBalance = Number((marketValue + cashBalance).toFixed(2));

  return {

    invested: Number(invested.toFixed(2)),

    marketValue: Number(marketValue.toFixed(2)),

    profitLoss,

    totalBalance,
  };
}

export function getAvailableQuantity(transactions: WalletTransaction[], cryptoId: string): number {

  const holdings = summarizeHoldings(transactions);

  return holdings[cryptoId]?.quantity ?? 0;
}

