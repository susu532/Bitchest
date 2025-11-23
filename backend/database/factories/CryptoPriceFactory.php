<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CryptoPrice>
 */
class CryptoPriceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'price_date' => fake()->dateTimeBetween('-30 days', 'now')->format('Y-m-d'),
            'price' => fake()->randomFloat(2, 100, 50000),
        ];
    }
}
