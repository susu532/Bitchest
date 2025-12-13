<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\CryptocurrencyController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\NotificationController;
use Illuminate\Broadcasting\BroadcastController;

Route::post('/broadcasting/auth', [BroadcastController::class, 'authenticate']);

Route::post('/auth/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1');

Route::middleware(['auth:web', 'throttle:60,1'])->group(function () {
    

    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);

    Route::post('/user/profile', [UserController::class, 'updateProfile']);

    Route::get('/users', [UserController::class, 'getAllUsers']);

    Route::post('/clients', [ClientController::class, 'createClient']);

    Route::put('/clients/{userId}', [ClientController::class, 'updateClient']);

    Route::delete('/clients/{userId}', [ClientController::class, 'deleteClient']);

    Route::get('/clients/account/mine', [ClientController::class, 'getClientAccount']);

    Route::get('/cryptocurrencies', [CryptocurrencyController::class, 'getAllCryptos']);

    Route::get('/cryptocurrencies/{cryptoId}', [CryptocurrencyController::class, 'getCryptoWithHistory']);

    Route::get('/cryptocurrencies/{cryptoId}/price', [CryptocurrencyController::class, 'getCurrentPrice']);

    Route::post('/wallet/buy', [WalletController::class, 'buyCryptocurrency']);

    Route::post('/wallet/sell', [WalletController::class, 'sellCryptocurrency']);

    Route::get('/wallet/summary', [WalletController::class, 'getWalletSummary']);

    // Notification routes
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications', [NotificationController::class, 'store']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::delete('/notifications/read', [NotificationController::class, 'deleteRead']);
});
