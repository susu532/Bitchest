<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Cryptocurrency;
use App\Models\PriceHistory;
use Carbon\Carbon;

class PriceSeeder extends Seeder
{
    public function run()
    {
        $generatorPath = base_path('../documents/cotation_generator.php');

        $cryptos = Cryptocurrency::all();

        foreach ($cryptos as $crypto) {
            $prices = [];
            if (file_exists($generatorPath)) {
                require_once $generatorPath;

                if (function_exists('getFirstCotation') && function_exists('getCotationFor')) {
                    $base = getFirstCotation($crypto->symbol);
                    $p = max(0.01, $base);
                    for ($i=0; $i<30; $i++) {
                        $variation = getCotationFor($crypto->symbol);
                        $p = max(0.01, $p + $variation);
                        $date = Carbon::today()->subDays(29 - $i)->toDateString();
                        $prices[] = ['date' => $date, 'price' => round($p, 2)];
                    }
                }
            }

            if (empty($prices)) {
                $seed = ord($crypto->symbol[0]) % 10 + 10;
                $price = $seed * 100;
                for ($i=0; $i<30; $i++) {
                    $price *= (1 + (rand(-500,500) / 10000));
                    $date = Carbon::today()->subDays(29 - $i)->toDateString();
                    $prices[] = ['date' => $date, 'price' => max(0.01, round($price, 2))];
                }
            }

            foreach ($prices as $p) {
                PriceHistory::create([
                    'cryptocurrency_id' => $crypto->id,
                    'date' => $p['date'],
                    'price' => $p['price']
                ]);
            }
        }
    }
}
