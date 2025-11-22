<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Cryptocurrency;

class CryptoSeeder extends Seeder
{
    public function run()
    {
        $list = [
            ['symbol'=>'BTC','name'=>'Bitcoin'],
            ['symbol'=>'ETH','name'=>'Ethereum'],
            ['symbol'=>'XRP','name'=>'Ripple'],
            ['symbol'=>'BCH','name'=>'Bitcoin Cash'],
            ['symbol'=>'ADA','name'=>'Cardano'],
            ['symbol'=>'LTC','name'=>'Litecoin'],
            ['symbol'=>'XEM','name'=>'NEM'],
            ['symbol'=>'XLM','name'=>'Stellar'],
            ['symbol'=>'IOTA','name'=>'IOTA'],
            ['symbol'=>'DASH','name'=>'Dash']
        ];

        foreach ($list as $c) {
            Cryptocurrency::updateOrCreate(['symbol' => $c['symbol']], $c);
        }
    }
}
