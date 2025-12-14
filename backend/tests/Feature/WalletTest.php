<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\ClientAccount;
use App\Models\Cryptocurrency;
use Illuminate\Foundation\Testing\RefreshDatabase;

class WalletTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test: Un client peut acheter une cryptomonnaie
     */
    public function test_client_can_buy_cryptocurrency()
    {
        // Arrange: Créer un client avec un solde
        $user = User::factory()->create(['role' => 'client']);
        ClientAccount::create([
            'user_id' => $user->id,
            'balance' => 10000.00, // 10,000 EUR
        ]);

        // Créer une crypto avec un prix
        $crypto = Cryptocurrency::create([
            'id' => 'BTC',
            'name' => 'Bitcoin',
            'symbol' => 'BTC',
            'current_price' => 40000.00,
        ]);

        // Act: Acheter 0.1 BTC
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/wallet/buy', [
                'crypto_id' => 'BTC',
                'quantity' => 0.1,
            ]);

        // Assert: Vérifier le succès
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Cryptocurrency purchased successfully',
            ]);

        // Vérifier que la transaction a été créée
        $this->assertDatabaseHas('wallet_transactions', [
            'user_id' => $user->id,
            'crypto_id' => 'BTC',
            'type' => 'buy',
            'quantity' => 0.1,
        ]);

        // Vérifier que le solde a diminué (10000 - 4000 = 6000)
        $this->assertDatabaseHas('client_accounts', [
            'user_id' => $user->id,
            'balance' => 6000.00,
        ]);
    }

    /**
     * Test: Un client ne peut pas acheter si le solde est insuffisant
     */
    public function test_cannot_buy_with_insufficient_balance()
    {
        // Arrange: Créer un client avec un petit solde
        $user = User::factory()->create(['role' => 'client']);
        ClientAccount::create([
            'user_id' => $user->id,
            'balance' => 1000.00, // Seulement 1,000 EUR
        ]);

        Cryptocurrency::create([
            'id' => 'BTC',
            'name' => 'Bitcoin',
            'symbol' => 'BTC',
            'current_price' => 40000.00,
        ]);

        // Act: Tenter d'acheter 0.1 BTC (coûte 4,000 EUR)
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/wallet/buy', [
                'crypto_id' => 'BTC',
                'quantity' => 0.1,
            ]);

        // Assert: Vérifier l'échec
        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
            ]);

        // Vérifier qu'aucune transaction n'a été créée
        $this->assertDatabaseMissing('wallet_transactions', [
            'user_id' => $user->id,
            'type' => 'buy',
        ]);
    }

    /**
     * Test: Un client peut vendre une cryptomonnaie possédée
     */
    public function test_client_can_sell_cryptocurrency()
    {
        // Arrange: Créer un client avec des holdings
        $user = User::factory()->create(['role' => 'client']);
        $account = ClientAccount::create([
            'user_id' => $user->id,
            'balance' => 5000.00,
        ]);

        $crypto = Cryptocurrency::create([
            'id' => 'ETH',
            'name' => 'Ethereum',
            'symbol' => 'ETH',
            'current_price' => 2000.00,
        ]);

        // Créer une transaction d'achat préalable (possède 1 ETH)
        \DB::table('wallet_transactions')->insert([
            'user_id' => $user->id,
            'crypto_id' => 'ETH',
            'type' => 'buy',
            'quantity' => 1.0,
            'price_at_transaction' => 2000.00,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Act: Vendre 0.5 ETH
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/wallet/sell', [
                'crypto_id' => 'ETH',
                'quantity' => 0.5,
            ]);

        // Assert: Vérifier le succès
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Cryptocurrency sold successfully',
            ]);

        // Vérifier que la transaction de vente a été créée
        $this->assertDatabaseHas('wallet_transactions', [
            'user_id' => $user->id,
            'crypto_id' => 'ETH',
            'type' => 'sell',
            'quantity' => 0.5,
        ]);

        // Vérifier que le solde a augmenté (5000 + 1000 = 6000)
        $this->assertDatabaseHas('client_accounts', [
            'user_id' => $user->id,
            'balance' => 6000.00,
        ]);
    }

    /**
     * Test: Un client ne peut pas vendre plus qu'il ne possède
     */
    public function test_cannot_sell_more_than_owned()
    {
        // Arrange: Créer un client qui possède 1 ETH
        $user = User::factory()->create(['role' => 'client']);
        ClientAccount::create([
            'user_id' => $user->id,
            'balance' => 5000.00,
        ]);

        Cryptocurrency::create([
            'id' => 'ETH',
            'name' => 'Ethereum',
            'symbol' => 'ETH',
            'current_price' => 2000.00,
        ]);

        \DB::table('wallet_transactions')->insert([
            'user_id' => $user->id,
            'crypto_id' => 'ETH',
            'type' => 'buy',
            'quantity' => 1.0,
            'price_at_transaction' => 2000.00,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Act: Tenter de vendre 2 ETH (ne possède que 1)
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/wallet/sell', [
                'crypto_id' => 'ETH',
                'quantity' => 2.0,
            ]);

        // Assert: Vérifier l'échec
        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
            ]);
    }

    /**
     * Test: Un client peut récupérer son portefeuille
     */
    public function test_client_can_get_wallet_summary()
    {
        // Arrange: Créer un client
        $user = User::factory()->create(['role' => 'client']);
        ClientAccount::create([
            'user_id' => $user->id,
            'balance' => 7500.00,
        ]);

        // Act: Récupérer le wallet
        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/wallet');

        // Assert: Vérifier la structure
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'balance',
                    'holdings',
                    'total_portfolio_value',
                ],
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'balance' => 7500.00,
                ],
            ]);
    }

    /**
     * Test: Validation - Quantité négative refusée
     */
    public function test_negative_quantity_is_rejected()
    {
        // Arrange
        $user = User::factory()->create(['role' => 'client']);
        ClientAccount::create([
            'user_id' => $user->id,
            'balance' => 10000.00,
        ]);

        Cryptocurrency::create([
            'id' => 'BTC',
            'name' => 'Bitcoin',
            'symbol' => 'BTC',
            'current_price' => 40000.00,
        ]);

        // Act: Tenter d'acheter une quantité négative
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/wallet/buy', [
                'crypto_id' => 'BTC',
                'quantity' => -0.1, // Négatif !
            ]);

        // Assert: Vérifier l'échec de validation
        $response->assertStatus(422); // Unprocessable Entity
    }
}
