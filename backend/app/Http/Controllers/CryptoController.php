<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cryptocurrency;
use App\Models\PriceHistory;

class CryptoController extends Controller
{
    public function index(Request $request)
    {
        $cryptos = Cryptocurrency::with(['prices' => function($q){ $q->orderBy('date','desc')->limit(1); }])->get();
        $result = $cryptos->map(function($c){
            return [
                'id' => $c->id,
                'symbol' => $c->symbol,
                'name' => $c->name,
                'price' => $c->prices->first()?->price ?? null
            ];
        });

        return response()->json($result);
    }

    public function show($id)
    {
        $c = Cryptocurrency::findOrFail($id);
        $last = $c->prices()->orderBy('date','desc')->first();
        return response()->json([
            'id' => $c->id,
            'symbol' => $c->symbol,
            'name' => $c->name,
            'price' => $last?->price
        ]);
    }

    public function history($id)
    {
        $rows = PriceHistory::where('cryptocurrency_id', $id)->orderBy('date','asc')->get();
        return response()->json($rows);
    }
}
