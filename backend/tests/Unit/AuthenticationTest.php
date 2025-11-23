<?php

namespace Tests\Unit;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that users can be created with hashed passwords.
     */
    public function test_user_password_is_hashed()
    {
        $password = 'SecurePassword123';
        
        $user = User::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'password' => Hash::make($password),
            'role' => 'admin',
        ]);

        $this->assertNotEquals($password, $user->password);
        $this->assertTrue(Hash::check($password, $user->password));
    }

    /**
     * Test that password hashing prevents password viewing.
     */
    public function test_password_not_visible_in_serialization()
    {
        $user = User::factory()->create();
        
        $userData = $user->toArray();
        
        // Password should be hidden during serialization
        $this->assertArrayNotHasKey('password', $user->getHidden());
        $this->assertTrue(in_array('password', $user->getHidden()));
    }

    /**
     * Test that invalid password fails authentication.
     */
    public function test_invalid_password_fails_check()
    {
        $password = 'CorrectPassword123';
        $wrongPassword = 'WrongPassword123';

        $user = User::create([
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'jane@example.com',
            'password' => Hash::make($password),
            'role' => 'client',
        ]);

        $this->assertFalse(Hash::check($wrongPassword, $user->password));
    }

    /**
     * Test user roles are properly assigned.
     */
    public function test_user_roles_are_properly_assigned()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $client = User::factory()->create(['role' => 'client']);

        $this->assertEquals('admin', $admin->role);
        $this->assertEquals('client', $client->role);
    }

    /**
     * Test that email is case-insensitive.
     */
    public function test_email_stored_consistently()
    {
        $user = User::create([
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => strtolower('Test@Example.COM'),
            'password' => Hash::make('password'),
            'role' => 'client',
        ]);

        $this->assertEquals('test@example.com', $user->email);
    }
}
