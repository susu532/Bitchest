<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CryptocurrencyPrice extends Model
{
    protected $fillable = ['cryptocurrency_id', 'price_date', 'price'];

    protected $casts = [
        'price_date' => 'date',
    ];

    /**
     * Get the cryptocurrency for this price record.
     */
    public function cryptocurrency()
    {
        return $this->belongsTo(Cryptocurrency::class);
    }
}
