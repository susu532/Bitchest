<?php

use Laravel\Sanctum\Sanctum;

// Configuration mta3 Laravel Sanctum lel authentification SPA w API tokens
return [

    // Les domaines stateful eli ya9blou les cookies mta3 session
    'stateful' => array_values(array_filter(array_merge(
        explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
            '%s%s',
            'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
            Sanctum::currentApplicationUrlWithPort(),
        ))),
        [parse_url(env('FRONTEND_URL', ''), PHP_URL_HOST)]
    ))),

    // Guards w expiration mta3 les tokens
    'guard' => ['web'],

    'expiration' => null,

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    // Middleware mta3 Sanctum bech yverifi el requests eli jaya mel frontend
    'middleware' => [
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies' => Illuminate\Cookie\Middleware\EncryptCookies::class,
        'validate_csrf_token' => Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
    ],

];
