<?php
// Hedha el model User: yrepresenti el utilisateur fel système, fih el relations m3a walletTransactions w clientAccount
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasFactory;

    // El fillable y7ami mel mass assignment: ken el champs hedhouma yanejmou yetbadlou
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    // Relation hasMany: user wahda 3andou barcha transactions mta3 crypto
    public function walletTransactions()
    {
        return $this->hasMany(WalletTransaction::class);
    }

    // Relation hasOne: kol client 3andou compte wahda fih el solde bel euro
    public function clientAccount()
    {
        return $this->hasOne(ClientAccount::class);
    }
}
