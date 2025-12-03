<?php

return [

    

    'paths' => ['*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://192.168.1.231:3000'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['Content-Length', 'X-JSON-Response'],

    'max_age' => 0,

    'supports_credentials' => true,

];
