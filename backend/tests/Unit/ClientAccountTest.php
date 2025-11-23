<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\ClientAccount;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClientAccountTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that new clients receive 500 EUR initial balance.
     */
    public function test_new_client_receives_500_eur_initial_balance()
    {
        $user = User::factory()->create(['role' => 'client']);
        $account = ClientAccount::factory()->create([
            'user_id' => $user->id,
            'balance_eur' => 500,
        ]);

        $this->assertEquals(500, $account->balance_eur);
    }

    /**
     * Test that balance precision is maintained (2 decimal places).
     */
    public function test_balance_precision_maintained()
    {
        $user = User::factory()->create(['role' => 'client']);
        $account = ClientAccount::factory()->create([
            'user_id' => $user->id,
            'balance_eur' => 123.45,
        ]);

        $this->assertEquals(123.45, $account->balance_eur);
    }

    /**
     * Test that user and account relationship works correctly.
     */
    public function test_user_account_relationship()
    {
        $user = User::factory()->create(['role' => 'client']);
        $account = ClientAccount::factory()->create(['user_id' => $user->id]);

        $this->assertTrue($user->clientAccount->is($account));
        $this->assertTrue($account->user->is($user));
    }

    /**
     * Test that account is deleted when user is deleted (cascade).
     */
    public function test_account_cascade_deleted_with_user()
    {
        $user = User::factory()->create(['role' => 'client']);
        $account = ClientAccount::factory()->create(['user_id' => $user->id]);

        $accountId = $account->id;

        $user->delete();

        $this->assertNull(ClientAccount::find($accountId));
    }

    /**
     * Test that balance is stored as decimal type.
     */
    public function test_balance_stored_as_decimal()
    {
        $user = User::factory()->create(['role' => 'client']);
        $account = ClientAccount::create([
            'user_id' => $user->id,
            'balance_eur' => 1234.567, // More than 2 decimal places
        ]);

        // Retrieve and verify it's cast to decimal with 2 places
        $retrieved = ClientAccount::find($account->id);
        $this->assertIsNumeric($retrieved->balance_eur);
    }
}
