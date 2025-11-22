<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ClientAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ClientController extends Controller
{
    public function createClient(Request $request)
    {
        if (!auth()->check() || auth()->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'firstName' => 'required|string',
            'lastName' => 'required|string',
            'email' => 'required|email|unique:users',
        ]);

        // Generate temporary password
        $tempPassword = Str::random(12);

        $user = User::create([
            'first_name' => $request->firstName,
            'last_name' => $request->lastName,
            'email' => strtolower($request->email),
            'password' => Hash::make($tempPassword),
            'role' => 'client',
        ]);

        // Create client account with 500 EUR initial balance
        ClientAccount::create([
            'user_id' => $user->id,
            'balance_eur' => 500,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Client created successfully',
            'user' => [
                'id' => (string) $user->id,
                'firstName' => $user->first_name,
                'lastName' => $user->last_name,
                'email' => $user->email,
                'role' => $user->role,
                'createdAt' => $user->created_at->toIso8601String(),
                'updatedAt' => $user->updated_at->toIso8601String(),
            ],
            'temporaryPassword' => $tempPassword,
        ], 201);
    }

    public function deleteClient(Request $request, $userId)
    {
        if (!auth()->check() || auth()->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($userId);

        if ($user->role !== 'client') {
            return response()->json(['success' => false, 'message' => 'User is not a client'], 400);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Client deleted successfully',
        ]);
    }

    public function updateClient(Request $request, $userId)
    {
        if (!auth()->check() || auth()->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($userId);

        if ($user->role !== 'client') {
            return response()->json(['success' => false, 'message' => 'User is not a client'], 400);
        }

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

    public function getClientAccount(Request $request)
    {
        if (!auth()->check() || auth()->user()->role !== 'client') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $user = auth()->user();
        $account = ClientAccount::where('user_id', $user->id)->first();

        if (!$account) {
            return response()->json(['success' => false, 'message' => 'Account not found'], 404);
        }

        $transactions = \App\Models\WalletTransaction::where('user_id', $user->id)->get();

        return response()->json([
            'success' => true,
            'account' => [
                'userId' => (string) $account->user_id,
                'balanceEUR' => (float) $account->balance_eur,
                'transactions' => $transactions->map(fn($t) => [
                    'id' => (string) $t->id,
                    'cryptoId' => $t->crypto_id,
                    'quantity' => (float) $t->quantity,
                    'pricePerUnit' => (float) $t->price_per_unit,
                    'type' => $t->type,
                    'timestamp' => $t->transaction_date->toIso8601String(),
                ])->toArray(),
            ],
        ]);
    }
}
