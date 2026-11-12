<?php
// Hedha el model WalletTransaction: yrepresenti transaction chira walla bey3 mta3 crypto fel portefeuille
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WalletTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'crypto_id',
        'quantity',
        'price_per_unit',
        'type',
        'transaction_date',
    ];

    // El cast y7awel transaction_date l objet Carbon bech nestaamlou les méthodes mta3 les dates
    protected function casts()
    {
        return [
            'transaction_date' => 'datetime',
        ];
    }

    // Relation belongsTo: kol transaction tebba3 l user wahda
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relation belongsTo m3a Cryptocurrency: kol transaction takhoss crypto wahda
    public function cryptocurrency()
    {
        return $this->belongsTo(Cryptocurrency::class, 'crypto_id', 'id');
    }
}
