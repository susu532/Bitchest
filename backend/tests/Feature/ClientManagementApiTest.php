<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\ClientAccount;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ClientManagementApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test admin can create a new client.
     */
    public function test_admin_can_create_client()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin);

        $response = $this->postJson('/clients', [
            'firstName' => 'John',
            'lastName' => 'Client',
            'email' => 'john.client@example.com',
        ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'user' => [
                    'id',
                    'firstName',
                    'lastName',
                    'email',
                    'role',
                ],
                'temporaryPassword',
            ]);

        // Verify user was created with client role
        $this->assertDatabaseHas('users', [
            'email' => 'john.client@example.com',
            'role' => 'client',
        ]);
    }

    /**
     * Test new client receives 500 EUR initial balance.
     */
    public function test_new_client_receives_500_eur_balance()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin);

        $response = $this->postJson('/clients', [
            'firstName' => 'Jane',
            'lastName' => 'Doe',
            'email' => 'jane@example.com',
        ]);

        $response->assertStatus(201);

        // Find the created user
        $user = User::where('email', 'jane@example.com')->first();
        $account = ClientAccount::where('user_id', $user->id)->first();

        $this->assertEquals(500, $account->balance_eur);
    }

    /**
     * Test temporary password is returned on client creation.
     */
    public function test_temporary_password_returned_on_creation()
    {
        $admin = User::factory()->create(['role' => admin']);

        $this->actingAs($admin);

        $response = $this->postJson('/clients', [
            'firstName' => 'Bob',
            'lastName' => 'Smith',
            'email' => 'bob@example.com',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['temporaryPassword']);

        $tempPassword = $response->json('temporaryPassword');
        $this->assertNotEmpty($tempPassword);
        $this->assertGreaterThanOrEqual(12, strlen($tempPassword));
    }

    /**
     * Test duplicate email prevents client creation.
     */
    public function test_duplicate_email_prevents_creation()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->create(['email' => 'existing@example.com']);

        $this->actingAs($admin);

        $response = $this->postJson('/clients', [
            'firstName' => 'New',
            'lastName' => 'User',
            'email' => 'existing@example.com',
        ]);

        $response->assertStatus(422);
    }

    /**
     * Test admin can update client data.
     */
    public function test_admin_can_update_client()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $client = User::factory()->create(['role' => 'client', 'email' => 'client@example.com']);

        $this->actingAs($admin);

        $response = $this->putJson("/clients/{$client->id}", [
            'firstName' => 'UpdatedFirst',
            'lastName' => 'UpdatedLast',
            'email' => 'updated@example.com',
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('users', [
            'id' => $client->id,
            'first_name' => 'UpdatedFirst',
            'last_name' => 'UpdatedLast',
        ]);
    }

    /**
     * Test admin can delete a client.
     */
    public function test_admin_can_delete_client()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $client = User::factory()->create(['role' => 'client']);
        ClientAccount::factory()->create(['user_id' => $client->id]);

        $this->actingAs($admin);

        $response = $this->deleteJson("/clients/{$client->id}");

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        // Verify user and account were deleted
        $this->assertDatabaseMissing('users', ['id' => $client->id]);
        $this->assertDatabaseMissing('client_accounts', ['user_id' => $client->id]);
    }

    /**
     * Test non-admin cannot create clients.
     */
    public function test_non_admin_cannot_create_client()
    {
        $client = User::factory()->create(['role' => 'client']);

        $this->actingAs($client);

        $response = $this->postJson('/clients', [
            'firstName' => 'New',
            'lastName' => 'Client',
            'email' => 'new@example.com',
        ]);

        $response->assertStatus(403);
    }

    /**
     * Test unauthenticated user cannot manage clients.
     */
    public function test_unauthenticated_cannot_manage_clients()
    {
        $response = $this->postJson('/clients', [
            'firstName' => 'New',
            'lastName' => 'Client',
            'email' => 'new@example.com',
        ]);

        $response->assertStatus(403);
    }

    /**
     * Test admin can view all users.
     */
    public function test_admin_can_view_all_users()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory(3)->create(['role' => 'client']);

        $this->actingAs($admin);

        $response = $this->getJson('/users');

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure(['users']);

        $this->assertCount(4, $response->json('users'));
    }
}
