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

        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        $this->info('🚀 BitChest Cryptocurrency Price Updater');

        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        $this->info('');

        $this->info('📊 Update Interval: ' . $interval . ' seconds');

        $this->info('🔄 Broadcasting to: crypto-prices channel');

        $this->info('');

        $this->info('Press Ctrl+C to stop');

        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        $this->newLine();

        $cryptos = Cryptocurrency::all();

        foreach ($cryptos as $crypto) {

            $latestPrice = CryptoPrice::where('crypto_id', $crypto->id)
                ->orderBy('price_date', 'desc')
                ->first();

            $this->priceCache[$crypto->id] = $latestPrice ? (float) $latestPrice->price : 100;
        }

        $runCount = 0;

        $totalBroadcasts = 0;

        while (true) {

            $runCount++;

            $timestamp = now()->format('Y-m-d H:i:s');

            $this->info("┌─ Update Cycle #{$runCount} [{$timestamp}]");

            foreach ($cryptos as $crypto) {

                $currentPrice = $this->priceCache[$crypto->id];

                $previousPrice = $currentPrice;

                $variation = (rand(-20, 20) / 1000);

                $newPrice = $currentPrice * (1 + $variation);

                $newPrice = round($newPrice, 2);

                if ($newPrice < 5) {

                    $newPrice = 5.00;
                }

                $this->priceCache[$crypto->id] = $newPrice;

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

                broadcast(new CryptoPriceUpdated(

                    $crypto->id,

                    $newPrice,

                    $previousPrice,

                    now()->toIso8601String()
                ));

                $change = $newPrice - $previousPrice;

                $changePercent = $previousPrice > 0 ? (($change / $previousPrice) * 100) : 0;

                $direction = $change >= 0 ? '📈' : '📉';

                $cryptoName = strtoupper(str_pad($crypto->symbol, 6));

                $priceStr = sprintf('€%.2f', $newPrice);

                $changeStr = sprintf('%+.4f%%', $changePercent);

                $this->line("│  $direction $cryptoName → $priceStr ($changeStr)");

                $totalBroadcasts++;
            }

            $this->info("└─ Waiting $interval seconds...");

            $this->newLine();

            sleep($interval);
        }

        return Command::SUCCESS;
    }
}
