<?php

namespace App\Http\Controllers;

use App\Models\Cryptocurrency;
use App\Models\CryptoPrice;
use Illuminate\Http\Request;

class CryptocurrencyController extends Controller
{
    public function getAllCryptos()
    {
        if (!auth()->check()) {
            return response()->json(['success' => false, 'message' => 'Not authenticated'], 401);
        }

        $cryptos = Cryptocurrency::with('prices')->get();

        return response()->json([
            'success' => true,
            'cryptoAssets' => $cryptos->mapWithKeys(function ($crypto) {
                return [
                    $crypto->id => [
                        'id' => $crypto->id,
                        'name' => $crypto->name,
                        'symbol' => $crypto->symbol,
                        'icon' => $crypto->icon,
                        'history' => $crypto->prices->map(fn($p) => [
                            'date' => $p->price_date->toIso8601String(),
                            'value' => (float) $p->price,
                        ])->toArray(),
                    ]
                ];
            })->toArray(),
        ]);
    }

    public function getCryptoWithHistory($cryptoId)
    {
        if (!auth()->check()) {
            return response()->json(['success' => false, 'message' => 'Not authenticated'], 401);
        }

        $crypto = Cryptocurrency::with('prices')->findOrFail($cryptoId);

        return response()->json([
            'success' => true,
            'crypto' => [
                'id' => $crypto->id,
                'name' => $crypto->name,
                'symbol' => $crypto->symbol,
                'icon' => $crypto->icon,
                'history' => $crypto->prices->map(fn($p) => [
                    'date' => $p->price_date->toIso8601String(),
                    'value' => (float) $p->price,
                ])->toArray(),
            ]
        ]);
    }

    public function getCurrentPrice($cryptoId)
    {
        if (!auth()->check()) {
            return response()->json(['success' => false, 'message' => 'Not authenticated'], 401);
        }

        $latestPrice = CryptoPrice::where('crypto_id', $cryptoId)
            ->orderBy('price_date', 'desc')
            ->first();

        if (!$latestPrice) {
            return response()->json(['success' => false, 'message' => 'No price data'], 404);
        }

        return response()->json([
            'success' => true,
            'currentPrice' => (float) $latestPrice->price,
            'date' => $latestPrice->price_date->toIso8601String(),
        ]);
    }
}
