<?php

namespace Database\Seeders;

use App\Models\WalletTransaction;
use App\Models\User;
use App\Models\Cryptocurrency;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the test client user (Bruno)
        $client = User::where('email', 'bruno@bitchest.example')->first();
        if (!$client) {
            return;
        }

        // Get cryptocurrencies
        $bitcoin = Cryptocurrency::where('symbol', 'BTC')->first();
        $ethereum = Cryptocurrency::where('symbol', 'ETH')->first();

        if ($bitcoin && $ethereum) {
            // Add sample transactions
            $now = Carbon::now();

            // Bitcoin transactions
            WalletTransaction::create([
                'user_id' => $client->id,
                'cryptocurrency_id' => $bitcoin->id,
                'type' => 'buy',
                'quantity' => 0.4,
                'price_per_unit' => 18500,
                'transaction_date' => $now->copy()->subMonths(5)->subDays(12),
            ]);

            WalletTransaction::create([
                'user_id' => $client->id,
                'cryptocurrency_id' => $bitcoin->id,
                'type' => 'buy',
                'quantity' => 0.1,
                'price_per_unit' => 25200,
                'transaction_date' => $now->copy()->subMonths(3)->subDays(4),
            ]);

            // Ethereum transactions
            WalletTransaction::create([
                'user_id' => $client->id,
                'cryptocurrency_id' => $ethereum->id,
                'type' => 'buy',
                'quantity' => 1.5,
                'price_per_unit' => 1450,
                'transaction_date' => $now->copy()->subMonths(2)->subDays(2),
            ]);
        }
    }
}
