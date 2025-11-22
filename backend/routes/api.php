<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\CryptoController;
use App\Http\Controllers\Client\WalletController;
use App\Http\Controllers\UserController;

Route::middleware('api')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

    // Public: list cryptos and current prices
    Route::get('cryptos', [CryptoController::class, 'index']);
    Route::get('cryptos/{id}', [CryptoController::class, 'show']);
    Route::get('cryptos/{id}/history', [CryptoController::class, 'history']);

    // Authenticated actions
    Route::middleware('auth:sanctum')->group(function () {
        // user
        Route::get('me', [UserController::class, 'me']);
        Route::put('me', [UserController::class, 'update']);
        Route::put('me/password', [UserController::class, 'updatePassword']);

        // Client endpoints
        Route::get('wallet', [WalletController::class, 'index']);
        Route::post('wallet/buy', [WalletController::class, 'buy']);
        Route::post('wallet/sell', [WalletController::class, 'sell']);

        // Admin endpoints
        Route::middleware('admin')->prefix('admin')->group(function () {
            Route::apiResource('users', AdminUserController::class);
        });
    });
});
