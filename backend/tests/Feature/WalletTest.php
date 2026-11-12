<?php
// Hedhi les tests mta3 el wallet: chira, bey3, solde insuffisant, w validation mta3 les données
namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\ClientAccount;
use App\Models\Cryptocurrency;
use App\Models\WalletTransaction;
use Illuminate\Foundation\Testing\RefreshDatabase;

class WalletTest extends TestCase
{
    use RefreshDatabase;

    // Test chira crypto: nvérifiw el transaction tetkhla9 w el solde yen9es kima lazem
    public function test_client_can_buy_cryptocurrency()
    {
        $user = User::factory()->create(['role' => 'client']);
        ClientAccount::create([
            'user_id' => $user->id,
            'balance_eur' => 10000.00,
        ]);

        $crypto = Cryptocurrency::create([
            'id' => 'BTC',
            'name' => 'Bitcoin',
            'symbol' => 'BTC',
            'icon' => 'btc.png',
            'current_price' => 40000.00,
        ]);

        $response = $this->actingAs($user, 'web')
            ->postJson('/wallet/buy', [
                'cryptoId' => 'BTC',
                'quantity' => 0.1,
                'pricePerUnit' => 40000.00,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Purchase successful',
            ]);

        $this->assertDatabaseHas('wallet_transactions', [
            'user_id' => $user->id,
            'crypto_id' => 'BTC',
            'type' => 'buy',
            'quantity' => 0.1,
        ]);

        $this->assertDatabaseHas('client_accounts', [
            'user_id' => $user->id,
            'balance_eur' => 6000.00,
        ]);
    }

    // Test bey3 w edge cases: solde ma yekfich, quantité akther mel mawjouda, w quantité négative
    public function test_cannot_buy_with_insufficient_balance()
    {
        $user = User::factory()->create(['role' => 'client']);
        ClientAccount::create([
            'user_id' => $user->id,
            'balance_eur' => 1000.00,
        ]);

        Cryptocurrency::create([
            'id' => 'BTC',
            'name' => 'Bitcoin',
            'symbol' => 'BTC',
            'icon' => 'btc.png',
            'current_price' => 40000.00,
        ]);

        $response = $this->actingAs($user, 'web')
            ->postJson('/wallet/buy', [
                'cryptoId' => 'BTC',
                'quantity' => 0.1,
                'pricePerUnit' => 40000.00,
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);

        $this->assertDatabaseMissing('wallet_transactions', [
            'user_id' => $user->id,
            'type' => 'buy',
        ]);
    }

    public function test_client_can_sell_cryptocurrency()
    {
        $user = User::factory()->create(['role' => 'client']);
        $account = ClientAccount::create([
            'user_id' => $user->id,
            'balance_eur' => 5000.00,
        ]);

        $crypto = Cryptocurrency::create([
            'id' => 'ETH',
            'name' => 'Ethereum',
            'symbol' => 'ETH',
            'icon' => 'eth.png',
            'current_price' => 2000.00,
        ]);

        WalletTransaction::create([
            'user_id' => $user->id,
            'crypto_id' => 'ETH',
            'type' => 'buy',
            'quantity' => 1.0,
            'price_per_unit' => 2000.00,
            'transaction_date' => now(),
        ]);

        $response = $this->actingAs($user, 'web')
            ->postJson('/wallet/sell', [
                'cryptoId' => 'ETH',
                'quantity' => 0.5,
                'pricePerUnit' => 2000.00,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Sale successful',
            ]);

        $this->assertDatabaseHas('wallet_transactions', [
            'user_id' => $user->id,
            'crypto_id' => 'ETH',
            'type' => 'sell',
            'quantity' => 0.5,
        ]);

        $this->assertDatabaseHas('client_accounts', [
            'user_id' => $user->id,
            'balance_eur' => 6000.00,
        ]);
    }

    public function test_cannot_sell_more_than_owned()
    {
        $user = User::factory()->create(['role' => 'client']);
        ClientAccount::create([
            'user_id' => $user->id,
            'balance_eur' => 5000.00,
        ]);

        Cryptocurrency::create([
            'id' => 'ETH',
            'name' => 'Ethereum',
            'symbol' => 'ETH',
            'icon' => 'eth.png',
            'current_price' => 2000.00,
        ]);

        \DB::table('wallet_transactions')->insert([
            'user_id' => $user->id,
            'crypto_id' => 'ETH',
            'type' => 'buy',
            'quantity' => 1.0,
            'price_per_unit' => 2000.00,
            'transaction_date' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->actingAs($user, 'web')
            ->postJson('/wallet/sell', [
                'cryptoId' => 'ETH',
                'quantity' => 2.0,
                'pricePerUnit' => 2000.00,
            ]);

        $response->assertStatus(422);
        $response->assertJson([
                'success' => false,
                'message' => 'Insufficient ETH holdings. Requested: 2.00000000, Available: 1.00000000',
            ]);
    }

    public function test_client_can_get_wallet_summary()
    {
        $user = User::factory()->create(['role' => 'client']);
        ClientAccount::create([
            'user_id' => $user->id,
            'balance_eur' => 7500.00,
        ]);

        $response = $this->actingAs($user, 'web')
            ->getJson('/wallet/summary');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'wallet' => [
                    'balanceEUR',
                    'holdings',
                ],
            ])
            ->assertJson([
                'success' => true,
                'wallet' => [
                    'balanceEUR' => 7500.00,
                ],
            ]);
    }

    public function test_negative_quantity_is_rejected()
    {
        $user = User::factory()->create(['role' => 'client']);
        ClientAccount::create([
            'user_id' => $user->id,
            'balance_eur' => 10000.00,
        ]);

        Cryptocurrency::create([
            'id' => 'BTC',
            'name' => 'Bitcoin',
            'symbol' => 'BTC',
            'icon' => 'btc.png',
            'current_price' => 40000.00,
        ]);

        $response = $this->actingAs($user, 'web')
            ->postJson('/wallet/buy', [
                'cryptoId' => 'BTC',
                'quantity' => -0.1,
                'pricePerUnit' => 40000.00,
            ]);

        $response->assertStatus(422);
    }
}
