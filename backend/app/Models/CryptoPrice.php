<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CryptoPrice extends Model
{
    
    protected $fillable = [
        'crypto_id',
        'price_date',
        'price',
    ];

    
    protected function casts()
    {

        return [

            'price_date' => 'date',
        ];
    }

    
    public function cryptocurrency()
    {

        return $this->belongsTo(Cryptocurrency::class, 'crypto_id', 'id');
    }
}
