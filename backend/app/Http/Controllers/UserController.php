<?php

// Espace de noms pour les contrôleurs HTTP
namespace App\Http\Controllers;

// Importe le modèle User pour gérer les utilisateurs
use App\Models\User;
// Importe la classe Request pour gérer les requêtes HTTP
use Illuminate\Http\Request;

// Classe contrôleur pour la gestion des profils utilisateurs
class UserController extends Controller
{
    /**
     * Met à jour le profil de l'utilisateur authentifié (son propre compte)
     * Endpoint: POST /user/profile
     * Authentification: Requise (utilisateur doit être connecté)
     * Paramètres optionnels: firstName, lastName, email
     */
    public function updateProfile(Request $request)
    {
        // Vérifie que l'utilisateur est authentifié (a une session valide)
        if (!auth()->check()) {
            // Retourne erreur 401 si non authentifié
            return response()->json(['success' => false, 'message' => 'Not authenticated'], 401);
        }

        // Récupère l'utilisateur actuellement authentifié
        $user = auth()->user();

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
            'email.unique' => 'This email address is already in use.',
            'firstName.min' => 'First name must be at least 2 characters.',
            'firstName.max' => 'First name cannot exceed 50 characters.',
            'lastName.min' => 'Last name must be at least 2 characters.',
            'lastName.max' => 'Last name cannot exceed 50 characters.',
        ]);

        // Vérifie si firstName est fourni et le met à jour
        if ($request->has('firstName')) {
            // Mets à jour le prénom de l'utilisateur
            $user->first_name = $request->firstName;
        }
        // Vérifie si lastName est fourni et le met à jour
        if ($request->has('lastName')) {
            // Mets à jour le nom de l'utilisateur
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
                // ID unique de l'utilisateur
                'id' => (string) $user->id,
                // Prénom mis à jour
                'firstName' => $user->first_name,
                // Nom mis à jour
                'lastName' => $user->last_name,
                // Email mis à jour
                'email' => $user->email,
                // Rôle de l'utilisateur (admin ou client)
                'role' => $user->role,
                // Date de création du compte
                'createdAt' => $user->created_at->toIso8601String(),
                // Date de dernière mise à jour
                'updatedAt' => $user->updated_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Récupère la liste de TOUS les utilisateurs (admins et clients)
     * Endpoint: GET /users
     * Authentification: Admin uniquement
     */
    public function getAllUsers()
    {
        // Vérifie que l'utilisateur est authentifié ET a le rôle d'admin
        if (!auth()->check() || auth()->user()->role !== 'admin') {
            // Retourne erreur 403 si l'utilisateur n'est pas admin
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        // Récupère TOUS les utilisateurs de la base de données
        $users = User::all();

        // Retourne la réponse JSON avec la liste des utilisateurs
        return response()->json([
            // Flag de succès
            'success' => true,
            // Tableau de tous les utilisateurs formatés
            'users' => $users->map(function ($u) {
                return [
                    // ID unique de l'utilisateur
                    'id' => (string) $u->id,
                    // Prénom de l'utilisateur
                    'firstName' => $u->first_name,
                    // Nom de l'utilisateur
                    'lastName' => $u->last_name,
                    // Email de l'utilisateur
                    'email' => $u->email,
                    // Rôle (admin ou client)
                    'role' => $u->role,
                    // Date de création du compte
                    'createdAt' => $u->created_at->toIso8601String(),
                    // Date de dernière mise à jour
                    'updatedAt' => $u->updated_at->toIso8601String(),
                ];
            })->toArray(),
        ]);
    }
}
