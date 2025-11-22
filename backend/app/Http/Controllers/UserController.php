<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function updateProfile(Request $request)
    {
        if (!auth()->check()) {
            return response()->json(['success' => false, 'message' => 'Not authenticated'], 401);
        }

        $user = auth()->user();

        $request->validate([
            'firstName' => 'sometimes|string',
            'lastName' => 'sometimes|string',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
        ]);

        if ($request->has('firstName')) {
            $user->first_name = $request->firstName;
        }
        if ($request->has('lastName')) {
            $user->last_name = $request->lastName;
        }
        if ($request->has('email')) {
            $user->email = strtolower($request->email);
        }

        $user->save();

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

    public function getAllUsers()
    {
        if (!auth()->check() || auth()->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $users = User::all();

        return response()->json([
            'success' => true,
            'users' => $users->map(function ($u) {
                return [
                    'id' => (string) $u->id,
                    'firstName' => $u->first_name,
                    'lastName' => $u->last_name,
                    'email' => $u->email,
                    'role' => $u->role,
                    'createdAt' => $u->created_at->toIso8601String(),
                    'updatedAt' => $u->updated_at->toIso8601String(),
                ];
            })->toArray(),
        ]);
    }
}
