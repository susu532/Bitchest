<?php

namespace Database\Seeders;

use App\Models\Cryptocurrency;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CryptocurrencySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cryptocurrencies = [
            ['name' => 'Bitcoin', 'symbol' => 'BTC', 'icon' => '/assets/bitcoin.png'],
            ['name' => 'Ethereum', 'symbol' => 'ETH', 'icon' => '/assets/ethereum.png'],
            ['name' => 'Ripple', 'symbol' => 'XRP', 'icon' => '/assets/ripple.png'],
            ['name' => 'Bitcoin Cash', 'symbol' => 'BCH', 'icon' => '/assets/bitcoin-cash.png'],
            ['name' => 'Cardano', 'symbol' => 'ADA', 'icon' => '/assets/cardano.png'],
            ['name' => 'Litecoin', 'symbol' => 'LTC', 'icon' => '/assets/litecoin.png'],
            ['name' => 'NEM', 'symbol' => 'XEM', 'icon' => '/assets/nem.png'],
            ['name' => 'Stellar', 'symbol' => 'XLM', 'icon' => '/assets/stellar.png'],
            ['name' => 'IOTA', 'symbol' => 'MIOTA', 'icon' => '/assets/iota.png'],
            ['name' => 'Dash', 'symbol' => 'DASH', 'icon' => '/assets/dash.png'],
        ];

        foreach ($cryptocurrencies as $crypto) {
            Cryptocurrency::create($crypto);
        }
    }
}
