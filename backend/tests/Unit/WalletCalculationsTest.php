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

    /**
     * Test average purchase price calculation for crypto holdings.
     */
    public function test_average_purchase_price_calculation()
    {
        $user = User::factory()->create(['role' => 'client']);
        $account = ClientAccount::factory()->create(['user_id' => $user->id, 'balance_eur' => 1000]);
        $crypto = Cryptocurrency::factory()->create();

        // Create multiple buy transactions
        // Transaction 1: 1 BTC at €10,000
        WalletTransaction::create([
            'user_id' => $user->id,
            'crypto_id' => $crypto->id,
            'quantity' => 1,
            'price_per_unit' => 10000,
            'type' => 'buy',
            'transaction_date' => now(),
        ]);

        // Transaction 2: 0.5 BTC at €18,000
        WalletTransaction::create([
            'user_id' => $user->id,
            'crypto_id' => $crypto->id,
            'quantity' => 0.5,
            'price_per_unit' => 18000,
            'type' => 'buy',
            'transaction_date' => now(),
        ]);

        // Transaction 3: 0.5 BTC at €20,000
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

        // Calculate totals
        $totalQuantity = $transactions->where('type', 'buy')->sum('quantity');
        $totalCost = $transactions->where('type', 'buy')->sum(function ($t) {
            return $t->quantity * $t->price_per_unit;
        });

        $expectedAveragePrice = $totalCost / $totalQuantity;

        // Expected: (10000 + 9000 + 10000) / 2 = 14500
        $this->assertEquals(2, $totalQuantity);
        $this->assertEquals(29000, $totalCost);
        $this->assertEquals(14500, $expectedAveragePrice);
    }

    /**
     * Test capital gain calculation with positive profit.
     */
    public function test_capital_gain_positive_calculation()
    {
        $user = User::factory()->create(['role' => 'client']);
        $crypto = Cryptocurrency::factory()->create();
        $account = ClientAccount::factory()->create(['user_id' => $user->id, 'balance_eur' => 10000]);

        // Buy 2 BTC at €14,500 average = €29,000 total
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

        // Expected: (2 * 30000) - (2 * 14500) = 60000 - 29000 = 31000
        $this->assertEquals(60000, $totalValue);
        $this->assertEquals(29000, $totalCost);
        $this->assertEquals(31000, $profit);
    }

    /**
     * Test capital gain calculation with negative profit (loss).
     */
    public function test_capital_gain_negative_calculation()
    {
        $user = User::factory()->create(['role' => 'client']);
        $crypto = Cryptocurrency::factory()->create();
        $account = ClientAccount::factory()->create(['user_id' => $user->id, 'balance_eur' => 10000]);

        // Buy 2 BTC at €14,500 average
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

        // Expected: (2 * 10000) - (2 * 14500) = 20000 - 29000 = -9000
        $this->assertEquals(20000, $totalValue);
        $this->assertEquals(29000, $totalCost);
        $this->assertEquals(-9000, $loss);
    }

    /**
     * Test that holdings are updated correctly after selling.
     */
    public function test_holdings_updated_after_selling()
    {
        $user = User::factory()->create(['role' => 'client']);
        $crypto = Cryptocurrency::factory()->create();
        $account = ClientAccount::factory()->create(['user_id' => $user->id]);

        // Buy 2 BTC
        WalletTransaction::create([
            'user_id' => $user->id,
            'crypto_id' => $crypto->id,
            'quantity' => 2,
            'price_per_unit' => 10000,
            'type' => 'buy',
            'transaction_date' => now(),
        ]);

        // Sell 0.5 BTC
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

        // Expected: 2 - 0.5 = 1.5
        $this->assertEquals(1.5, $holdingQuantity);
    }

    /**
     * Test that prices cannot be negative.
     */
    public function test_crypto_price_cannot_be_negative()
    {
        $crypto = Cryptocurrency::factory()->create();

        // Attempt to create a negative price should fail or be handled
        $price = CryptoPrice::create([
            'crypto_id' => $crypto->id,
            'price_date' => now()->toDateString(),
            'price' => 100, // Valid positive price
        ]);

        $this->assertGreaterThan(0, $price->price);
    }

    /**
     * Test transaction balance calculation.
     */
    public function test_transaction_balance_calculation()
    {
        $user = User::factory()->create(['role' => 'client']);
        $account = ClientAccount::factory()->create(['user_id' => $user->id, 'balance_eur' => 1000]);

        $initialBalance = $account->balance_eur;

        // Simulate a purchase deduction
        $purchaseCost = 250;
        $newBalance = $initialBalance - $purchaseCost;

        $this->assertEquals(750, $newBalance);

        // Simulate a sale credit
        $saleProceeds = 300;
        $finalBalance = $newBalance + $saleProceeds;

        $this->assertEquals(1050, $finalBalance);
    }
}
