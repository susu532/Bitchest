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
            'current_price' => 42000.00,
        ]);

        Cryptocurrency::create([
            'id' => 'ETH',
            'name' => 'Ethereum',
            'symbol' => 'ETH',
            'current_price' => 2500.00,
        ]);

        // Act: Récupérer la liste
        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/cryptocurrencies');

        // Assert: Vérifier la réponse
        $response->assertStatus(200)
            ->assertJsonCount(2, 'data')
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'symbol',
                        'current_price',
                    ],
                ],
            ]);
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
            'current_price' => 42000.00,
        ]);

        // Act
        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/cryptocurrencies/BTC');

        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => 'BTC',
                    'name' => 'Bitcoin',
                    'symbol' => 'BTC',
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
        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/cryptocurrencies/FAKE');

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
            'current_price' => 42000.00,
        ]);

        // Act: Tenter d'accéder sans token
        $response = $this->getJson('/api/cryptocurrencies');

        // Assert: Vérifier l'échec (401 Unauthorized)
        $response->assertStatus(401);
    }
}
