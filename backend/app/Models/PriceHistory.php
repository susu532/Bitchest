<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PriceHistory extends Model
{
    use HasFactory;

    protected $fillable = ['cryptocurrency_id', 'date', 'price'];

    public $timestamps = false;

    public function crypto()
    {
        return $this->belongsTo(Cryptocurrency::class);
    }
}
