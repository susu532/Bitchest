<?php
// Hedhi les tests mta3 el authentification: login, logout, profil, w gestion des identifiants invalides
namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    // Test login b identifiants s7a7, email ghalet, mot de passe ghalet, profil, w logout
    public function test_user_can_login_with_valid_credentials()
    {
        $user = User::factory()->create([
            'email' => 'test@bitchest.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/auth/login', [
            'email' => 'test@bitchest.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'user' => [
                    'id',
                    'email',
                ],
            ])
            ->assertJson([
                'success' => true,
                'user' => [
                    'email' => 'test@bitchest.com',
                ],
            ]);
    }

    public function test_login_fails_with_invalid_email()
    {
        $response = $this->postJson('/auth/login', [
            'email' => 'nonexistent@bitchest.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_login_fails_with_wrong_password()
    {
        User::factory()->create([
            'email' => 'test@bitchest.com',
            'password' => bcrypt('correctpassword'),
        ]);

        $response = $this->postJson('/auth/login', [
            'email' => 'test@bitchest.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_get_profile()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'web')
            ->getJson('/auth/me');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'user' => [
                    'id' => (string) $user->id,
                    'email' => $user->email,
                ],
            ]);
    }

    public function test_unauthenticated_user_cannot_access_profile()
    {
        $response = $this->getJson('/auth/me');

        $response->assertStatus(401);
    }

    public function test_user_can_logout()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'web')
            ->postJson('/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Logged out successfully',
            ]);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);
    }
}
