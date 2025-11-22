<?php

namespace App\Console\Commands;

use App\Models\Cryptocurrency;
use App\Models\CryptoPrice;
use App\Events\CryptoPriceUpdated;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class UpdateCryptoPrices extends Command
{
    protected $signature = 'crypto:update-prices {--interval=5}';

    protected $description = 'Simulate real-time cryptocurrency price updates and broadcast to clients';

    protected array $priceCache = [];

    public function handle(): int
    {
        $interval = (int) $this->option('interval');

        $this->info('Starting cryptocurrency price updates (interval: ' . $interval . ' seconds)...');
        $this->info('Press Ctrl+C to stop');

        // Initialize price cache with current prices
        $cryptos = Cryptocurrency::all();
        foreach ($cryptos as $crypto) {
            $latestPrice = CryptoPrice::where('crypto_id', $crypto->id)
                ->orderBy('price_date', 'desc')
                ->first();
            $this->priceCache[$crypto->id] = $latestPrice ? $latestPrice->price : 0;
        }

        $runCount = 0;
        while (true) {
            $runCount++;
            $this->info("\n[" . now()->format('Y-m-d H:i:s') . "] Price Update #{$runCount}");

            foreach ($cryptos as $crypto) {
                $currentPrice = $this->priceCache[$crypto->id];
                $previousPrice = $currentPrice;

                // Generate random price variation (±1% to ±5%)
                $variation = (rand(-5, 5) / 100); // -5% to +5%
                $newPrice = $currentPrice * (1 + $variation);
                $newPrice = round($newPrice, 2);

                // Update cache
                $this->priceCache[$crypto->id] = $newPrice;

                // Create new price record in database
                $today = Carbon::now()->format('Y-m-d');
                CryptoPrice::updateOrCreate(
                    [
                        'crypto_id' => $crypto->id,
                        'price_date' => $today,
                    ],
                    [
                        'price' => $newPrice,
                    ]
                );

                // Broadcast price update event
                broadcast(new CryptoPriceUpdated(
                    $crypto->id,
                    $newPrice,
                    $previousPrice,
                    now()->toIso8601String()
                ));

                $change = $newPrice - $previousPrice;
                $changePercent = $previousPrice > 0 ? (($change / $previousPrice) * 100) : 0;

                $this->info(sprintf(
                    "  %s: €%.2f (was €%.2f, %+.2f%% %s)",
                    strtoupper($crypto->id),
                    $newPrice,
                    $previousPrice,
                    $changePercent,
                    $change >= 0 ? '📈' : '📉'
                ));
            }

            $this->info("Waiting {$interval} seconds until next update...");
            sleep($interval);
        }
    }
}
