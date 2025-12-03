<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClientAccountFactory extends Factory
{
    
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'balance_eur' => fake()->randomFloat(2, 100, 10000),
        ];
    }
}
