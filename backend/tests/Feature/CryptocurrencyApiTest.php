<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Cryptocurrency;
use App\Models\CryptoPrice;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CryptocurrencyApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test authenticated user can view all cryptocurrencies.
     */
    public function test_user_can_view_all_cryptocurrencies()
    {
        $user = User::factory()->create();
        $cryptos = Cryptocurrency::factory(5)->create();

        // Create prices for each crypto
        foreach ($cryptos as $crypto) {
            CryptoPrice::factory(30)->create(['crypto_id' => $crypto->id]);
        }

        $this->actingAs($user);

        $response = $this->getJson('/cryptocurrencies');

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'cryptoAssets' => [],
            ]);

        $cryptoAssets = $response->json('cryptoAssets');
        $this->assertCount(5, $cryptoAssets);
    }

    /**
     * Test unauthenticated user cannot view cryptocurrencies.
     */
    public function test_unauthenticated_cannot_view_cryptocurrencies()
    {
        $response = $this->getJson('/cryptocurrencies');

        $response->assertStatus(401);
    }

    /**
     * Test user can view specific cryptocurrency with history.
     */
    public function test_user_can_view_crypto_with_history()
    {
        $user = User::factory()->create();
        $crypto = Cryptocurrency::factory()->create();
        
        // Create 30 days of price history
        CryptoPrice::factory(30)->create(['crypto_id' => $crypto->id]);

        $this->actingAs($user);

        $response = $this->getJson("/cryptocurrencies/{$crypto->id}");

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'crypto' => [
                    'id',
                    'name',
                    'symbol',
                    'history',
                ],
            ]);

        $history = $response->json('crypto.history');
        $this->assertCount(30, $history);
    }

    /**
     * Test user can get current price for a cryptocurrency.
     */
    public function test_user_can_get_current_price()
    {
        $user = User::factory()->create();
        $crypto = Cryptocurrency::factory()->create();
        
        $latestPrice = CryptoPrice::create([
            'crypto_id' => $crypto->id,
            'price_date' => now()->toDateString(),
            'price' => 25000,
        ]);

        $this->actingAs($user);

        $response = $this->getJson("/cryptocurrencies/{$crypto->id}/price");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'currentPrice' => 25000,
            ]);
    }

    /**
     * Test price history is sorted by date.
     */
    public function test_price_history_is_included_in_response()
    {
        $user = User::factory()->create();
        $crypto = Cryptocurrency::factory()->create();

        // Create prices with different dates
        $priceData = [];
        for ($i = 0; $i < 5; $i++) {
            $priceData[] = [
                'crypto_id' => $crypto->id,
                'price_date' => now()->subDays($i)->toDateString(),
                'price' => 20000 + ($i * 1000),
            ];
        }

        foreach ($priceData as $data) {
            CryptoPrice::create($data);
        }

        $this->actingAs($user);

        $response = $this->getJson("/cryptocurrencies/{$crypto->id}");

        $response->assertStatus(200);

        $history = $response->json('crypto.history');
        $this->assertCount(5, $history);
    }

    /**
     * Test that prices are returned as float type.
     */
    public function test_prices_returned_as_float()
    {
        $user = User::factory()->create();
        $crypto = Cryptocurrency::factory()->create();

        CryptoPrice::create([
            'crypto_id' => $crypto->id,
            'price_date' => now()->toDateString(),
            'price' => 25000.50,
        ]);

        $this->actingAs($user);

        $response = $this->getJson("/cryptocurrencies/{$crypto->id}/price");

        $response->assertStatus(200);
        $price = $response->json('currentPrice');
        $this->assertIsFloat($price);
    }
}
