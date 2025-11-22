<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'first_name' => 'Alicia',
            'last_name' => 'Stone',
            'email' => 'admin@bitchest.example',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'balance_eur' => 500,
        ]);

        // Create client user
        User::create([
            'first_name' => 'Bruno',
            'last_name' => 'Martin',
            'email' => 'bruno@bitchest.example',
            'password' => Hash::make('bruno123'),
            'role' => 'client',
            'balance_eur' => 1250,
        ]);
    }
}
