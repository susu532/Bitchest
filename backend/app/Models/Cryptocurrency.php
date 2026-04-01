<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cryptocurrency extends Model
{
    use HasFactory;

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

        return $this->hasMany(CryptoPrice::class, 'crypto_id', 'id')->orderBy('price_date', 'asc');
    }

    
    public function transactions()
    {

        return $this->hasMany(WalletTransaction::class, 'crypto_id', 'id');
    }
}
