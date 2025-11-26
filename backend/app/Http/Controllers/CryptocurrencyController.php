<?php

// Espace de noms pour organiser les contrôleurs HTTP
namespace App\Http\Controllers;

// Importe le modèle Cryptocurrency pour accéder aux données des cryptos
use App\Models\Cryptocurrency;
// Importe le modèle CryptoPrice pour accéder à l'historique des prix
use App\Models\CryptoPrice;
// Importe la classe Request pour gérer les requêtes HTTP
use Illuminate\Http\Request;

// Classe contrôleur qui gère tous les endpoints liés aux cryptomonnaies
class CryptocurrencyController extends Controller
{
    /**
     * Récupère TOUTES les cryptomonnaies avec leurs prix actuels et historique
     * Endpoint: GET /cryptocurrencies
     * Authentification: Requise
     */
    public function getAllCryptos()
    {
        // Vérifie si l'utilisateur est authentifié (session valide)
        if (!auth()->check()) {
            // Retourne une erreur 401 si l'utilisateur n'est pas connecté
            return response()->json(['success' => false, 'message' => 'Not authenticated'], 401);
        }

        // Récupère TOUTES les cryptomonnaies avec leurs relations de prix (eager loading)
        $cryptos = Cryptocurrency::with('prices')->get();

        // Retourne la réponse JSON structurée
        return response()->json([
            // Flag de succès pour indiquer que la requête a réussi
            'success' => true,
            // Transforme les cryptos en un tableau associatif avec l'ID comme clé
            'cryptoAssets' => $cryptos->mapWithKeys(function ($crypto) {
                // Mappe chaque prix à un format avec date et valeur
                $prices = $crypto->prices->map(fn($p) => [
                    // Convertit la date de prix en format ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)
                    'date' => $p->price_date->toIso8601String(),
                    // Convertit le prix en float pour éviter les problèmes de précision
                    'value' => (float) $p->price,
                ])->toArray();
                
                // Initialise le prix actuel à 0
                $currentPrice = 0;
                // Vérifie que le tableau de prix n'est pas vide
                if (!empty($prices)) {
                    // Récupère le DERNIER prix du tableau (le plus récent)
                    $currentPrice = $prices[array_key_last($prices)]['value'];
                }
                
                // Retourne le crypto avec tous ses détails formatés
                return [
                    // Utilise l'ID comme clé du tableau associatif
                    $crypto->id => [
                        // ID unique de la cryptomonnaie
                        'id' => $crypto->id,
                        // Nom complet (ex: Bitcoin)
                        'name' => $crypto->name,
                        // Symbole de trading (ex: BTC)
                        'symbol' => $crypto->symbol,
                        // URL/chemin vers l'icône
                        'icon' => $crypto->icon,
                        // Prix actuel le plus récent
                        'currentPrice' => $currentPrice,
                        // Historique complet des 30 derniers jours
                        'history' => $prices,
                    ]
                ];
            })->toArray(),
        ]);
    }

    /**
     * Récupère une cryptomonnaie spécifique avec tous ses prix historiques
     * Endpoint: GET /cryptocurrencies/{cryptoId}
     * Authentification: Requise
     * Paramètre: cryptoId (string) - Identifiant de la crypto (ex: 'BTC')
     */
    public function getCryptoWithHistory($cryptoId)
    {
        // Vérifie si l'utilisateur est authentifié
        if (!auth()->check()) {
            // Retourne erreur 401 si non authentifié
            return response()->json(['success' => false, 'message' => 'Not authenticated'], 401);
        }

        // Cherche la cryptomonnaie par ID et charge ses prix associés
        // findOrFail() lance une exception 404 si non trouvé (gestion automatique d'erreur)
        $crypto = Cryptocurrency::with('prices')->findOrFail($cryptoId);
        
        // Mappe les prix vers le format JSON avec date ISO et valeur numérique
        $prices = $crypto->prices->map(fn($p) => [
            // Formate la date en ISO 8601
            'date' => $p->price_date->toIso8601String(),
            // Convertit en float
            'value' => (float) $p->price,
        ])->toArray();
        
        // Initialise le prix actuel à 0
        $currentPrice = 0;
        // Vérifie que le tableau n'est pas vide
        if (!empty($prices)) {
            // Récupère le DERNIER prix (le plus récent)
            $currentPrice = $prices[array_key_last($prices)]['value'];
        }

        // Retourne la réponse JSON avec les détails complets de la crypto
        return response()->json([
            // Flag de succès
            'success' => true,
            // Détails de la cryptomonnaie
            'crypto' => [
                // ID unique
                'id' => $crypto->id,
                // Nom complet
                'name' => $crypto->name,
                // Symbole de trading
                'symbol' => $crypto->symbol,
                // URL/chemin de l'icône
                'icon' => $crypto->icon,
                // Prix actuel le plus récent
                'currentPrice' => $currentPrice,
                // Historique complet de 30 jours
                'history' => $prices,
            ]
        ]);
    }

    /**
     * Récupère UNIQUEMENT le prix actuel d'une cryptomonnaie
     * Endpoint: GET /cryptocurrencies/{cryptoId}/price
     * Authentification: Requise
     * Paramètre: cryptoId (string) - Identifiant de la crypto
     */
    public function getCurrentPrice($cryptoId)
    {
        // Vérifie si l'utilisateur est authentifié
        if (!auth()->check()) {
            // Retourne erreur 401 si non authentifié
            return response()->json(['success' => false, 'message' => 'Not authenticated'], 401);
        }

        // Cherche le prix le plus RÉCENT pour la cryptomonnaie donnée
        $latestPrice = CryptoPrice::where('crypto_id', $cryptoId)
            // Trie par date de prix en ordre décroissant (du plus récent au plus ancien)
            ->orderBy('price_date', 'desc')
            // Récupère uniquement le PREMIER résultat (le plus récent)
            ->first();

        // Vérifie si un prix existe pour cette cryptomonnaie
        if (!$latestPrice) {
            // Retourne une erreur 404 si aucun prix trouvé
            return response()->json(['success' => false, 'message' => 'No price data'], 404);
        }

        // Retourne la réponse JSON avec le prix actuel
        return response()->json([
            // Flag de succès
            'success' => true,
            // Le prix le plus récent, converti en float
            'currentPrice' => (float) $latestPrice->price,
            // La date du prix en format ISO 8601
            'date' => $latestPrice->price_date->toIso8601String(),
        ]);
    }
}
