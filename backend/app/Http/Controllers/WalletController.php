<?php

namespace App\Http\Controllers;

use App\Models\WalletTransaction;
use App\Models\ClientAccount;
use App\Models\CryptoPrice;
use App\Events\UserBalanceChanged;
use App\Events\TransactionCompleted;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function buyCryptocurrency(Request $request)
    {
        if (!auth()->check() || auth()->user()->role !== 'client') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'cryptoId' => 'required|string|exists:cryptocurrencies,id',
            'quantity' => 'required|numeric|min:0.00000001',
            'pricePerUnit' => 'required|numeric|min:0.01',
        ]);

        $user = auth()->user();
        $account = ClientAccount::where('user_id', $user->id)->first();

        $totalCost = $request->quantity * $request->pricePerUnit;

        if ($account->balance_eur < $totalCost) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient balance',
            ], 400);
        }

        $previousBalance = $account->balance_eur;

        // Create transaction
        $transaction = WalletTransaction::create([
            'user_id' => $user->id,
            'crypto_id' => $request->cryptoId,
            'quantity' => $request->quantity,
            'price_per_unit' => $request->pricePerUnit,
            'type' => 'buy',
            'transaction_date' => now(),
        ]);

        // Deduct balance
        $account->balance_eur -= $totalCost;
        $account->save();

        // Broadcast events
        broadcast(new UserBalanceChanged($user->id, $account->balance_eur, $previousBalance, 'Cryptocurrency purchase'));
        broadcast(new TransactionCompleted($user->id, 'buy', $request->cryptoId, $request->quantity, $request->pricePerUnit));

        return response()->json([
            'success' => true,
            'message' => 'Purchase successful',
            'transaction' => [
                'id' => (string) $transaction->id,
                'cryptoId' => $transaction->crypto_id,
                'quantity' => (float) $transaction->quantity,
                'pricePerUnit' => (float) $transaction->price_per_unit,
                'type' => $transaction->type,
                'timestamp' => $transaction->transaction_date->toIso8601String(),
            ],
            'newBalance' => (float) $account->balance_eur,
        ], 201);
    }

    public function sellCryptocurrency(Request $request)
    {
        if (!auth()->check() || auth()->user()->role !== 'client') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'cryptoId' => 'required|string|exists:cryptocurrencies,id',
            'quantity' => 'required|numeric|min:0.00000001',
            'pricePerUnit' => 'required|numeric|min:0.01',
        ]);

        $user = auth()->user();
        $account = ClientAccount::where('user_id', $user->id)->first();

        // Check if user has enough crypto
        $holdingQuantity = WalletTransaction::where('user_id', $user->id)
            ->where('crypto_id', $request->cryptoId)
            ->get()
            ->reduce(function ($carry, $transaction) {
                return $carry + ($transaction->type === 'buy' ? $transaction->quantity : -$transaction->quantity);
            }, 0);

        if ($holdingQuantity < $request->quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient crypto holdings',
            ], 400);
        }

        $previousBalance = $account->balance_eur;

        // Create transaction
        $transaction = WalletTransaction::create([
            'user_id' => $user->id,
            'crypto_id' => $request->cryptoId,
            'quantity' => $request->quantity,
            'price_per_unit' => $request->pricePerUnit,
            'type' => 'sell',
            'transaction_date' => now(),
        ]);

        // Add balance
        $totalProceeds = $request->quantity * $request->pricePerUnit;
        $account->balance_eur += $totalProceeds;
        $account->save();

        // Broadcast events
        broadcast(new UserBalanceChanged($user->id, $account->balance_eur, $previousBalance, 'Cryptocurrency sale'));
        broadcast(new TransactionCompleted($user->id, 'sell', $request->cryptoId, $request->quantity, $request->pricePerUnit));

        return response()->json([
            'success' => true,
            'message' => 'Sale successful',
            'transaction' => [
                'id' => (string) $transaction->id,
                'cryptoId' => $transaction->crypto_id,
                'quantity' => (float) $transaction->quantity,
                'pricePerUnit' => (float) $transaction->price_per_unit,
                'type' => $transaction->type,
                'timestamp' => $transaction->transaction_date->toIso8601String(),
            ],
            'newBalance' => (float) $account->balance_eur,
        ], 201);
    }

    public function getWalletSummary(Request $request)
    {
        if (!auth()->check() || auth()->user()->role !== 'client') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $user = auth()->user();
        $account = ClientAccount::where('user_id', $user->id)->first();

        if (!$account) {
            return response()->json(['success' => false, 'message' => 'Account not found'], 404);
        }

        $transactions = WalletTransaction::where('user_id', $user->id)
            ->with('cryptocurrency')
            ->get();

        // Group by crypto and calculate holdings
        $holdings = [];
        foreach ($transactions as $transaction) {
            if (!isset($holdings[$transaction->crypto_id])) {
                $holdings[$transaction->crypto_id] = [
                    'cryptoId' => $transaction->crypto_id,
                    'totalQuantity' => 0,
                    'totalCost' => 0,
                    'transactions' => [],
                ];
            }

            if ($transaction->type === 'buy') {
                $holdings[$transaction->crypto_id]['totalQuantity'] += $transaction->quantity;
                $holdings[$transaction->crypto_id]['totalCost'] += $transaction->quantity * $transaction->price_per_unit;
            } else {
                $holdings[$transaction->crypto_id]['totalQuantity'] -= $transaction->quantity;
                $holdings[$transaction->crypto_id]['totalCost'] -= $transaction->quantity * $transaction->price_per_unit;
            }

            $holdings[$transaction->crypto_id]['transactions'][] = [
                'id' => (string) $transaction->id,
                'quantity' => (float) $transaction->quantity,
                'pricePerUnit' => (float) $transaction->price_per_unit,
                'type' => $transaction->type,
                'timestamp' => $transaction->transaction_date->toIso8601String(),
            ];
        }

        // Filter out zero holdings and calculate average price
        $holdings = array_map(function ($holding) {
            if ($holding['totalQuantity'] > 0) {
                $holding['averagePrice'] = $holding['totalCost'] / $holding['totalQuantity'];
            } else {
                $holding['averagePrice'] = 0;
            }
            return $holding;
        }, $holdings);

        $holdings = array_values(array_filter($holdings, fn($h) => $h['totalQuantity'] > 0));

        return response()->json([
            'success' => true,
            'wallet' => [
                'balanceEUR' => (float) $account->balance_eur,
                'holdings' => $holdings,
            ]
        ]);
    }
}
