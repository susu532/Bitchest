<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\MeController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CryptoController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\CryptoPriceController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

// Public auth routes
Route::post('/login', [LoginController::class, 'login']);

// Protected routes
Route::middleware('auth:web')->group(function () {
    Route::post('/logout', [LogoutController::class, 'logout']);
    Route::get('/me', [MeController::class, 'me']);

    // User admin routes
    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::get('cryptocurrencies', [CryptoController::class, 'index']);
    });

    // User client routes
    Route::prefix('client')->middleware('client')->group(function () {
        Route::get('wallet', [WalletController::class, 'getWallet']);
        Route::post('transactions', [TransactionController::class, 'record']);
        Route::get('transactions', [TransactionController::class, 'index']);
        Route::get('cryptocurrencies', [CryptoController::class, 'index']);
        Route::get('cryptocurrencies/{id}/prices', [CryptoPriceController::class, 'priceHistory']);
    });

    // Shared routes for all authenticated users
    Route::put('profile', [ProfileController::class, 'update']);
    Route::post('password', [ProfileController::class, 'changePassword']);
    Route::get('cryptocurrencies', [CryptoController::class, 'index']);
});
