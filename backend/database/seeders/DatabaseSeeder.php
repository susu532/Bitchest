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
        $admin = User::firstOrCreate(
            ['email' => 'admin@bitchest.example'],
            [
                'first_name' => 'Alicia',
                'last_name' => 'Stone',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]
        );

        $client = User::firstOrCreate(
            ['email' => 'bruno@bitchest.example'],
            [
                'first_name' => 'Bruno',
                'last_name' => 'Martin',
                'password' => Hash::make('bruno123'),
                'role' => 'client',
            ]
        );

        ClientAccount::firstOrCreate(
            ['user_id' => $client->id],
            ['balance_eur' => 500]
        );

        $this->call(CryptoSeeder::class);
    }
}
