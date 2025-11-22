<?php

namespace App\Http\Controllers;

use App\Models\Cryptocurrency;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CryptoPriceController extends Controller
{
    /**
     * Get price history for a cryptocurrency
     */
    public function priceHistory(string $id)
    {
        $crypto = Cryptocurrency::findOrFail($id);
        $prices = $crypto->prices()
            ->where('price_date', '>=', Carbon::now()->subDays(30))
            ->orderBy('price_date')
            ->get();

        $history = $prices->map(fn($p) => [
            'date' => $p->price_date->format('Y-m-d'),
            'value' => $p->price,
        ]);

        return response()->json([
            'cryptocurrency' => [
                'id' => $crypto->id,
                'name' => $crypto->name,
                'symbol' => $crypto->symbol,
                'icon' => $crypto->icon,
            ],
            'history' => $history,
        ], 200);
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
