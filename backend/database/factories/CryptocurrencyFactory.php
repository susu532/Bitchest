<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class CryptocurrencyFactory extends Factory
{
    
    public function definition(): array
    {
        static $count = 0;
        $cryptos = [
            ['name' => 'Bitcoin', 'symbol' => 'BTC', 'icon' => 'bitcoin.svg'],
            ['name' => 'Ethereum', 'symbol' => 'ETH', 'icon' => 'ethereum.svg'],
            ['name' => 'Ripple', 'symbol' => 'XRP', 'icon' => 'ripple.svg'],
            ['name' => 'Bitcoin Cash', 'symbol' => 'BCH', 'icon' => 'bitcoin-cash.svg'],
            ['name' => 'Cardano', 'symbol' => 'ADA', 'icon' => 'cardano.svg'],
            ['name' => 'Litecoin', 'symbol' => 'LTC', 'icon' => 'litecoin.svg'],
            ['name' => 'NEM', 'symbol' => 'XEM', 'icon' => 'nem.svg'],
            ['name' => 'Stellar', 'symbol' => 'XLM', 'icon' => 'stellar.svg'],
            ['name' => 'IOTA', 'symbol' => 'IOT', 'icon' => 'iota.svg'],
            ['name' => 'Dash', 'symbol' => 'DASH', 'icon' => 'dash.svg'],
        ];

        $crypto = $cryptos[$count % count($cryptos)];
        $count++;

        return [
            'id' => $crypto['symbol'],
            'name' => $crypto['name'],
            'symbol' => $crypto['symbol'],
            'icon' => $crypto['icon'],
        ];
    }
}
