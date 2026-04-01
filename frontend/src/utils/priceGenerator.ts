
// ============================================================================
// Import des données de cryptomonnaies depuis les constantes.
// CRYPTOCURRENCIES contient la liste des cryptos avec leurs infos de base.
// Ces données servent de base pour générer les actifs avec historique.
// ============================================================================
import { CRYPTOCURRENCIES } from '../constants/cryptocurrencies';

// ============================================================================
// Import des types pour typer les structures de données.
// CryptoAsset représente une crypto complète avec historique.
// CryptoPricePoint représente un point de prix à une date donnée.
// ============================================================================
import type { CryptoAsset, CryptoPricePoint } from '../state/types';

// ============================================================================
// Type pour la fonction génératrice de nombres aléatoires.
// () => number définit une fonction sans paramètre retournant un nombre.
// Ce type est utilisé pour le générateur LCG.
// ============================================================================
type RandomGenerator = () => number;

// ============================================================================
// Constantes pour le générateur congruentiel linéaire (LCG).
// MODULUS est le modulo utilisé pour limiter les valeurs.
// 2_147_483_647 est 2^31 - 1, un nombre premier de Mersenne.
// ============================================================================
const MODULUS = 2_147_483_647;

// ============================================================================
// Multiplicateur pour le générateur LCG.
// 48_271 est un multiplicateur éprouvé pour ce type de générateur.
// ============================================================================
const MULTIPLIER = 48_271;

// ============================================================================
// Fonction créant un générateur de nombres pseudo-aléatoires LCG.
// LCG = Linear Congruential Generator (générateur congruentiel linéaire).
// seed est la graine initiale déterminant la séquence de nombres.
// ============================================================================
function lcg(seed: number): RandomGenerator {
  // Variable d'état qui évolue à chaque appel.
  // % MODULUS limite la valeur dans la plage acceptable.
  let state = seed % MODULUS;

  // Retourne une closure qui génère des nombres entre 0 et 1.
  return () => {
    // Formule LCG classique : state = (state * multiplier) % modulus.
    state = (state * MULTIPLIER) % MODULUS;
    // Normalise le résultat entre 0 et 1.
    return (state - 1) / (MODULUS - 1);
  };
}

// ============================================================================
// Fonction convertissant une chaîne en graine numérique.
// Cette fonction crée un hash simple à partir du nom de la crypto.
// La même chaîne produit toujours la même graine (déterministe).
// ============================================================================
function stringToSeed(input: string): number {
  let hash = 0;
  // Boucle sur chaque caractère de la chaîne.
  for (let i = 0; i < input.length; i += 1) {
    // Accumule le hash en utilisant le code ASCII du caractère.
    // * 31 est un facteur premier classique pour les hashes.
    hash = (hash * 31 + input.charCodeAt(i)) % MODULUS;
  }
  // Ajoute un offset pour éviter les valeurs proches de zéro.
  return hash + MODULUS / 3;
}

// ============================================================================
// Fonction calculant la première cotation d'une crypto.
// Le prix initial est basé sur le code ASCII de la première lettre.
// random apporte une variation aléatoire déterministe.
// ============================================================================
function getFirstCotation(name: string, random: RandomGenerator): number {
  // Code ASCII de la première lettre du nom.
  const base = name.charCodeAt(0);
  // Variation aléatoire entre 0 et 10.
  // Math.floor() arrondit vers le bas au nombre entier.
  const variation = Math.floor(random() * 11);
  // Prix calculé en multipliant par 450 pour des valeurs réalistes.
  return (base + variation) * 450;
}

// ============================================================================
// Fonction calculant la variation quotidienne en pourcentage.
// Cette fonction simule les fluctuations journalières du marché.
// Le résultat est un nombre entre environ -5% et +5%.
// ============================================================================
function getDailyVariationPercent(name: string, random: RandomGenerator): number {
  // Détermine si la variation est positive (59% de probabilité) ou négative.
  const positive = random() > 0.41;
  // Utilise soit la première soit la dernière lettre pour la variation.
  const useFirstLetter = random() > 0.5;
  // Code ASCII de la lettre de référence.
  const reference = useFirstLetter ? name.charCodeAt(0) : name.charCodeAt(name.length - 1);
  // Pourcentage de base entre 1% et 10%.
  const percentage = (Math.floor(random() * 10) + 1) * 0.01;
  // Normalise la référence entre 0 et 1 (code ASCII max ~255).
  const normalized = reference / 255;
  // Variation finale ajustée.
  const deltaPercent = percentage * normalized;
  // Retourne positif ou négatif selon le tirage initial.
  return positive ? deltaPercent : -deltaPercent;
}

// ============================================================================
// Fonction construisant l'historique de prix sur 30 jours.
// name est le nom de la crypto pour la génération déterministe.
// seedOffset ajoute une variation entre les différentes cryptos.
// ============================================================================
function buildHistory(name: string, seedOffset: number): CryptoPricePoint[] {
  // Crée un générateur LCG avec une graine unique par crypto.
  const rand = lcg(stringToSeed(name) + seedOffset);
  // Nombre de jours d'historique à générer.
  const days = 30;
  // Date actuelle comme point de référence.
  const today = new Date();
  // Tableau pour stocker les points de prix.
  const history: CryptoPricePoint[] = [];
  // Prix initial (minimum 5€).
  // Math.max() retourne la plus grande des valeurs.
  let currentValue = Math.max(5, getFirstCotation(name, rand));

  // Boucle sur les 30 derniers jours.
  // i décrémente de days-1 jusqu'à 0 inclus.
  for (let i = days - 1; i >= 0; i -= 1) {
    // Crée une copie de la date actuelle.
    const date = new Date(today);
    // Soustrait i jours pour obtenir la date passée.
    date.setDate(today.getDate() - i);

    // Applique une variation sauf pour le premier jour.
    if (history.length > 0) {
      const deltaPercent = getDailyVariationPercent(name, rand);
      // Multiplie le prix par (1 + variation), minimum 25€.
      currentValue = Math.max(25, currentValue * (1 + deltaPercent));
    }

    // Ajoute le point de prix à l'historique.
    history.push({
      // Convertit la date en chaîne ISO 8601.
      date: date.toISOString(),
      // Arrondit le prix à 2 décimales.
      // Number() convertit la chaîne toFixed en nombre.
      value: Number(currentValue.toFixed(2)),
    });
  }

  return history;
}

// ============================================================================
// Fonction principale exportée pour générer tous les actifs crypto.
// Cette fonction crée un objet mappant les IDs aux objets CryptoAsset.
// Le résultat est déterministe basé sur l'année en cours.
// ============================================================================
export function generateCryptoAssets(): Record<string, CryptoAsset> {
  // Objet pour stocker les actifs par ID.
  const assets: Record<string, CryptoAsset> = {};
  // Graine de base fixe pour l'année en cours (1er janvier).
  // Date.UTC() retourne le timestamp en millisecondes.
  const baseSeed = Date.UTC(new Date().getFullYear(), 0, 1);

  // Génère un actif pour chaque crypto définie dans les constantes.
  // forEach itère avec l'index pour varier les graines.
  CRYPTOCURRENCIES.forEach((crypto, index) => {
    // Construit l'historique avec un offset unique par crypto.
    // * 97 (nombre premier) assure une bonne dispersion des graines.
    const history = buildHistory(crypto.name, baseSeed + index * 97);
    // Le prix actuel est le dernier point de l'historique.
    const currentPrice = history.length > 0 ? history[history.length - 1].value : 0;

    // Crée l'objet CryptoAsset complet.
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

