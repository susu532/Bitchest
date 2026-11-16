<?php

return [

    'paths' => ['*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_filter(array_merge(
        ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:8000', 'http://127.0.0.1:8000'],
        explode(',', env('FRONTEND_URL', ''))
    ))),

    'allowed_origins_patterns' => [
        '#^https://.*\.vercel\.app$#',
    ],

    'allowed_headers' => ['*', 'x-xsrf-token', 'X-XSRF-TOKEN', 'Authorization', 'Content-Type', 'Accept', 'X-Requested-With'],

    'exposed_headers' => ['Content-Length', 'X-JSON-Response', 'Set-Cookie'],

    'max_age' => 86400,

    'supports_credentials' => true,

];
