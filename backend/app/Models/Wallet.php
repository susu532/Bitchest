<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Wallet extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'cryptocurrency_id', 'amount'];

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function crypto()
    {
        return $this->belongsTo(Cryptocurrency::class);
    }
}
