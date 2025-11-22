<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cryptocurrency extends Model
{
    protected $fillable = ['name', 'symbol', 'icon'];

    /**
     * Get the prices for this cryptocurrency.
     */
    public function prices()
    {
        return $this->hasMany(CryptocurrencyPrice::class);
    }

    /**
     * Get the wallet transactions for this cryptocurrency.
     */
    public function walletTransactions()
    {
        return $this->hasMany(WalletTransaction::class);
    }
}
