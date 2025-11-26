<?php

// Espace de noms pour les contrôleurs HTTP
namespace App\Http\Controllers;

// Importe le modèle User pour gérer les utilisateurs authentifiés
use App\Models\User;
// Importe le modèle ClientAccount pour les comptes clients
use App\Models\ClientAccount;
// Importe la classe Request pour gérer les requêtes HTTP
use Illuminate\Http\Request;
// Importe la classe Hash pour vérifier les mots de passe hachés
use Illuminate\Support\Facades\Hash;
// Importe la classe Str pour générer des chaînes aléatoires
use Illuminate\Support\Str;

// Classe contrôleur pour tous les endpoints d'authentification
class AuthController extends Controller
{
    /**
     * Authentifie un utilisateur et crée une session
     * Endpoint: POST /auth/login
     * Authentification: Non requise (login public)
     * Paramètres requis: email, password
     */
    public function login(Request $request)
    {
        // Valide que email et password sont fournis
        $request->validate([
            // email: obligatoire, doit être un format email valide
            'email' => 'required|email',
            // password: obligatoire, doit être une chaîne de caractères
            'password' => 'required|string',
        ]);

        // Cherche l'utilisateur dans la base de données par email (en minuscules)
        $user = User::where('email', strtolower($request->email))->first();

        // Vérifie que l'utilisateur existe ET que le mot de passe est correct
        if (!$user || !Hash::check($request->password, $user->password)) {
            // Retourne erreur 401 si email ou mot de passe invalide
            return response()->json([
                // Flag d'erreur
                'success' => false,
                // Message d'erreur (volontairement vague pour ne pas révéler si l'email existe)
                'message' => 'Invalid credentials',
            ], 401);
        }

        // Crée une session utilisateur (utilisateur maintenant authentifié)
        auth()->login($user);

        // Retourne les données de l'utilisateur authentifié
        return response()->json([
            // Flag de succès
            'success' => true,
            // Détails de l'utilisateur connecté
            'user' => [
                // ID unique de l'utilisateur
                'id' => (string) $user->id,
                // Prénom de l'utilisateur
                'firstName' => $user->first_name,
                // Nom de l'utilisateur
                'lastName' => $user->last_name,
                // Email de l'utilisateur
                'email' => $user->email,
                // Rôle (admin ou client)
                'role' => $user->role,
                // Date de création du compte
                'createdAt' => $user->created_at->toIso8601String(),
                // Date de dernière mise à jour
                'updatedAt' => $user->updated_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Déconnecte l'utilisateur et détruit sa session
     * Endpoint: POST /auth/logout
     * Authentification: Requise (utilisateur doit être connecté)
     */
    public function logout(Request $request)
    {
        // Détruit la session utilisateur (le rend non authentifié)
        auth()->logout();
        // Invalide la session (impossible de réutiliser l'ancienne session)
        $request->session()->invalidate();
        // Génère un nouveau token CSRF pour la sécurité
        $request->session()->regenerateToken();

        // Retourne la réponse JSON de confirmation
        return response()->json([
            // Flag de succès
            'success' => true,
            // Message de confirmation
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Récupère les données de l'utilisateur authentifié actuel
     * Endpoint: GET /auth/me
     * Authentification: Requise (utilisateur doit être connecté)
     */
    public function me(Request $request)
    {
        // Vérifie que l'utilisateur est authentifié (a une session valide)
        if (!auth()->check()) {
            // Retourne erreur 401 si non authentifié
            return response()->json([
                // Flag d'erreur
                'success' => false,
                // Message d'erreur
                'message' => 'Not authenticated',
            ], 401);
        }

        // Récupère l'utilisateur actuellement authentifié
        $user = auth()->user();

        // Retourne les données de l'utilisateur authentifié
        return response()->json([
            // Flag de succès
            'success' => true,
            // Détails de l'utilisateur actuel
            'user' => [
                // ID unique de l'utilisateur
                'id' => (string) $user->id,
                // Prénom de l'utilisateur
                'firstName' => $user->first_name,
                // Nom de l'utilisateur
                'lastName' => $user->last_name,
                // Email de l'utilisateur
                'email' => $user->email,
                // Rôle (admin ou client)
                'role' => $user->role,
                // Date de création du compte
                'createdAt' => $user->created_at->toIso8601String(),
                // Date de dernière mise à jour
                'updatedAt' => $user->updated_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Change le mot de passe de l'utilisateur authentifié
     * Endpoint: POST /auth/change-password
     * Authentification: Requise (utilisateur doit être connecté)
     * Paramètres requis: currentPassword, newPassword
     */
    public function changePassword(Request $request)
    {
        // Vérifie que l'utilisateur est authentifié
        if (!auth()->check()) {
            // Retourne erreur 401 si non authentifié
            return response()->json([
                // Flag d'erreur
                'success' => false,
                // Message d'erreur
                'message' => 'Not authenticated',
            ], 401);
        }

        // Valide le mot de passe actuel et le nouveau mot de passe
        $request->validate([
            // currentPassword: obligatoire, chaîne, minimum 6 caractères
            'currentPassword' => 'required|string|min:6',
            // newPassword: obligatoire, chaîne, minimum 8 caractères
            // different: doit être différent du mot de passe actuel
            // regex: doit contenir majuscule, minuscule, chiffre, caractère spécial
            'newPassword' => 'required|string|min:8|different:currentPassword|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{8,}$/',
        ], [
            // Messages d'erreur personnalisés
            'newPassword.min' => 'Password must be at least 8 characters long.',
            'newPassword.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).',
            'newPassword.different' => 'New password must be different from current password.',
        ]);

        // Récupère l'utilisateur authentifié
        $user = auth()->user();

        // Vérifie que le mot de passe actuel fourni correspond au mot de passe stocké
        if (!Hash::check($request->currentPassword, $user->password)) {
            // Retourne erreur 401 si le mot de passe actuel est incorrect
            return response()->json([
                // Flag d'erreur
                'success' => false,
                // Message d'erreur
                'message' => 'Current password is incorrect',
            ], 401);
        }

        // Hache le nouveau mot de passe avant de le stocker
        $user->password = Hash::make($request->newPassword);
        // Sauvegarde le nouveau mot de passe dans la base de données
        $user->save();

        // Retourne la réponse JSON de confirmation
        return response()->json([
            // Flag de succès
            'success' => true,
            // Message de confirmation
            'message' => 'Password changed successfully',
        ]);
    }
}
