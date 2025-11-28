<?php

namespace App\Services;

use App\Models\WalletTransaction;
use App\Models\ClientAccount;
use App\Events\UserBalanceChanged;
use App\Events\TransactionCompleted;
use App\Exceptions\InsufficientBalanceException;
use App\Exceptions\InsufficientCryptoHoldingsException;

/**
 * Service de gestion du portefeuille et des transactions crypto
 * 
 * Ce service centralise toute la logique métier liée aux achats/ventes de cryptomonnaies.
 * Il gère les validations métier, les calculs de portefeuille et la diffusion des événements.
 * 
 * @package App\Services
 * @author BitChest Team
 * @version 1.0.0
 */
class WalletService
{
    /**
     * Achète une cryptomonnaie pour un utilisateur
     * 
     * Cette méthode effectue les opérations suivantes:
     * 1. Vérifie que le solde EUR est suffisant
     * 2. Crée l'enregistrement de transaction
     * 3. Débite le compte EUR
     * 4. Diffuse les événements WebSocket pour mise à jour en temps réel
     * 
     * @param int $userId ID de l'utilisateur effectuant l'achat
     * @param string $cryptoId ID de la cryptomonnaie (ex: 'bitcoin')
     * @param float $quantity Quantité à acheter (min: 0.00000001)
     * @param float $pricePerUnit Prix par unité en EUR (prix de marché actuel)
     * 
     * @return array [
     *   'transaction' => WalletTransaction,
     *   'newBalance' => float (nouveau solde EUR)
     * ]
     * 
     * @throws InsufficientBalanceException Si le solde EUR est insuffisant
     * 
     * @example
     * $result = $walletService->buyCryptocurrency(1, 'bitcoin', 0.5, 35000.00);
     * // Returns: ['transaction' => {...}, 'newBalance' => 1500.00]
     */
    public function buyCryptocurrency(int $userId, string $cryptoId, float $quantity, float $pricePerUnit): array
    {
        // Récupère le compte client
        $account = ClientAccount::where('user_id', $userId)->first();
        
        // Calcule le coût total
        $totalCost = $quantity * $pricePerUnit;
        
        // Vérifie le solde
        if ($account->balance_eur < $totalCost) {
            throw new InsufficientBalanceException($totalCost, $account->balance_eur);
        }
        
        // Enregistre le solde avant la transaction
        $previousBalance = $account->balance_eur;
        
        // Crée la transaction
        $transaction = WalletTransaction::create([
            'user_id' => $userId,
            'crypto_id' => $cryptoId,
            'quantity' => $quantity,
            'price_per_unit' => $pricePerUnit,
            'type' => 'buy',
            'transaction_date' => now(),
        ]);
        
        // Débite le compte
        $account->balance_eur -= $totalCost;
        $account->save();
        
        // Diffuse les événements
        broadcast(new UserBalanceChanged($userId, $account->balance_eur, $previousBalance, 'Cryptocurrency purchase'));
        broadcast(new TransactionCompleted($userId, 'buy', $cryptoId, $quantity, $pricePerUnit));
        
        return [
            'transaction' => $transaction,
            'newBalance' => $account->balance_eur,
        ];
    }
    
    /**
     * Vend une cryptomonnaie pour un utilisateur
     * 
     * Cette méthode effectue les opérations suivantes:
     * 1. Calcule la quantité détenue (buy - sell)
     * 2. Vérifie que le holding est suffisant
     * 3. Crée l'enregistrement de transaction
     * 4. Crédite le compte EUR
     * 5. Diffuse les événements WebSocket
     * 
     * @param int $userId ID de l'utilisateur effectuant la vente
     * @param string $cryptoId ID de la cryptomonnaie
     * @param float $quantity Quantité à vendre (doit être <= holding actuel)
     * @param float $pricePerUnit Prix par unité en EUR (prix de marché actuel)
     * 
     * @return array [
     *   'transaction' => WalletTransaction,
     *   'newBalance' => float (nouveau solde EUR)
     * ]
     * 
     * @throws InsufficientCryptoHoldingsException Si le holding est insuffisant
     * 
     * @example
     * $result = $walletService->sellCryptocurrency(1, 'bitcoin', 0.25, 36000.00);
     * // Returns: ['transaction' => {...}, 'newBalance' => 10500.00]
     */
    public function sellCryptocurrency(int $userId, string $cryptoId, float $quantity, float $pricePerUnit): array
    {
        // Récupère le compte client
        $account = ClientAccount::where('user_id', $userId)->first();
        
        // Calcule la quantité détenue
        $holdingQuantity = $this->getHoldingQuantity($userId, $cryptoId);
        
        // Vérifie que le client détient suffisamment
        if ($holdingQuantity < $quantity) {
            throw new InsufficientCryptoHoldingsException($cryptoId, $quantity, $holdingQuantity);
        }
        
        // Enregistre le solde avant la transaction
        $previousBalance = $account->balance_eur;
        
        // Crée la transaction de vente
        $transaction = WalletTransaction::create([
            'user_id' => $userId,
            'crypto_id' => $cryptoId,
            'quantity' => $quantity,
            'price_per_unit' => $pricePerUnit,
            'type' => 'sell',
            'transaction_date' => now(),
        ]);
        
        // Crédite le compte
        $totalProceeds = $quantity * $pricePerUnit;
        $account->balance_eur += $totalProceeds;
        $account->save();
        
        // Diffuse les événements
        broadcast(new UserBalanceChanged($userId, $account->balance_eur, $previousBalance, 'Cryptocurrency sale'));
        broadcast(new TransactionCompleted($userId, 'sell', $cryptoId, $quantity, $pricePerUnit));
        
        return [
            'transaction' => $transaction,
            'newBalance' => $account->balance_eur,
        ];
    }
    
