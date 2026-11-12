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

export function generate30DayHistory(cryptoId: string, basePrice: number): CryptoPricePoint[] {
  const volatility = CRYPTO_VOLATILITY[cryptoId] ?? DEFAULT_VOLATILITY;
  const rand = lcg(stringToSeed(cryptoId) + 1337);
  
  const history: CryptoPricePoint[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let currentPrice = basePrice;
  
  for (let i = 29; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i - 1);
    
    if (i < 29) {
      const dailyChange = (rand() * 2 - 1) * volatility;
      currentPrice = Math.max(MIN_PRICE, currentPrice * (1 + dailyChange));
    }
    
    history.push({
      date: date.toISOString(),
      value: Number(currentPrice.toFixed(2)),
    });
  }
  
  return history;
}

export function generateFullHistoryWithCurrent(
  cryptoId: string,
  currentPrice: number,
  currentDayHistory: CryptoPricePoint[]
): CryptoPricePoint[] {
  const pastHistory = generate30DayHistory(cryptoId, currentPrice);
  
  const lastPastDate = pastHistory[pastHistory.length - 1]?.date.split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];
  
  if (lastPastDate === todayStr) {
    pastHistory.pop();
  }
  
  return [...pastHistory, ...currentDayHistory];
}