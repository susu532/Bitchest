<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test: Un utilisateur peut se connecter avec des identifiants valides
     */
    public function test_user_can_login_with_valid_credentials()
    {
        // Arrange: Créer un utilisateur de test
        $user = User::factory()->create([
            'email' => 'test@bitchest.com',
            'password' => bcrypt('password123'),
        ]);

        // Act: Envoyer la requête de login
        $response = $this->postJson('/api/login', [
            'email' => 'test@bitchest.com',
            'password' => 'password123',
        ]);

        // Assert: Vérifier le succès
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'token',
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'role',
                    ],
                ],
            ])
            ->assertJson([
                'success' => true,
            ]);

        // Vérifier que le token a été créé
        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);
    }

    /**
     * Test: La connexion échoue avec un email invalide
     */
    public function test_login_fails_with_invalid_email()
    {
        // Act: Tenter de se connecter avec un email inexistant
        $response = $this->postJson('/api/login', [
            'email' => 'nonexistent@bitchest.com',
            'password' => 'password123',
        ]);

        // Assert: Vérifier l'échec
        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
            ]);
    }

    /**
     * Test: La connexion échoue avec un mot de passe incorrect
     */
    public function test_login_fails_with_wrong_password()
    {
        // Arrange: Créer un utilisateur
        User::factory()->create([
            'email' => 'test@bitchest.com',
            'password' => bcrypt('correctpassword'),
        ]);

        // Act: Tenter de se connecter avec un mauvais mot de passe
        $response = $this->postJson('/api/login', [
            'email' => 'test@bitchest.com',
            'password' => 'wrongpassword',
        ]);

        // Assert: Vérifier l'échec
        $response->assertStatus(401);
    }

    /**
     * Test: Un utilisateur authentifié peut récupérer ses informations
     */
    public function test_authenticated_user_can_get_profile()
    {
        // Arrange: Créer et authentifier un utilisateur
        $user = User::factory()->create();

        // Act: Récupérer le profil
        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/user');

        // Assert: Vérifier la réponse
        $response->assertStatus(200)
            ->assertJson([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]);
    }

    /**
     * Test: Un utilisateur non authentifié ne peut pas accéder au profil
     */
    public function test_unauthenticated_user_cannot_access_profile()
    {
        // Act: Tenter d'accéder au profil sans authentification
        $response = $this->getJson('/api/user');

        // Assert: Vérifier l'échec (401 Unauthorized)
        $response->assertStatus(401);
    }

    /**
     * Test: Un utilisateur peut se déconnecter
     */
    public function test_user_can_logout()
    {
        // Arrange: Créer un utilisateur et le connecter
        $user = User::factory()->create();

        // Act: Se déconnecter
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/logout');

        // Assert: Vérifier le succès
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Logged out successfully',
            ]);

        // Vérifier que le token a été révoqué
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);
    }
}
