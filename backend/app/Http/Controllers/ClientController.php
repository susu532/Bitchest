<?php

// Espace de noms pour les contrôleurs HTTP
namespace App\Http\Controllers;

// Importe le modèle User pour gérer les utilisateurs clients
use App\Models\User;
// Importe le modèle ClientAccount pour gérer les comptes clients
use App\Models\ClientAccount;
// Importe la classe Request pour gérer les requêtes HTTP
use Illuminate\Http\Request;
// Importe la classe Hash pour hacher les mots de passe de manière sécurisée
use Illuminate\Support\Facades\Hash;
// Importe la classe Str pour générer des chaînes aléatoires (ex: mots de passe temporaires)
use Illuminate\Support\Str;

// Classe contrôleur pour la gestion des clients (création, suppression, modification, récupération)
class ClientController extends Controller
{
    /**
     * Crée un nouveau client avec un compte
     * Endpoint: POST /clients
     * Authentification: Admin uniquement
     * Paramètres requis: firstName, lastName, email
     */
    public function createClient(Request $request)
    {
        // Vérifie que l'utilisateur est authentifié ET a le rôle d'admin
        if (!auth()->check() || auth()->user()->role !== 'admin') {
            // Retourne erreur 403 si l'utilisateur n'est pas admin
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        // Valide les données reçues de la requête
        $request->validate([
            // firstName: obligatoire, texte, 2 à 50 caractères
            'firstName' => 'required|string|min:2|max:50',
            // lastName: obligatoire, texte, 2 à 50 caractères
            'lastName' => 'required|string|min:2|max:50',
            // email: obligatoire, format email valide, unique dans la table users
            'email' => 'required|email:rfc,dns|unique:users|max:255|regex:/^[^\s@]+@[^\s@]+\.[^\s@]+$/',
        ], [
            // Messages d'erreur personnalisés pour chaque validation
            'email.email' => 'The email address must be a valid email.',
            'email.unique' => 'This email address is already in use.',
            'email.regex' => 'The email address format is invalid.',
            'firstName.min' => 'First name must be at least 2 characters.',
            'firstName.max' => 'First name cannot exceed 50 characters.',
            'lastName.min' => 'Last name must be at least 2 characters.',
            'lastName.max' => 'Last name cannot exceed 50 characters.',
        ]);

        // Génère un mot de passe temporaire aléatoire de 12 caractères
        $tempPassword = Str::random(12);

        // Crée un nouvel utilisateur avec le rôle 'client'
        $user = User::create([
            // Stocke le prénom
            'first_name' => $request->firstName,
            // Stocke le nom
            'last_name' => $request->lastName,
            // Stocke l'email en minuscules pour éviter les doublons
            'email' => strtolower($request->email),
            // Hache le mot de passe temporaire pour la sécurité
            'password' => Hash::make($tempPassword),
            // Définit le rôle comme 'client'
            'role' => 'client',
        ]);

        // Crée un compte client associé avec 500 EUR de solde initial
        ClientAccount::create([
            // Lie le compte à l'utilisateur créé
            'user_id' => $user->id,
            // Balance initiale de 500 euros
            'balance_eur' => 500,
        ]);

        // Retourne la réponse JSON avec les informations du client créé (HTTP 201 = Created)
        return response()->json([
            // Flag de succès
            'success' => true,
            // Message de confirmation
            'message' => 'Client created successfully',
            // Détails du nouvel utilisateur
            'user' => [
                // ID unique du nouvel utilisateur
                'id' => (string) $user->id,
                // Prénom de l'utilisateur
                'firstName' => $user->first_name,
                // Nom de l'utilisateur
                'lastName' => $user->last_name,
                // Email de l'utilisateur
                'email' => $user->email,
                // Rôle assigné (toujours 'client')
                'role' => $user->role,
                // Date de création en format ISO 8601
                'createdAt' => $user->created_at->toIso8601String(),
                // Date de dernière mise à jour en format ISO 8601
                'updatedAt' => $user->updated_at->toIso8601String(),
            ],
            // Mot de passe temporaire à partager de manière sécurisée avec le client
            'temporaryPassword' => $tempPassword,
        ], 201);
    }

    /**
     * Supprime un client existant et ses données associées
     * Endpoint: DELETE /clients/{userId}
     * Authentification: Admin uniquement
     * Paramètre: userId (ID de l'utilisateur client à supprimer)
     */
    public function deleteClient(Request $request, $userId)
    {
        // Vérifie que l'utilisateur est authentifié ET a le rôle d'admin
        if (!auth()->check() || auth()->user()->role !== 'admin') {
            // Retourne erreur 403 si l'utilisateur n'est pas admin
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        // Cherche l'utilisateur par ID (lance exception 404 si non trouvé)
        $user = User::findOrFail($userId);

        // Vérifie que l'utilisateur est vraiment un client
        if ($user->role !== 'client') {
            // Retourne erreur 400 si ce n'est pas un client
            return response()->json(['success' => false, 'message' => 'User is not a client'], 400);
        }

        // Supprime l'utilisateur (supprime aussi le compte client en cascade)
        $user->delete();

        // Retourne la réponse JSON de confirmation
        return response()->json([
            // Flag de succès
            'success' => true,
            // Message de confirmation
            'message' => 'Client deleted successfully',
        ]);
    }

    /**
     * Met à jour les données d'un client existant
     * Endpoint: PUT /clients/{userId}
     * Authentification: Admin uniquement
     * Paramètre: userId (ID de l'utilisateur client à modifier)
     * Paramètres optionnels: firstName, lastName, email
     */
    public function updateClient(Request $request, $userId)
    {
        // Vérifie que l'utilisateur est authentifié ET a le rôle d'admin
        if (!auth()->check() || auth()->user()->role !== 'admin') {
            // Retourne erreur 403 si l'utilisateur n'est pas admin
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        // Cherche l'utilisateur par ID (lance exception 404 si non trouvé)
        $user = User::findOrFail($userId);

        // Vérifie que l'utilisateur est vraiment un client
        if ($user->role !== 'client') {
            // Retourne erreur 400 si ce n'est pas un client
            return response()->json(['success' => false, 'message' => 'User is not a client'], 400);
        }

        // Valide les données partielles (sometimes = facultatif)
        $request->validate([
            // firstName: facultatif, texte, 2 à 50 caractères
            'firstName' => 'sometimes|string|min:2|max:50',
            // lastName: facultatif, texte, 2 à 50 caractères
            'lastName' => 'sometimes|string|min:2|max:50',
            // email: facultatif, format email valide, unique sauf pour cet utilisateur
            'email' => 'sometimes|email|unique:users,email,' . $user->id . '|max:255',
        ], [
            // Messages d'erreur personnalisés
            'email.email' => 'The email address must be a valid email.',
            'email.unique' => 'This email address is already in use by another user.',
            'firstName.min' => 'First name must be at least 2 characters.',
            'firstName.max' => 'First name cannot exceed 50 characters.',
            'lastName.min' => 'Last name must be at least 2 characters.',
            'lastName.max' => 'Last name cannot exceed 50 characters.',
        ]);

        // Vérifie si firstName est fourni et le met à jour
        if ($request->has('firstName')) {
            // Mises à jour le prénom
            $user->first_name = $request->firstName;
        }
        // Vérifie si lastName est fourni et le met à jour
        if ($request->has('lastName')) {
            // Mets à jour le nom
            $user->last_name = $request->lastName;
        }
        // Vérifie si email est fourni et le met à jour
        if ($request->has('email')) {
            // Mets à jour l'email en minuscules pour éviter les doublons
            $user->email = strtolower($request->email);
        }

        // Sauvegarde les changements dans la base de données
        $user->save();

        // Retourne la réponse JSON avec les données mises à jour
        return response()->json([
            // Flag de succès
            'success' => true,
            // Détails de l'utilisateur mis à jour
            'user' => [
                // ID de l'utilisateur
                'id' => (string) $user->id,
                // Prénom mis à jour
                'firstName' => $user->first_name,
                // Nom mis à jour
                'lastName' => $user->last_name,
                // Email mis à jour
                'email' => $user->email,
                // Rôle (inchangé)
                'role' => $user->role,
                // Date de création (inchangée)
                'createdAt' => $user->created_at->toIso8601String(),
                // Date de dernière mise à jour (actualisée)
                'updatedAt' => $user->updated_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Récupère les données du compte client de l'utilisateur authentifié
     * Endpoint: GET /clients/account/mine
     * Authentification: Client uniquement (accès à son propre compte)
     */
    public function getClientAccount(Request $request)
    {
        // Vérifie que l'utilisateur est authentifié ET a le rôle de 'client'
        if (!auth()->check() || auth()->user()->role !== 'client') {
            // Retourne erreur 403 si ce n'est pas un client
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        // Récupère l'utilisateur authentifié actuel
        $user = auth()->user();
        // Cherche le compte client associé à cet utilisateur
        $account = ClientAccount::where('user_id', $user->id)->first();

        // Vérifie que le compte existe
        if (!$account) {
            // Retourne erreur 404 si le compte n'existe pas
            return response()->json(['success' => false, 'message' => 'Account not found'], 404);
        }

        // Récupère TOUTES les transactions du client (achats et ventes)
        $transactions = \App\Models\WalletTransaction::where('user_id', $user->id)->get();

        // Retourne la réponse JSON avec les données du compte
        return response()->json([
            // Flag de succès
            'success' => true,
            // Détails du compte client
            'account' => [
                // ID de l'utilisateur propriétaire du compte
                'userId' => (string) $account->user_id,
                // Solde EUR du compte (converti en float)
                'balanceEUR' => (float) $account->balance_eur,
                // Tableau de toutes les transactions du client
                'transactions' => $transactions->map(fn($t) => [
                    // ID unique de la transaction
                    'id' => (string) $t->id,
                    // ID de la cryptomonnaie tradée
                    'cryptoId' => $t->crypto_id,
                    // Quantité achetée ou vendue
                    'quantity' => (float) $t->quantity,
                    // Prix par unité en EUR
                    'pricePerUnit' => (float) $t->price_per_unit,
                    // Type de transaction (buy ou sell)
                    'type' => $t->type,
                    // Timestamp de la transaction en format ISO 8601
                    'timestamp' => $t->transaction_date->toIso8601String(),
                ])->toArray(),
            ],
        ]);
    }
}
