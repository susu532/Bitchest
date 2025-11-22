<?php

namespace App\Http\Controllers;

use App\Models\WalletTransaction;
use App\Models\Cryptocurrency;
use App\Models\CryptocurrencyPrice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class TransactionController extends Controller
{
    /**
     * Get user transactions
     */
    public function index()
    {
        $user = Auth::user();
        $transactions = WalletTransaction::where('user_id', $user->id)
            ->with('cryptocurrency')
            ->orderBy('transaction_date', 'desc')
            ->get();

        return response()->json($transactions, 200);
    }

    /**
     * Record a new transaction (buy/sell)
     */
    public function record(Request $request)
    {
        $user = Auth::user();
        $validated = $request->validate([
            'cryptocurrency_id' => 'required|exists:cryptocurrencies,id',
            'type' => 'required|in:buy,sell',
            'quantity' => 'required|numeric|min:0.00000001',
            'price_per_unit' => 'required|numeric|min:0.01',
        ]);

        // Calculate total cost
        $totalCost = $validated['quantity'] * $validated['price_per_unit'];

        if ($validated['type'] === 'buy') {
            // Check if user has enough balance
            if ($user->balance_eur < $totalCost) {
                return response()->json(['message' => 'Insufficient balance'], 400);
            }
            $user->balance_eur -= $totalCost;
        } else {
            // Sell: add back to balance
            $user->balance_eur += $totalCost;
        }

        $transaction = WalletTransaction::create([
            'user_id' => $user->id,
            'cryptocurrency_id' => $validated['cryptocurrency_id'],
            'type' => $validated['type'],
            'quantity' => $validated['quantity'],
            'price_per_unit' => $validated['price_per_unit'],
            'transaction_date' => now(),
        ]);

        $user->save();

        return response()->json([
            'message' => 'Transaction recorded successfully',
            'transaction' => $transaction,
            'new_balance' => $user->balance_eur,
        ], 201);
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
