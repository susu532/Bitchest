<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Cryptocurrency;
use App\Models\CryptoPrice;
use Carbon\Carbon;

class CryptoSeeder extends Seeder
{
    private const MODULUS = 2147483647;
    private const MULTIPLIER = 48271;

   

    public function run(): void
    {
        $cryptocurrencies = [
            [
                'id' => 'bitcoin',
                'name' => 'Bitcoin',
                'symbol' => 'BTC',
                'icon' => '/assets/bitcoin.png',
            ],
            [
                'id' => 'ethereum',
                'name' => 'Ethereum',
                'symbol' => 'ETH',
                'icon' => '/assets/ethereum.png',
            ],
            [
                'id' => 'ripple',
                'name' => 'Ripple',
                'symbol' => 'XRP',
                'icon' => '/assets/ripple.png',
            ],
            [
                'id' => 'bitcoin-cash',
                'name' => 'Bitcoin Cash',
                'symbol' => 'BCH',
                'icon' => '/assets/bitcoin-cash.png',
            ],
            [
                'id' => 'cardano',
                'name' => 'Cardano',
                'symbol' => 'ADA',
                'icon' => '/assets/cardano.png',
            ],
            [
                'id' => 'litecoin',
                'name' => 'Litecoin',
                'symbol' => 'LTC',
                'icon' => '/assets/litecoin.png',
            ],
            [
                'id' => 'nem',
                'name' => 'NEM',
                'symbol' => 'XEM',
                'icon' => '/assets/nem.png',
            ],
            [
                'id' => 'stellar',
                'name' => 'Stellar',
                'symbol' => 'XLM',
                'icon' => '/assets/stellar.png',
            ],
            [
                'id' => 'iota',
                'name' => 'IOTA',
                'symbol' => 'MIOTA',
                'icon' => '/assets/iota.png',
            ],
            [
                'id' => 'dash',
                'name' => 'Dash',
                'symbol' => 'DASH',
                'icon' => '/assets/dash.png',
            ],
        ];

        // Create cryptocurrencies
        foreach ($cryptocurrencies as $crypto) {
            Cryptocurrency::create($crypto);
        }

        // Generate 30 days of price history
        $baseSeed = Carbon::now()->startOfYear()->timestamp;
        $today = Carbon::now();

        foreach ($cryptocurrencies as $index => $crypto) {
            $this->generatePriceHistory($crypto['id'], $crypto['name'], $baseSeed + $index * 97, $today);
        }
    }

    private function generatePriceHistory($cryptoId, $name, $seed, $today)
    {
        $rand = $this->lcg($this->stringToSeed($name) + $seed);
        $days = 30;

        $currentValue = max(5, $this->getFirstCotation($name, $rand));
        $prices = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = (clone $today)->subDays($i);

            if (count($prices) > 0) {
                $deltaPercent = $this->getDailyVariationPercent($name, $rand);
                $currentValue = max(25, $currentValue * (1 + $deltaPercent));
            }

            $prices[] = [
                'crypto_id' => $cryptoId,
                'price_date' => $date->toDateString(),
                'price' => round($currentValue, 2),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        CryptoPrice::insert($prices);
    }

    private function stringToSeed($input)
    {
        $hash = 0;
        for ($i = 0; $i < strlen($input); $i++) {
            $hash = ($hash * 31 + ord($input[$i])) % self::MODULUS;
        }
        return $hash + (int) (self::MODULUS / 3);
    }

    private function lcg($seed)
    {
        return function () use (&$seed) {
            $seed = ($seed * self::MULTIPLIER) % self::MODULUS;
            return ($seed - 1) / (self::MODULUS - 1);
        };
    }

    private function getFirstCotation($name, $random)
    {
        $base = ord($name[0]);
        $variation = floor($random() * 11);
        return ($base + $variation) * 450;
    }

    private function getDailyVariationPercent($name, $random)
    {
        $positive = $random() > 0.41;
        $useFirstLetter = $random() > 0.5;
        $reference = $useFirstLetter ? ord($name[0]) : ord($name[strlen($name) - 1]);
        $percentage = (floor($random() * 10) + 1) * 0.01;
        $normalized = $reference / 255;
        $deltaPercent = $percentage * $normalized;
        return $positive ? $deltaPercent : -$deltaPercent;
    }
}

#Génère des devis sur 30 jours
#Utilise des fonctions pour la génération initiale et quotidienne des prix
#Garantit l'absence de prix négatifs