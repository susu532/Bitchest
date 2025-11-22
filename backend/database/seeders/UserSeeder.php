<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Create admin account
        User::updateOrCreate(['email' => 'admin@bitchest.test'], [
            'name' => 'Admin',
            'password' => Hash::make('admin1234'),
            'role' => 'admin',
            'balance' => 0
        ]);

        // Create a sample client with €500 balance
        User::updateOrCreate(['email' => 'client@bitchest.test'], [
            'name' => 'Client',
            'password' => Hash::make('client1234'),
            'role' => 'client',
            'balance' => 500
        ]);
    }
}
