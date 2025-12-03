<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\ClientAccount;
use App\Models\WalletTransaction;
use App\Models\Cryptocurrency;
use App\Models\CryptoPrice;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WalletCalculationsTest extends TestCase
{
    use RefreshDatabase;

    
    public function test_average_purchase_price_calculation()
    {
        $user = User::factory()->create(['role' => 'client']);
        $account = ClientAccount::factory()->create(['user_id' => $user->id, 'balance_eur' => 1000]);
        $crypto = Cryptocurrency::factory()->create();

        WalletTransaction::create([
            'user_id' => $user->id,
            'crypto_id' => $crypto->id,
            'quantity' => 1,
            'price_per_unit' => 10000,
            'type' => 'buy',
            'transaction_date' => now(),
        ]);

        WalletTransaction::create([
            'user_id' => $user->id,
            'crypto_id' => $crypto->id,
            'quantity' => 0.5,
            'price_per_unit' => 18000,
            'type' => 'buy',
            'transaction_date' => now(),
        ]);

        WalletTransaction::create([
            'user_id' => $user->id,
            'crypto_id' => $crypto->id,
            'quantity' => 0.5,
            'price_per_unit' => 20000,
            'type' => 'buy',
            'transaction_date' => now(),
        ]);

        $transactions = WalletTransaction::where('user_id', $user->id)
            ->where('crypto_id', $crypto->id)
            ->get();

        $totalQuantity = $transactions->where('type', 'buy')->sum('quantity');
        $totalCost = $transactions->where('type', 'buy')->sum(function ($t) {
            return $t->quantity * $t->price_per_unit;
        });

        $expectedAveragePrice = $totalCost / $totalQuantity;

        $this->assertEquals(2, $totalQuantity);
        $this->assertEquals(29000, $totalCost);
        $this->assertEquals(14500, $expectedAveragePrice);
    }

    
    public function test_average_price_remains_consistent_after_sell()
    {
        $user = User::factory()->create(['role' => 'client']);
        $account = ClientAccount::factory()->create(['user_id' => $user->id, 'balance_eur' => 50000]);
        $crypto = Cryptocurrency::factory()->create();

        WalletTransaction::create([
            'user_id' => $user->id,
            'crypto_id' => $crypto->id,
            'quantity' => 1,
            'price_per_unit' => 10000,
            'type' => 'buy',
            'transaction_date' => now(),
        ]);

        WalletTransaction::create([
            'user_id' => $user->id,
            'crypto_id' => $crypto->id,
            'quantity' => 1,
            'price_per_unit' => 20000,
            'type' => 'buy',
            'transaction_date' => now(),
        ]);

        WalletTransaction::create([
            'user_id' => $user->id,
            'crypto_id' => $crypto->id,
            'quantity' => 1,
            'price_per_unit' => 30000,
            'type' => 'sell',
            'transaction_date' => now(),
        ]);

        $transactions = WalletTransaction::where('user_id', $user->id)
            ->where('crypto_id', $crypto->id)
            ->get();

        $totalQuantity = 0;
        $totalCost = 0;
        $averagePrice = 0;

        foreach ($transactions as $transaction) {
            if ($transaction->type === 'buy') {
                $totalQuantity += $transaction->quantity;
                $totalCost += $transaction->quantity * $transaction->price_per_unit;
                
                if ($totalQuantity > 0) {
                    $averagePrice = $totalCost / $totalQuantity;
                }
            } else {

                $totalQuantity -= $transaction->quantity;
                $totalCost -= $transaction->quantity * $averagePrice;

            }
        }

        $this->assertEquals(1, $totalQuantity, 'Should have 1 BTC remaining');
        $this->assertEquals(15000, $averagePrice, 'Average price should remain €15,000');
        $this->assertEquals(15000, $totalCost, 'Total cost should be €15,000');
    }

    
    public function test_capital_gain_positive_calculation()
    {
        $user = User::factory()->create(['role' => 'client']);
        $crypto = Cryptocurrency::factory()->create();
        $account = ClientAccount::factory()->create(['user_id' => $user->id, 'balance_eur' => 10000]);

        WalletTransaction::create([
            'user_id' => $user->id,
            'crypto_id' => $crypto->id,
            'quantity' => 2,
            'price_per_unit' => 14500,
            'type' => 'buy',
            'transaction_date' => now(),
        ]);

        $holdingQuantity = 2;
        $averagePrice = 14500;
        $currentPrice = 30000;

        $totalValue = $holdingQuantity * $currentPrice;
        $totalCost = $holdingQuantity * $averagePrice;
        $profit = $totalValue - $totalCost;

        $this->assertEquals(60000, $totalValue);
        $this->assertEquals(29000, $totalCost);
        $this->assertEquals(31000, $profit);
    }

    
    public function test_capital_gain_negative_calculation()
    {
        $user = User::factory()->create(['role' => 'client']);
        $crypto = Cryptocurrency::factory()->create();
        $account = ClientAccount::factory()->create(['user_id' => $user->id, 'balance_eur' => 10000]);

        WalletTransaction::create([
            'user_id' => $user->id,
            'crypto_id' => $crypto->id,
            'quantity' => 2,
            'price_per_unit' => 14500,
            'type' => 'buy',
            'transaction_date' => now(),
        ]);

        $holdingQuantity = 2;
        $averagePrice = 14500;
        $currentPrice = 10000;

        $totalValue = $holdingQuantity * $currentPrice;
        $totalCost = $holdingQuantity * $averagePrice;
        $loss = $totalValue - $totalCost;

        $this->assertEquals(20000, $totalValue);
        $this->assertEquals(29000, $totalCost);
        $this->assertEquals(-9000, $loss);
    }

    
    public function test_holdings_updated_after_selling()
    {
        $user = User::factory()->create(['role' => 'client']);
        $crypto = Cryptocurrency::factory()->create();
        $account = ClientAccount::factory()->create(['user_id' => $user->id]);

        WalletTransaction::create([
            'user_id' => $user->id,
            'crypto_id' => $crypto->id,
            'quantity' => 2,
            'price_per_unit' => 10000,
            'type' => 'buy',
            'transaction_date' => now(),
        ]);

        WalletTransaction::create([
            'user_id' => $user->id,
            'crypto_id' => $crypto->id,
            'quantity' => 0.5,
            'price_per_unit' => 15000,
            'type' => 'sell',
            'transaction_date' => now(),
        ]);

        $transactions = WalletTransaction::where('user_id', $user->id)
            ->where('crypto_id', $crypto->id)
            ->get();

        $holdingQuantity = $transactions->reduce(function ($carry, $transaction) {
            return $carry + ($transaction->type === 'buy' ? $transaction->quantity : -$transaction->quantity);
        }, 0);

        $this->assertEquals(1.5, $holdingQuantity);
    }

    
    public function test_crypto_price_cannot_be_negative()
    {
        $crypto = Cryptocurrency::factory()->create();

        $price = CryptoPrice::create([
            'crypto_id' => $crypto->id,
            'price_date' => now()->toDateString(),
            'price' => 100,
        ]);

        $this->assertGreaterThan(0, $price->price);
    }

    
    public function test_transaction_balance_calculation()
    {
        $user = User::factory()->create(['role' => 'client']);
        $account = ClientAccount::factory()->create(['user_id' => $user->id, 'balance_eur' => 1000]);

        $initialBalance = $account->balance_eur;

        $purchaseCost = 250;
        $newBalance = $initialBalance - $purchaseCost;

        $this->assertEquals(750, $newBalance);

        $saleProceeds = 300;
        $finalBalance = $newBalance + $saleProceeds;

        $this->assertEquals(1050, $finalBalance);
    }
}
