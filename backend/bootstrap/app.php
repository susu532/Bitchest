<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {

        $middleware->use([
            \App\Http\Middleware\CorsMiddleware::class,
        ]);
        
        $middleware->trustProxies(at: '*');
        $middleware->statefulApi();
        

        $middleware->validateCsrfTokens(except: [
            'auth/login',
            'auth/logout',
            'auth/change-password',
            'auth/me',
            'user/profile',
            'users',
            'users/*',
            'clients',
            'clients/*',
            'cryptocurrencies',
            'cryptocurrencies/*',
            'wallet/buy',
            'wallet/sell',
            'wallet/summary',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {

        $exceptions->render(function (\App\Exceptions\InsufficientBalanceException $e) {
            \Illuminate\Support\Facades\Log::warning('Insufficient balance exception', [
                'message' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error_type' => 'insufficient_balance'
            ], 400);
        });
        

        $exceptions->render(function (\App\Exceptions\InsufficientCryptoHoldingsException $e) {
            \Illuminate\Support\Facades\Log::warning('Insufficient crypto holdings exception', [
                'message' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error_type' => 'insufficient_holdings'
            ], 400);
        });
        

        $exceptions->render(function (\App\Exceptions\InvalidTransactionException $e) {
            \Illuminate\Support\Facades\Log::warning('Invalid transaction exception', [
                'message' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error_type' => 'invalid_transaction'
            ], 400);
        });
    })->create();
