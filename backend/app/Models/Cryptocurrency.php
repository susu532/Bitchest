<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cryptocurrency extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'symbol',
        'icon',
    ];

    public function prices()
    {
        return $this->hasMany(CryptoPrice::class, 'crypto_id', 'id');
    }

    public function transactions()
    {
        return $this->hasMany(WalletTransaction::class, 'crypto_id', 'id');
    }
}
