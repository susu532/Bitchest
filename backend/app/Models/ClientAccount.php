<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClientAccount extends Model
{
    
    protected $fillable = [
        'user_id',
        'balance_eur',
    ];

    
    protected function casts()
    {

        return [

            'balance_eur' => 'decimal:2',
        ];
    }

    
    public function user()
    {

        return $this->belongsTo(User::class);
    }
}
