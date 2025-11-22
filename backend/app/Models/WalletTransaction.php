<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WalletTransaction extends Model
{
    protected $fillable = [
        'user_id',
        'cryptocurrency_id',
        'type',
        'quantity',
        'price_per_unit',
        'transaction_date',
    ];

    protected $casts = [
        'transaction_date' => 'datetime',
    ];

    /**
     * Get the user who owns this transaction.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the cryptocurrency involved in this transaction.
     */
    public function cryptocurrency()
    {
        return $this->belongsTo(Cryptocurrency::class);
    }
}
