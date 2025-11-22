<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cryptocurrency extends Model
{
    use HasFactory;

    protected $fillable = ['symbol', 'name'];

    public function prices()
    {
        return $this->hasMany(PriceHistory::class);
    }
}
