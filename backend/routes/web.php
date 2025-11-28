<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\CryptocurrencyController;
use App\Http\Controllers\WalletController;
use Illuminate\Broadcasting\BroadcastController;

// Route pour l'authentification du broadcasting (WebSocket)
// Permet de sécuriser les canaux privés (private-channel)
Route::post('/broadcasting/auth', [BroadcastController::class, 'authenticate']);

// --- Routes d'Authentification ---

// Route pour la connexion utilisateur (Login) avec rate limiting
// Limite à 5 tentatives par minute pour éviter les attaques par force brute
// Endpoint public: permet aux utilisateurs de s'authentifier et de recevoir une session
Route::post('/auth/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1');

// Groupe de routes protégées par le middleware 'auth:web'
// Toutes les routes à l'intérieur de ce groupe nécessitent que l'utilisateur soit connecté
// Rate limiting: 60 requêtes par minute max pour éviter l'abus de l'API
Route::middleware(['auth:web', 'throttle:60,1'])->group(function () {
    
    // --- Routes Utilisateur Authentifié ---

    // Route pour récupérer les informations de l'utilisateur connecté (Session Check)
    // Utilisé par le frontend pour vérifier si la session est toujours active au chargement
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Route pour la déconnexion (Logout)
    // Invalide la session côté serveur
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Route pour changer le mot de passe
    // Permet à l'utilisateur connecté de modifier son mot de passe actuel
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);

    // Route pour mettre à jour le profil utilisateur
    // Permet de modifier nom, prénom, email
    Route::post('/user/profile', [UserController::class, 'updateProfile']);

    // --- Routes Administration ---

    // Route pour lister tous les utilisateurs
    // Réservé aux administrateurs pour voir la liste des clients et admins
    Route::get('/users', [UserController::class, 'getAllUsers']);

    // Route pour créer un nouveau client
    // Réservé aux administrateurs: crée un User + ClientAccount
    Route::post('/clients', [ClientController::class, 'createClient']);

    // Route pour mettre à jour un client existant
    // Réservé aux administrateurs: modifie les infos d'un client spécifique
    Route::put('/clients/{userId}', [ClientController::class, 'updateClient']);

    // Route pour supprimer un client
    // Réservé aux administrateurs: supprime User + ClientAccount + Transactions
    Route::delete('/clients/{userId}', [ClientController::class, 'deleteClient']);

    // --- Routes Client ---

    // Route pour récupérer le compte du client connecté
    // Retourne le solde et les transactions du client actuel
    Route::get('/clients/account/mine', [ClientController::class, 'getClientAccount']);

    // --- Routes Cryptomonnaies ---

    // Route pour lister toutes les cryptomonnaies
    // Retourne la liste des cryptos avec leur historique de prix (30 jours)
    Route::get('/cryptocurrencies', [CryptocurrencyController::class, 'getAllCryptos']);

    // Route pour voir les détails d'une crypto spécifique
    // Retourne les infos d'une crypto + son historique complet
    Route::get('/cryptocurrencies/{cryptoId}', [CryptocurrencyController::class, 'getCryptoWithHistory']);

    // Route pour obtenir le prix actuel d'une crypto
    // Retourne uniquement le dernier prix connu (léger et rapide)
    Route::get('/cryptocurrencies/{cryptoId}/price', [CryptocurrencyController::class, 'getCurrentPrice']);

    // --- Routes Portefeuille (Wallet) ---

    // Route pour acheter de la cryptomonnaie
    // Débite le compte EUR, crédite le wallet crypto, crée une transaction
    Route::post('/wallet/buy', [WalletController::class, 'buyCryptocurrency']);

    // Route pour vendre de la cryptomonnaie
    // Débite le wallet crypto, crédite le compte EUR, crée une transaction
    Route::post('/wallet/sell', [WalletController::class, 'sellCryptocurrency']);

    // Route pour obtenir le résumé du portefeuille
    // Calcule la valeur totale, les profits/pertes et la répartition des actifs
    Route::get('/wallet/summary', [WalletController::class, 'getWalletSummary']);
});
