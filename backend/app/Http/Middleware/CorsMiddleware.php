<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CorsMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): mixed
    {
        // Get the origin from request headers
        $origin = $request->header('Origin');
        $allowed_origins = [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://192.168.1.231:3000',
        ];

        // If no origin is provided or it's in allowed list, allow it
        $is_origin_allowed = empty($origin) || in_array($origin, $allowed_origins);
        $response_origin = ($is_origin_allowed && !empty($origin)) ? $origin : 'http://localhost:3000';

        // Handle preflight requests BEFORE authentication
        if ($request->getMethod() === 'OPTIONS') {
            return response('', 200)
                ->header('Access-Control-Allow-Origin', $response_origin)
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept')
                ->header('Access-Control-Allow-Credentials', 'true')
                ->header('Access-Control-Max-Age', '86400')
                ->header('Content-Type', 'text/plain');
        }

        $response = $next($request);

        // Add CORS headers to all responses
        $response->header('Access-Control-Allow-Origin', $response_origin);
        $response->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        $response->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
        $response->header('Access-Control-Allow-Credentials', 'true');
        $response->header('Access-Control-Expose-Headers', 'Content-Length, X-JSON-Response');
        $response->header('Access-Control-Max-Age', '86400');

        return $response;
    }
}
