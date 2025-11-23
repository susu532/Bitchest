<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\ClientAccount;
use App\Models\Cryptocurrency;
use App\Models\WalletTransaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WalletApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test authenticated client can buy cryptocurrency.
     */
    public function test_client_can_buy_cryptocurrency()
    {
        $client = User::factory()->create(['role' => 'client']);
        $account = ClientAccount::factory()->create([
            'user_id' => $client->id,
            'balance_eur' => 1000,
        ]);
        $crypto = Cryptocurrency::factory()->create();

        $this->actingAs($client);

        $response = $this->postJson('/wallet/buy', [
            'cryptoId' => $crypto->id,
            'quantity' => 0.5,
            'pricePerUnit' => 20000,
        ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'transaction' => [
                    'id',
                    'cryptoId',
                    'quantity',
                    'pricePerUnit',
                    'type',
                    'timestamp',
                ],
                'newBalance',
            ]);

        // Verify transaction was created
        $this->assertDatabaseHas('wallet_transactions', [
            'user_id' => $client->id,
            'crypto_id' => $crypto->id,
            'quantity' => 0.5,
            'type' => 'buy',
        ]);

        // Verify balance was deducted
        $updatedAccount = ClientAccount::find($account->id);
        $this->assertEquals(990, $updatedAccount->balance_eur);
    }

    /**
     * Test buy fails with insufficient balance.
     */
    public function test_buy_fails_with_insufficient_balance()
    {
        $client = User::factory()->create(['role' => 'client']);
        $account = ClientAccount::factory()->create([
            'user_id' => $client->id,
            'balance_eur' => 100,
        ]);
        $crypto = Cryptocurrency::factory()->create();

        $this->actingAs($client);

        $response = $this->postJson('/wallet/buy', [
            'cryptoId' => $crypto->id,
            'quantity' => 1,
            'pricePerUnit' => 20000,
        ]);

        $response->assertStatus(400)
            ->assertJson(['success' => false]);
    }

    /**
     * Test authenticated client can sell cryptocurrency.
     */
    public function test_client_can_sell_cryptocurrency()
    {
        $client = User::factory()->create(['role' => 'client']);
        $account = ClientAccount::factory()->create([
            'user_id' => $client->id,
            'balance_eur' => 1000,
        ]);
        $crypto = Cryptocurrency::factory()->create();

        // First, create a buy transaction
        WalletTransaction::create([
            'user_id' => $client->id,
            'crypto_id' => $crypto->id,
            'quantity' => 1,
            'price_per_unit' => 20000,
            'type' => 'buy',
            'transaction_date' => now(),
        ]);

        $this->actingAs($client);

        $response = $this->postJson('/wallet/sell', [
            'cryptoId' => $crypto->id,
            'quantity' => 0.5,
            'pricePerUnit' => 25000,
        ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);

        // Verify balance was credited
        $updatedAccount = ClientAccount::find($account->id);
        $this->assertEquals(1012.5, $updatedAccount->balance_eur);
    }

    /**
     * Test sell fails with insufficient holdings.
     */
    public function test_sell_fails_with_insufficient_holdings()
    {
        $client = User::factory()->create(['role' => 'client']);
        $account = ClientAccount::factory()->create([
            'user_id' => $client->id,
            'balance_eur' => 1000,
        ]);
        $crypto = Cryptocurrency::factory()->create();

        // Create minimal buy transaction
        WalletTransaction::create([
            'user_id' => $client->id,
            'crypto_id' => $crypto->id,
            'quantity' => 0.1,
            'price_per_unit' => 20000,
            'type' => 'buy',
            'transaction_date' => now(),
        ]);

        $this->actingAs($client);

        $response = $this->postJson('/wallet/sell', [
            'cryptoId' => $crypto->id,
            'quantity' => 1, // Trying to sell more than owned
            'pricePerUnit' => 25000,
        ]);

        $response->assertStatus(400)
            ->assertJson(['success' => false]);
    }

    /**
     * Test client cannot access wallet without authentication.
     */
    public function test_wallet_endpoints_require_authentication()
    {
        $crypto = Cryptocurrency::factory()->create();

        $response = $this->postJson('/wallet/buy', [
            'cryptoId' => $crypto->id,
            'quantity' => 1,
            'pricePerUnit' => 20000,
        ]);

        $response->assertStatus(403);
    }

    /**
     * Test admin cannot use wallet endpoints.
     */
    public function test_admin_cannot_use_wallet_endpoints()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $crypto = Cryptocurrency::factory()->create();

        $this->actingAs($admin);

        $response = $this->postJson('/wallet/buy', [
            'cryptoId' => $crypto->id,
            'quantity' => 1,
            'pricePerUnit' => 20000,
        ]);

        $response->assertStatus(403);
    }

    /**
     * Test wallet summary returns correct data.
     */
    public function test_wallet_summary_returns_correct_data()
    {
        $client = User::factory()->create(['role' => 'client']);
        $account = ClientAccount::factory()->create([
            'user_id' => $client->id,
            'balance_eur' => 1000,
        ]);
        $crypto = Cryptocurrency::factory()->create();

        WalletTransaction::create([
            'user_id' => $client->id,
            'crypto_id' => $crypto->id,
            'quantity' => 1,
            'price_per_unit' => 20000,
            'type' => 'buy',
            'transaction_date' => now(),
        ]);

        $this->actingAs($client);

        $response = $this->getJson('/wallet/summary');

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'wallet' => [
                    'balanceEUR',
                    'holdings',
                ],
            ]);
    }
}
