<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class WalletController extends Controller
{
    /**
     * Get wallet information for the authenticated user
     */
    public function getWallet()
    {
        $user = Auth::user();
        $transactions = $user->walletTransactions()->with('cryptocurrency')->get();

        // Group transactions by cryptocurrency
        $walletAssets = [];
        foreach ($transactions as $transaction) {
            $cryptoId = $transaction->cryptocurrency_id;
            if (!isset($walletAssets[$cryptoId])) {
                $walletAssets[$cryptoId] = [
                    'crypto_id' => $cryptoId,
                    'name' => $transaction->cryptocurrency->name,
                    'symbol' => $transaction->cryptocurrency->symbol,
                    'icon' => $transaction->cryptocurrency->icon,
                    'transactions' => [],
                    'total_quantity' => 0,
                    'total_cost' => 0,
                ];
            }

            if ($transaction->type === 'buy') {
                $walletAssets[$cryptoId]['total_quantity'] += $transaction->quantity;
                $walletAssets[$cryptoId]['total_cost'] += $transaction->quantity * $transaction->price_per_unit;
            } else {
                $walletAssets[$cryptoId]['total_quantity'] -= $transaction->quantity;
                $walletAssets[$cryptoId]['total_cost'] -= $transaction->quantity * $transaction->price_per_unit;
            }

            $walletAssets[$cryptoId]['transactions'][] = [
                'id' => $transaction->id,
                'type' => $transaction->type,
                'quantity' => $transaction->quantity,
                'price_per_unit' => $transaction->price_per_unit,
                'date' => $transaction->transaction_date->format('Y-m-d'),
            ];
        }

        // Calculate averages and remove negative quantities
        $wallet = [];
        foreach ($walletAssets as $asset) {
            if ($asset['total_quantity'] > 0) {
                $wallet[] = [
                    'crypto_id' => $asset['crypto_id'],
                    'name' => $asset['name'],
                    'symbol' => $asset['symbol'],
                    'icon' => $asset['icon'],
                    'quantity' => $asset['total_quantity'],
                    'average_price' => $asset['total_cost'] / $asset['total_quantity'],
                    'transactions' => $asset['transactions'],
                ];
            }
        }

        return response()->json([
            'balance_eur' => $user->balance_eur,
            'assets' => $wallet,
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
