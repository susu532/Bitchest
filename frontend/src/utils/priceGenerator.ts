// Importe la liste des cryptomonnaies supportées
import { CRYPTOCURRENCIES } from '../constants/cryptocurrencies';
// Importe les types pour CryptoAsset et CryptoPricePoint
import type { CryptoAsset, CryptoPricePoint } from '../state/types';

// Type pour un générateur de nombres aléatoires
type RandomGenerator = () => number;

// Constante modulo pour le générateur de nombres pseudo-aléatoires linéaire congruentiel
const MODULUS = 2_147_483_647;
// Multiplicateur pour le générateur de nombres pseudo-aléatoires
const MULTIPLIER = 48_271;

// Générateur de nombres pseudo-aléatoires linéaire congruentiel (LCG)
// Produit une séquence pseudo-aléatoire reproductible basée sur une graine
function lcg(seed: number): RandomGenerator {
  // État interne du générateur
  let state = seed % MODULUS;

  // Retourne une fonction qui génère le prochain nombre aléatoire
  return () => {
    // Calcule le prochain état en utilisant la formule LCG
    state = (state * MULTIPLIER) % MODULUS;
    // Retourne un nombre normalisé entre 0 et 1
    return (state - 1) / (MODULUS - 1);
  };
}

// Convertit une chaîne de caractères en graine numérique pour le LCG
function stringToSeed(input: string): number {
  // Initialise le hash à 0
  let hash = 0;
  // Parcourt chaque caractère de la chaîne
  for (let i = 0; i < input.length; i += 1) {
    // Combine le hash précédent avec le code du caractère actuel
    hash = (hash * 31 + input.charCodeAt(i)) % MODULUS;
  }

  // Retourne la graine (décalée pour plus de variation)
  return hash + MODULUS / 3;
}

// Génère le prix de cotation initial basé sur le nom de la cryptomonnaie
function getFirstCotation(name: string, random: RandomGenerator): number {
  // Récupère le code caractère du premier caractère du nom
  const base = name.charCodeAt(0);
  // Génère une variation aléatoire entre 0 et 10
  const variation = Math.floor(random() * 11);
  // Retourne le prix initial calculé
  return (base + variation) * 450;
}

// Calcule la variation quotidienne en pourcentage du prix
function getDailyVariationPercent(name: string, random: RandomGenerator): number {
  // Détermine aléatoirement si la variation est positive (>0.41) ou négative
  const positive = random() > 0.41;
  // Décide aléatoirement d'utiliser le premier ou le dernier caractère du nom
  const useFirstLetter = random() > 0.5;
  // Sélectionne le code caractère approprié
  const reference = useFirstLetter ? name.charCodeAt(0) : name.charCodeAt(name.length - 1);
  // Calcule un pourcentage aléatoire entre 0.01 et 0.10
  const percentage = (Math.floor(random() * 10) + 1) * 0.01;
  // Normalise le caractère de référence entre 0 et 1
  const normalized = reference / 255;
  // Calcule la variation finale en pourcentage
  const deltaPercent = percentage * normalized;
  // Retourne la variation (positive ou négative)
  return positive ? deltaPercent : -deltaPercent;
}

// Construit l'historique de prix sur 30 jours pour une cryptomonnaie
function buildHistory(name: string, seedOffset: number): CryptoPricePoint[] {
  // Crée un générateur aléatoire à partir du nom et offset
  const rand = lcg(stringToSeed(name) + seedOffset);
  // Nombre de jours dans l'historique
  const days = 30;
  // Obtient la date actuelle
  const today = new Date();
  // Tableau pour stocker les points d'historique
  const history: CryptoPricePoint[] = [];

  // Initialise le prix avec une valeur garantie d'au moins 5
  let currentValue = Math.max(5, getFirstCotation(name, rand));

  // Boucle sur les 30 jours en arrière
  for (let i = days - 1; i >= 0; i -= 1) {
    // Crée une nouvelle date pour ce jour
    const date = new Date(today);
    // Recule la date du nombre de jours nécessaire
    date.setDate(today.getDate() - i);

    // Si ce n'est pas le premier jour
    if (history.length > 0) {
      // Calcule la variation quotidienne
      const deltaPercent = getDailyVariationPercent(name, rand);
      // Applique la variation au prix actuel (minimum 25)
      currentValue = Math.max(25, currentValue * (1 + deltaPercent));
    }

    // Ajoute le point de prix à l'historique
    history.push({
      // Date au format ISO
      date: date.toISOString(),
      // Valeur du prix arrondie à 2 décimales
      value: Number(currentValue.toFixed(2)),
    });
  }

  // Retourne l'historique de 30 jours
  return history;
}

// Génère tous les actifs cryptographiques avec historique de prix
export function generateCryptoAssets(): Record<string, CryptoAsset> {
  // Objet pour stocker tous les actifs
  const assets: Record<string, CryptoAsset> = {};
  // Graine de base basée sur le 1er janvier de l'année courante
  const baseSeed = Date.UTC(new Date().getFullYear(), 0, 1);

  // Parcourt chaque cryptomonnaie définie
  CRYPTOCURRENCIES.forEach((crypto, index) => {
    // Construit l'historique de prix pour cette cryptomonnaie
    const history = buildHistory(crypto.name, baseSeed + index * 97);
    // Récupère le prix actuel (dernier prix de l'historique)
    const currentPrice = history.length > 0 ? history[history.length - 1].value : 0;
    // Crée l'actif complet
    assets[crypto.id] = {
      // ID de la cryptomonnaie
      id: crypto.id,
      // Nom complet
      name: crypto.name,
      // Symbole d'échange
      symbol: crypto.symbol,
      // Chemin vers l'icône
      icon: crypto.icon,
      // Prix actuel
      currentPrice,
      // Historique de 30 jours
      history,
    };
  });

  // Retourne tous les actifs générés
  return assets;
}

