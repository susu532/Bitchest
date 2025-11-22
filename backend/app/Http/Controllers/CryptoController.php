<?php

namespace App\Http\Controllers;

use App\Models\Cryptocurrency;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CryptoController extends Controller
{
    /**
     * Display a listing of cryptocurrencies with their latest prices
     */
    public function index()
    {
        $cryptos = Cryptocurrency::with(['prices' => function ($query) {
            $query->where('price_date', '>=', Carbon::now()->subDays(30))
                  ->orderBy('price_date');
        }])->get();

        $result = $cryptos->map(function ($crypto) {
            $latestPrice = $crypto->prices->last();
            return [
                'id' => $crypto->id,
                'name' => $crypto->name,
                'symbol' => $crypto->symbol,
                'icon' => $crypto->icon,
                'current_price' => $latestPrice ? $latestPrice->price : 0,
                'history' => $crypto->prices->map(fn($p) => [
                    'date' => $p->price_date->format('Y-m-d'),
                    'value' => $p->price,
                ]),
            ];
        });

        return response()->json($result, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
