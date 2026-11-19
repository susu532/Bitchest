import type { CryptoPricePoint } from '../state/types';
import { CRYPTO_VOLATILITY, DEFAULT_VOLATILITY, MIN_PRICE } from '../constants/cryptoVolatility';

const MODULUS = 2_147_483_647;
const MULTIPLIER = 48_271;

function lcg(seed: number): () => number {
  let state = seed % MODULUS;
  return () => {
    state = (state * MULTIPLIER) % MODULUS;
    return (state - 1) / (MODULUS - 1);
  };
}

function stringToSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) % MODULUS;
  }
  return hash + MODULUS / 3;
}

/**
 * Generates a realistic, deterministic 30-day price history ending today at basePrice.
 * Ensures the final point corresponds to today with value === basePrice.
 */
export function generate30DayHistory(cryptoId: string, basePrice: number): CryptoPricePoint[] {
  const volatility = CRYPTO_VOLATILITY[cryptoId] ?? DEFAULT_VOLATILITY;
  const rand = lcg(stringToSeed(cryptoId) + 1337);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Walk backwards from basePrice (today) to 29 days ago
  const prices = new Array<number>(30);
  prices[29] = basePrice;

  for (let i = 28; i >= 0; i -= 1) {
    const dailyChange = (rand() * 2 - 1) * volatility;
    prices[i] = Math.max(MIN_PRICE, prices[i + 1] / (1 + dailyChange));
  }

  const history: CryptoPricePoint[] = [];
  for (let i = 0; i < 30; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - (29 - i));
    history.push({
      date: date.toISOString(),
      value: Number(prices[i].toFixed(2)),
    });
  }

  return history;
}

/**
 * Merges historical price data with current price and real-time updates:
 * - Deduplicates entries by calendar day (YYYY-MM-DD), avoiding zig-zag loops
 * - If historical data is missing or incomplete (< 20 days), fills baseline with generate30DayHistory
 * - Guarantees today's point matches currentPrice
 * - Strictly sorts chronologically ascending
 * - Constrains to the last 30 daily points
 */
export function generateFullHistoryWithCurrent(
  cryptoId: string,
  currentPrice: number,
  existingHistory: CryptoPricePoint[] = []
): CryptoPricePoint[] {
  const byDate = new Map<string, CryptoPricePoint>();

  // If existing history has fewer than 20 days, pre-populate with synthetic 30-day baseline
  if (!existingHistory || existingHistory.length < 20) {
    const baseline = generate30DayHistory(cryptoId, currentPrice > 0 ? currentPrice : 100);
    for (const point of baseline) {
      const key = point.date.split('T')[0];
      byDate.set(key, point);
    }
  }

  // Merge existing historical points (overriding baseline for matching dates)
  if (existingHistory && existingHistory.length > 0) {
    for (const point of existingHistory) {
      if (point && point.date && typeof point.value === 'number') {
        const key = point.date.split('T')[0];
        byDate.set(key, point);
      }
    }
  }

  // Ensure today's date exists and has currentPrice if available
  const todayKey = new Date().toISOString().split('T')[0];
  if (currentPrice && currentPrice > 0) {
    const existingToday = byDate.get(todayKey);
    byDate.set(todayKey, {
      date: existingToday ? existingToday.date : new Date().toISOString(),
      value: Number(currentPrice.toFixed(2)),
    });
  }

  // Sort strictly by date ascending
  const sorted = Array.from(byDate.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Return strictly the last 30 days
  return sorted.slice(-30);
}
