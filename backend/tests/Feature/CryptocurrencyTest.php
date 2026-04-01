<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Cryptocurrency;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CryptocurrencyTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test: Récupération de la liste des cryptomonnaies
     */
    public function test_can_get_all_cryptocurrencies()
    {
        // Arrange: Créer un utilisateur authentifié
        $user = User::factory()->create();

        // Créer quelques cryptos
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

        // Act: Récupérer la liste
        $response = $this->actingAs($user, 'web')
            ->getJson('/cryptocurrencies');

        \App\Models\CryptoPrice::create(['crypto_id' => 'BTC', 'price' => 42000, 'price_date' => now()]);
        \App\Models\CryptoPrice::create(['crypto_id' => 'ETH', 'price' => 2500, 'price_date' => now()]);

        // Assert: Vérifier la réponse
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'cryptoAssets',
            ]);

        $this->assertCount(2, $response->json('cryptoAssets'));
    }

    /**
     * Test: Récupération d'une crypto spécifique
     */
    public function test_can_get_single_cryptocurrency()
    {
        // Arrange
        $user = User::factory()->create();

        Cryptocurrency::create([
            'id' => 'BTC',
            'name' => 'Bitcoin',
            'symbol' => 'BTC',
            'icon' => 'btc.png',
            'current_price' => 42000.00,
        ]);

        \App\Models\CryptoPrice::create(['crypto_id' => 'BTC', 'price' => 42000, 'price_date' => now()]);

        // Act
        $response = $this->actingAs($user, 'web')
            ->getJson('/cryptocurrencies/BTC');

        // Assert
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

    /**
     * Test: Erreur 404 pour une crypto inexistante
     */
    public function test_returns_404_for_nonexistent_cryptocurrency()
    {
        // Arrange
        $user = User::factory()->create();

        // Act: Chercher une crypto qui n'existe pas
        $response = $this->actingAs($user, 'web')
            ->getJson('/cryptocurrencies/FAKE');

        // Assert
        $response->assertStatus(404);
    }

    /**
     * Test: Accès refusé sans authentification
     */
    public function test_unauthenticated_user_cannot_access_cryptocurrencies()
    {
        // Arrange: Créer une crypto
        Cryptocurrency::create([
            'id' => 'BTC',
            'name' => 'Bitcoin',
            'symbol' => 'BTC',
            'icon' => 'btc.png',
            'current_price' => 42000.00,
        ]);

        // Act: Tenter d'accéder sans token
        $response = $this->getJson('/cryptocurrencies');

        // Assert: Vérifier l'échec (401 Unauthorized)
        $response->assertStatus(401);
    }
}
