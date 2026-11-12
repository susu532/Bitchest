<?php
// Hedha el controller eli ygérer el authentification: login, logout, récupération profil w changement mot de passe
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ClientAccount;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    // El login: nvalidiwou email w password, ncherchiw el user, w kan sahih nconnectiw
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', strtolower($request->email))->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
            ], 401);
        }

        auth()->login($user);

        return response()->json([
            'success' => true,
            'user' => [
                'id' => (string) $user->id,
                'firstName' => $user->first_name,
                'lastName' => $user->last_name,
                'email' => $user->email,
                'role' => $user->role,
                'createdAt' => $user->created_at->toIso8601String(),
                'updatedAt' => $user->updated_at->toIso8601String(),
            ],
        ]);
    }

    // El logout: n7ayou el session w nregénérou el token CSRF lel sécurité
    public function logout(Request $request)
    {
        auth()->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    // El me: nraj3ou les infos mta3 el user connecté, sinon 401
    public function me(Request $request)
    {
        if (!auth()->check()) {
            return response()->json([
                'success' => false,
                'message' => 'Not authenticated',
            ], 401);
        }

        $user = auth()->user();

        return response()->json([
            'success' => true,
            'user' => [
                'id' => (string) $user->id,
                'firstName' => $user->first_name,
                'lastName' => $user->last_name,
                'email' => $user->email,
                'role' => $user->role,
                'createdAt' => $user->created_at->toIso8601String(),
                'updatedAt' => $user->updated_at->toIso8601String(),
            ],
        ]);
    }

    // Changement mot de passe: nvérifiw el ancien, nvalidiwou el jdid b regex complexe, w na3mlou notification
    public function changePassword(Request $request)
    {
        if (!auth()->check()) {
            return response()->json([
                'success' => false,
                'message' => 'Not authenticated',
            ], 401);
        }

        $request->validate([
            'currentPassword' => 'required|string|min:6',
            'newPassword' => 'required|string|min:8|different:currentPassword|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{8,}$/',
        ], [
            'newPassword.min' => 'Password must be at least 8 characters long.',
            'newPassword.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).',
            'newPassword.different' => 'New password must be different from current password.',
        ]);

        $user = auth()->user();

        if (!Hash::check($request->currentPassword, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect',
            ], 401);
        }

        $user->password = Hash::make($request->newPassword);

        $user->save();
        
        Notification::create([
            'user_id' => $user->id,
            'type' => 'info',
            'message' => 'Password Changed',
            'details' => 'Your password was successfully changed. If this wasn\'t you, please contact support immediately.',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully',
        ]);
    }
}
