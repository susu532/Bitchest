<?php

namespace App\Http\Controllers;

use App\Services\WalletService;

use App\Http\Requests\BuyCryptoRequest;
use App\Http\Requests\SellCryptoRequest;

use App\Models\ClientAccount;

use Illuminate\Http\Request;

class WalletController extends Controller
{
    
    protected WalletService $walletService;
    
    
    public function __construct(WalletService $walletService)
    {
        $this->walletService = $walletService;
    }
    
    public function buyCryptocurrency(BuyCryptoRequest $request)
    {

        $result = $this->walletService->buyCryptocurrency(
            auth()->id(),
            $request->cryptoId,
            $request->quantity,
            $request->pricePerUnit
        );
        
        return response()->json([
            'success' => true,
            'message' => 'Purchase successful',
            'transaction' => $result['transaction'],
            'newBalance' => $result['newBalance'],
        ], 201);
    }

    
    public function sellCryptocurrency(SellCryptoRequest $request)
    {

        $result = $this->walletService->sellCryptocurrency(
            auth()->id(),
            $request->cryptoId,
            $request->quantity,
            $request->pricePerUnit
        );
        
        return response()->json([
            'success' => true,
            'message' => 'Sale successful',
            'transaction' => $result['transaction'],
            'newBalance' => $result['newBalance'],
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

        $holdings = [];

        foreach ($transactions as $transaction) {

            if (!isset($holdings[$transaction->crypto_id])) {

                $holdings[$transaction->crypto_id] = [

                    'cryptoId' => $transaction->crypto_id,

                    'totalQuantity' => 0,

                    'totalCost' => 0,

                    'averagePrice' => 0,

                    'transactions' => [],
                ];
            }

            if ($transaction->type === 'buy') {

                $holdings[$transaction->crypto_id]['totalQuantity'] += $transaction->quantity;

                $holdings[$transaction->crypto_id]['totalCost'] += $transaction->quantity * $transaction->price_per_unit;
                

                if ($holdings[$transaction->crypto_id]['totalQuantity'] > 0) {
                    $holdings[$transaction->crypto_id]['averagePrice'] = 
                        $holdings[$transaction->crypto_id]['totalCost'] / $holdings[$transaction->crypto_id]['totalQuantity'];
                }
            } else {

                $holdings[$transaction->crypto_id]['totalQuantity'] -= $transaction->quantity;
                

                $avgPrice = $holdings[$transaction->crypto_id]['averagePrice'];
                $holdings[$transaction->crypto_id]['totalCost'] -= $transaction->quantity * $avgPrice;
                

            }

            $holdings[$transaction->crypto_id]['transactions'][] = [

                'id' => (string) $transaction->id,

                'quantity' => (float) $transaction->quantity,

                'pricePerUnit' => (float) $transaction->price_per_unit,

                'type' => $transaction->type,

                'timestamp' => $transaction->transaction_date->toIso8601String(),
            ];
        }

        $holdings = array_map(function ($holding) {

            if ($holding['totalQuantity'] <= 0) {
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
