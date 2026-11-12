<?php
// Hedhi les tests mta3 les cryptomonnaies: listing, détails, 404 lel crypto mafammech, w accès bla auth
namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Cryptocurrency;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CryptocurrencyTest extends TestCase
{
    use RefreshDatabase;

    // Test njibou liste el cryptos, crypto wa7da, w nvérifiw el accès
    public function test_can_get_all_cryptocurrencies()
    {
        $user = User::factory()->create();

        Cryptocurrency::create([
            'id' => 'BTC',
            'name' => 'Bitcoin',
            'symbol' => 'BTC',
            'icon' => 'btc.png',
            'current_price' => 42000.00,
        ]);

        Cryptocurrency::create([
            'id' => 'ETH',
            'name' => 'Ethereum',
            'symbol' => 'ETH',
            'icon' => 'eth.png',
            'current_price' => 2500.00,
        ]);

        $response = $this->actingAs($user, 'web')
            ->getJson('/cryptocurrencies');

        \App\Models\CryptoPrice::create(['crypto_id' => 'BTC', 'price' => 42000, 'price_date' => now()]);
        \App\Models\CryptoPrice::create(['crypto_id' => 'ETH', 'price' => 2500, 'price_date' => now()]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'cryptoAssets',
            ]);

        $this->assertCount(2, $response->json('cryptoAssets'));
    }

    public function test_can_get_single_cryptocurrency()
    {
        $user = User::factory()->create();

        Cryptocurrency::create([
            'id' => 'BTC',
            'name' => 'Bitcoin',
            'symbol' => 'BTC',
            'icon' => 'btc.png',
            'current_price' => 42000.00,
        ]);

        \App\Models\CryptoPrice::create(['crypto_id' => 'BTC', 'price' => 42000, 'price_date' => now()]);

        $response = $this->actingAs($user, 'web')
            ->getJson('/cryptocurrencies/BTC');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'crypto' => [
                    'id' => 'BTC',
                    'name' => 'Bitcoin',
                    'symbol' => 'BTC',
                    'currentPrice' => 42000,
                ],
            ]);
    }

    public function test_returns_404_for_nonexistent_cryptocurrency()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'web')
            ->getJson('/cryptocurrencies/FAKE');

        $response->assertStatus(404);
    }

    public function test_unauthenticated_user_cannot_access_cryptocurrencies()
    {
        Cryptocurrency::create([
            'id' => 'BTC',
            'name' => 'Bitcoin',
            'symbol' => 'BTC',
            'icon' => 'btc.png',
            'current_price' => 42000.00,
        ]);

        $response = $this->getJson('/cryptocurrencies');

        $response->assertStatus(401);
    }
}
