<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WalletTransaction extends Model
{
    
    protected $fillable = [
        'user_id',
        'crypto_id',
        'quantity',
        'price_per_unit',
        'type',
        'transaction_date',
    ];

    
    protected function casts()
    {

        return [

            'transaction_date' => 'datetime',
        ];
    }

    
    public function user()
    {

        return $this->belongsTo(User::class);
    }

    
    public function cryptocurrency()
    {

        return $this->belongsTo(Cryptocurrency::class, 'crypto_id', 'id');
    }
}
