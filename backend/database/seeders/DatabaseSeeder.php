<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\ClientAccount;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    
    public function run(): void
    {

        $admin = User::create([
            'first_name' => 'Alicia',
            'last_name' => 'Stone',
            'email' => 'admin@bitchest.example',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
        ]);

        $client = User::create([
            'first_name' => 'Bruno',
            'last_name' => 'Martin',
            'email' => 'bruno@bitchest.example',
            'password' => Hash::make('bruno123'),
            'role' => 'client',
        ]);

        ClientAccount::create([
            'user_id' => $client->id,
            'balance_eur' => 500,
        ]);

        $this->call(CryptoSeeder::class);
    }
}
