<?php

namespace App\Console\Commands;

use App\Models\Cryptocurrency;
use App\Models\CryptocurrencyPrice;
use Illuminate\Console\Command;
use Carbon\Carbon;

class GenerateCryptoPrices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:generate-crypto-prices';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate 30 days of historical cryptocurrency prices';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $cryptocurrencies = Cryptocurrency::all();

        // Base prices for each cryptocurrency in EUR
        $basePrices = [
            1 => 42000,    // Bitcoin
            2 => 2500,     // Ethereum
            3 => 0.50,     // Ripple
            4 => 450,      // Bitcoin Cash
            5 => 0.45,     // Cardano
            6 => 85,       // Litecoin
            7 => 0.004,    // NEM
            8 => 0.10,     // Stellar
            9 => 0.20,     // IOTA
            10 => 65,      // Dash
        ];

        $this->info('Generating cryptocurrency prices for the last 30 days...');

        foreach ($cryptocurrencies as $crypto) {
            $basePrice = $basePrices[$crypto->id] ?? 100;
            $startDate = Carbon::now()->subDays(30);

            for ($i = 0; $i < 30; $i++) {
                $priceDate = $startDate->copy()->addDays($i);
                
                // Generate random price variation (±5% per day)
                $variance = (rand(-5, 5) / 100);
                $price = $basePrice * (1 + $variance);
                
                // Ensure price is positive
                $price = max(0.01, $price);

                CryptocurrencyPrice::updateOrCreate(
                    [
                        'cryptocurrency_id' => $crypto->id,
                        'price_date' => $priceDate,
                    ],
                    ['price' => round($price, 2)]
                );

                // Update base price for next iteration
                $basePrice = $price;
            }

            $this->info("Generated prices for {$crypto->name}");
        }

        $this->info('Cryptocurrency prices generated successfully!');
    }
}
