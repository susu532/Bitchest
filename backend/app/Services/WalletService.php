<?php

namespace App\Services;

use App\Models\WalletTransaction;
use App\Models\ClientAccount;
use App\Events\UserBalanceChanged;
use App\Events\TransactionCompleted;
use App\Exceptions\InsufficientBalanceException;
use App\Exceptions\InsufficientCryptoHoldingsException;


class WalletService
{
    
    public function buyCryptocurrency(int $userId, string $cryptoId, float $quantity, float $pricePerUnit): array
    {

        $account = ClientAccount::where('user_id', $userId)->first();
        

        $totalCost = $quantity * $pricePerUnit;
        

        if ($account->balance_eur < $totalCost) {
            throw new InsufficientBalanceException($totalCost, $account->balance_eur);
        }
        

        $previousBalance = $account->balance_eur;
        

        $transaction = WalletTransaction::create([
            'user_id' => $userId,
            'crypto_id' => $cryptoId,
            'quantity' => $quantity,
            'price_per_unit' => $pricePerUnit,
            'type' => 'buy',
            'transaction_date' => now(),
        ]);
        

        $account->balance_eur -= $totalCost;
        $account->save();
        

        broadcast(new UserBalanceChanged($userId, $account->balance_eur, $previousBalance, 'Cryptocurrency purchase'));
        broadcast(new TransactionCompleted($userId, 'buy', $cryptoId, $quantity, $pricePerUnit));
        
        return [
            'transaction' => $transaction,
            'newBalance' => $account->balance_eur,
        ];
    }
    
    
    public function sellCryptocurrency(int $userId, string $cryptoId, float $quantity, float $pricePerUnit): array
    {

        $account = ClientAccount::where('user_id', $userId)->first();
        

        $holdingQuantity = $this->getHoldingQuantity($userId, $cryptoId);
        

        if ($holdingQuantity < $quantity) {
            throw new InsufficientCryptoHoldingsException($cryptoId, $quantity, $holdingQuantity);
        }
        

        $previousBalance = $account->balance_eur;
        

        $transaction = WalletTransaction::create([
            'user_id' => $userId,
            'crypto_id' => $cryptoId,
            'quantity' => $quantity,
            'price_per_unit' => $pricePerUnit,
            'type' => 'sell',
            'transaction_date' => now(),
        ]);
        

        $totalProceeds = $quantity * $pricePerUnit;
        $account->balance_eur += $totalProceeds;
        $account->save();
        

        broadcast(new UserBalanceChanged($userId, $account->balance_eur, $previousBalance, 'Cryptocurrency sale'));
        broadcast(new TransactionCompleted($userId, 'sell', $cryptoId, $quantity, $pricePerUnit));
        
        return [
            'transaction' => $transaction,
            'newBalance' => $account->balance_eur,
        ];
    }
    
    
    private function getHoldingQuantity(int $userId, string $cryptoId): float
    {
        return WalletTransaction::where('user_id', $userId)
            ->where('crypto_id', $cryptoId)
            ->get()
            ->reduce(function ($carry, $transaction) {
                return $carry + ($transaction->type === 'buy' ? $transaction->quantity : -$transaction->quantity);
            }, 0);
    }
    
    
    public function getWalletSummary(int $userId): array
    {

        $transactions = WalletTransaction::where('user_id', $userId)
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
        
        return array_values(array_filter($holdings, fn($h) => $h['totalQuantity'] > 0));
    }
}
