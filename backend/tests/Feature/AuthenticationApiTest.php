<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\ClientAccount;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthenticationApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test successful login returns user data.
     */
    public function test_login_successful_with_correct_credentials()
    {
        $password = 'TestPassword123';
        $user = User::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'password' => Hash::make($password),
            'role' => 'admin',
        ]);

        $response = $this->postJson('/auth/login', [
            'email' => 'john@example.com',
            'password' => $password,
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'user' => [
                    'id',
                    'firstName',
                    'lastName',
                    'email',
                    'role',
                    'createdAt',
                    'updatedAt',
                ],
            ]);
    }

    /**
     * Test login fails with incorrect password.
     */
    public function test_login_fails_with_incorrect_password()
    {
        $password = 'CorrectPassword123';
        User::create([
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'jane@example.com',
            'password' => Hash::make($password),
            'role' => 'client',
        ]);

        $response = $this->postJson('/auth/login', [
            'email' => 'jane@example.com',
            'password' => 'WrongPassword123',
        ]);

        $response->assertStatus(401)
            ->assertJson(['success' => false]);
    }

    /**
     * Test login fails with non-existent email.
     */
    public function test_login_fails_with_non_existent_email()
    {
        $response = $this->postJson('/auth/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(401)
            ->assertJson(['success' => false]);
    }

    /**
     * Test password change requires authentication.
     */
    public function test_password_change_requires_authentication()
    {
        $response = $this->postJson('/auth/change-password', [
            'currentPassword' => 'old',
            'newPassword' => 'new123',
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test authenticated user can change password.
     */
    public function test_authenticated_user_can_change_password()
    {
        $oldPassword = 'OldPassword123';
        $newPassword = 'NewPassword456';

        $user = User::create([
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'password' => Hash::make($oldPassword),
            'role' => 'client',
        ]);

        $this->actingAs($user);

        $response = $this->postJson('/auth/change-password', [
            'currentPassword' => $oldPassword,
            'newPassword' => $newPassword,
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        // Verify password was actually changed
        $updatedUser = User::find($user->id);
        $this->assertTrue(Hash::check($newPassword, $updatedUser->password));
    }

    /**
     * Test password change fails with wrong current password.
     */
    public function test_password_change_fails_with_wrong_current_password()
    {
        $user = User::create([
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'password' => Hash::make('CorrectPassword123'),
            'role' => 'client',
        ]);

        $this->actingAs($user);

        $response = $this->postJson('/auth/change-password', [
            'currentPassword' => 'WrongPassword123',
            'newPassword' => 'NewPassword456',
        ]);

        $response->assertStatus(401)
            ->assertJson(['success' => false]);
    }

    /**
     * Test logout clears session.
     */
    public function test_logout_clears_session()
    {
        $user = User::factory()->create();

        $this->actingAs($user);

        $response = $this->postJson('/auth/logout');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        // Verify session is invalidated
        $this->assertGuest();
    }
}
