
import { CRYPTOCURRENCIES } from '../constants/cryptocurrencies';

import type { CryptoAsset, CryptoPricePoint } from '../state/types';

type RandomGenerator = () => number;

const MODULUS = 2_147_483_647;

const MULTIPLIER = 48_271;

function lcg(seed: number): RandomGenerator {

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

function getFirstCotation(name: string, random: RandomGenerator): number {

  const base = name.charCodeAt(0);

  const variation = Math.floor(random() * 11);

  return (base + variation) * 450;
}

function getDailyVariationPercent(name: string, random: RandomGenerator): number {

  const positive = random() > 0.41;

  const useFirstLetter = random() > 0.5;

  const reference = useFirstLetter ? name.charCodeAt(0) : name.charCodeAt(name.length - 1);

  const percentage = (Math.floor(random() * 10) + 1) * 0.01;

  const normalized = reference / 255;

  const deltaPercent = percentage * normalized;

  return positive ? deltaPercent : -deltaPercent;
}

function buildHistory(name: string, seedOffset: number): CryptoPricePoint[] {

  const rand = lcg(stringToSeed(name) + seedOffset);

  const days = 30;

  const today = new Date();

  const history: CryptoPricePoint[] = [];

  let currentValue = Math.max(5, getFirstCotation(name, rand));

  for (let i = days - 1; i >= 0; i -= 1) {

    const date = new Date(today);

    date.setDate(today.getDate() - i);

    if (history.length > 0) {

      const deltaPercent = getDailyVariationPercent(name, rand);

      currentValue = Math.max(25, currentValue * (1 + deltaPercent));
    }

    history.push({

      date: date.toISOString(),

      value: Number(currentValue.toFixed(2)),
    });
  }

  return history;
}

export function generateCryptoAssets(): Record<string, CryptoAsset> {

  const assets: Record<string, CryptoAsset> = {};

  const baseSeed = Date.UTC(new Date().getFullYear(), 0, 1);

  CRYPTOCURRENCIES.forEach((crypto, index) => {

    const history = buildHistory(crypto.name, baseSeed + index * 97);

    const currentPrice = history.length > 0 ? history[history.length - 1].value : 0;

    assets[crypto.id] = {

      id: crypto.id,

      name: crypto.name,

      symbol: crypto.symbol,

      icon: crypto.icon,

      currentPrice,

      history,
    };
  });

  return assets;
}

