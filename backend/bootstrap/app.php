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
        // Add CORS middleware first - this runs before everything else
        $middleware->use([
            \App\Http\Middleware\CorsMiddleware::class,
        ]);
        
        $middleware->trustProxies(at: '*');
        $middleware->statefulApi();
        
        // Disable CSRF for API routes (they're protected by auth)
        $middleware->validateCsrfTokens(except: [
            '/auth/*',
            '/api/*',
            '/cryptocurrencies/*',
            '/clients/*',
            '/users/*',
            '/wallet/*',
            '/user/*',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
