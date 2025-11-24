<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\CryptocurrencyController;
use App\Http\Controllers\WalletController;
use Illuminate\Broadcasting\BroadcastController;

// Broadcasting authentication route
Route::post('/broadcasting/auth', [BroadcastController::class, 'authenticate']);

// Authentication routes
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:web')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);

    // User routes
    Route::post('/user/profile', [UserController::class, 'updateProfile']);
    Route::get('/users', [UserController::class, 'getAllUsers']);

    // Client management routes (admin only)
    Route::post('/clients', [ClientController::class, 'createClient']);
    Route::put('/clients/{userId}', [ClientController::class, 'updateClient']);
    Route::delete('/clients/{userId}', [ClientController::class, 'deleteClient']);
    Route::get('/clients/account/mine', [ClientController::class, 'getClientAccount']);

    // Cryptocurrency routes
    Route::get('/cryptocurrencies', [CryptocurrencyController::class, 'getAllCryptos']);
    Route::get('/cryptocurrencies/{cryptoId}', [CryptocurrencyController::class, 'getCryptoWithHistory']);
    Route::get('/cryptocurrencies/{cryptoId}/price', [CryptocurrencyController::class, 'getCurrentPrice']);

    // Wallet routes (client only)
    Route::post('/wallet/buy', [WalletController::class, 'buyCryptocurrency']);
    Route::post('/wallet/sell', [WalletController::class, 'sellCryptocurrency']);
    Route::get('/wallet/summary', [WalletController::class, 'getWalletSummary']);
});