    /**
     * Calcule la quantité totale détenue pour une cryptomonnaie
     *
     * @param int $userId ID de l'utilisateur
     * @param string $cryptoId ID de la cryptomonnaie
     * @return float Quantité totale détenue
     */
    private function getHoldingQuantity(int $userId, string $cryptoId): float
    {
        return WalletTransaction::where('user_id', $userId)
            ->where('crypto_id', $cryptoId)
            ->get()
            ->reduce(function ($carry, $transaction) {
                return $carry + ($transaction->type === 'buy' ? $transaction->quantity : -$transaction->quantity);
            }, 0);
    }
    
    /**
     * Récupère le résumé complet du portefeuille d'un utilisateur
     * 
     * Calcule pour chaque cryptomonnaie détenue:
     * - La quantité totale (net de tous les achats et ventes)
     * - Le prix moyen d'achat pondéré (Weighted Average Cost)
     * - Le coût total de base (pour calcul du profit/perte)
     * - L'historique complet des transactions
     * 
     * Méthode de calcul du prix moyen:
     * 1. À chaque ACHAT: recalcule moyenne = coût total / quantité totale
     * 2. À chaque VENTE: réduit le coût selon le prix moyen existant
     *    (ne change PAS le prix moyen, applique FIFO/WAC)
     * 
     * @param int $userId ID de l'utilisateur
     * 
     * @return array Tableau de holdings filtrés (quantité > 0 seulement) [
     *   [
     *     'cryptoId' => string,
     *     'totalQuantity' => float (quantité nette détenue),
     *     'totalCost' => float (coût de base total en EUR),
     *     'averagePrice' => float (prix moyen d'achat en EUR),
     *     'transactions' => array (historique complet)
     *   ],
     *   ...
     * ]
     * 
     * @example
     * $portfolio = $walletService->getWalletSummary(1);
     * // Returns: [
     * //   ['cryptoId' => 'bitcoin', 'totalQuantity' => 1.5, 
     * //    'averagePrice' => 30000, 'totalCost' => 45000, ...]
     * // ]
     */
    public function getWalletSummary(int $userId): array
    {
        // Récupère toutes les transactions
        $transactions = WalletTransaction::where('user_id', $userId)
            ->with('cryptocurrency')
            ->get();
        
        // Initialise les holdings
        $holdings = [];
        
        // Calcule les holdings avec le prix moyen pondéré
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
                
                // Recalcule le prix moyen après chaque achat
                if ($holdings[$transaction->crypto_id]['totalQuantity'] > 0) {
                    $holdings[$transaction->crypto_id]['averagePrice'] = 
                        $holdings[$transaction->crypto_id]['totalCost'] / $holdings[$transaction->crypto_id]['totalQuantity'];
                }
            } else {
                // Vente: réduit proportionnellement selon le prix moyen
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
        
        // Filtre les holdings actifs et assure le prix moyen
        $holdings = array_map(function ($holding) {
            if ($holding['totalQuantity'] <= 0) {
                $holding['averagePrice'] = 0;
            }
            return $holding;
        }, $holdings);
        
        return array_values(array_filter($holdings, fn($h) => $h['totalQuantity'] > 0));
    }
}
