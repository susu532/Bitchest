<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class CryptoPriceFactory extends Factory
{
    
    public function definition(): array
    {
        return [
            'price_date' => fake()->dateTimeBetween('-30 days', 'now')->format('Y-m-d'),
            'price' => fake()->randomFloat(2, 100, 50000),
        ];
    }
}
