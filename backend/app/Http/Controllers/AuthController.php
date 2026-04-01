<?php
// ============================================================================
// Déclaration du namespace pour organiser le code selon l'architecture Laravel.
// 'namespace' définit l'espace de noms de cette classe pour éviter les conflits.
// App\Http\Controllers indique que cette classe est un contrôleur HTTP.
// ============================================================================
namespace App\Http\Controllers;

// ============================================================================
// Import du modèle User pour interagir avec la table users de la base de données.
// 'use' importe une classe pour pouvoir l'utiliser dans ce fichier.
// App\Models\User est le modèle Eloquent représentant un utilisateur.
// ============================================================================
use App\Models\User;

// ============================================================================
// Import du modèle ClientAccount pour gérer les comptes clients.
// ClientAccount stocke le solde en euros et lie un utilisateur à son compte.
// Ce modèle est utilisé lors de la création de nouveaux clients.
// ============================================================================
use App\Models\ClientAccount;

// ============================================================================
// Import du modèle Notification pour créer des notifications utilisateur.
// Ce modèle permet d'enregistrer des messages pour les utilisateurs.
// Les notifications sont créées lors d'événements importants comme le changement de mot de passe.
// ============================================================================
use App\Models\Notification;

// ============================================================================
// Import de la classe Request pour accéder aux données de la requête HTTP.
// Illuminate\Http\Request encapsule toutes les données envoyées par le client.
// Cette classe permet d'accéder aux paramètres POST, GET, headers, etc.
// ============================================================================
use Illuminate\Http\Request;

// ============================================================================
// Import de la façade Hash pour le hachage sécurisé des mots de passe.
// Illuminate\Support\Facades\Hash fournit des méthodes de cryptage bcrypt.
// Hash::make() crée un hash et Hash::check() vérifie un mot de passe.
// ============================================================================
use Illuminate\Support\Facades\Hash;

// ============================================================================
// Import de la classe Str pour la génération de chaînes aléatoires.
// Illuminate\Support\Str offre des utilitaires pour manipuler les chaînes.
// Str::random() génère des mots de passe temporaires aléatoires.
// ============================================================================
use Illuminate\Support\Str;

// ============================================================================
// Déclaration de la classe AuthController qui gère l'authentification.
// 'class' définit une nouvelle classe en PHP orienté objet.
// 'extends Controller' hérite des fonctionnalités du contrôleur de base Laravel.
// Ce contrôleur gère login, logout, récupération d'utilisateur, changement de mot de passe.
// ============================================================================
class AuthController extends Controller
{
    // ============================================================================
    // Méthode login pour authentifier un utilisateur avec email et mot de passe.
    // 'public function' déclare une méthode accessible depuis l'extérieur de la classe.
    // Request $request reçoit automatiquement l'objet requête injecté par Laravel.
    // ============================================================================
    public function login(Request $request)
    {
        // ============================================================================
        // Validation des données de la requête avec les règles spécifiées.
        // $request->validate() vérifie que les champs respectent les contraintes.
        // Si la validation échoue, Laravel retourne automatiquement une erreur 422.
        // ============================================================================
        $request->validate([
            // 'required|email' : le champ est obligatoire et doit être un email valide.
            'email' => 'required|email',
            // 'required|string' : le champ est obligatoire et doit être une chaîne.
            'password' => 'required|string',
        ]);

        // ============================================================================
        // Recherche de l'utilisateur par email dans la base de données.
        // User::where() crée une requête Eloquent avec une condition WHERE.
        // strtolower() convertit l'email en minuscules pour une recherche insensible à la casse.
        // ->first() retourne le premier résultat ou null si non trouvé.
        // ============================================================================
        $user = User::where('email', strtolower($request->email))->first();

        // ============================================================================
        // Vérification de l'existence de l'utilisateur et de la validité du mot de passe.
        // '!' est l'opérateur de négation logique.
        // '||' est l'opérateur OU : vrai si au moins une condition est vraie.
        // Hash::check() compare le mot de passe en clair avec le hash stocké.
        // ============================================================================
        if (!$user || !Hash::check($request->password, $user->password)) {
            // ============================================================================
            // Retour d'une réponse JSON d'erreur si les identifiants sont invalides.
            // response()->json() crée une réponse HTTP au format JSON.
            // Le second paramètre 401 est le code HTTP (Unauthorized).
            // ============================================================================
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
            ], 401);
        }

        // ============================================================================
        // Authentification de l'utilisateur et création de la session.
        // auth()->login() connecte l'utilisateur et génère une session.
        // Cette fonction stocke l'ID utilisateur dans la session PHP.
        // ============================================================================
        auth()->login($user);

        // ============================================================================
        // Retour d'une réponse JSON de succès avec les données utilisateur.
        // Les données sont formatées en camelCase pour le frontend JavaScript.
        // toIso8601String() formate les dates au standard ISO 8601.
        // ============================================================================
        return response()->json([
            'success' => true,
            'user' => [
                // (string) convertit l'ID en chaîne pour cohérence avec le frontend.
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

    // ============================================================================
    // Méthode logout pour déconnecter l'utilisateur actuel.
    // Cette méthode invalide la session et génère un nouveau token CSRF.
    // Request $request est injecté pour accéder à la session.
    // ============================================================================
    public function logout(Request $request)
    {
        // ============================================================================
        // Déconnexion de l'utilisateur via le guard d'authentification.
        // auth()->logout() efface l'utilisateur de la session.
        // Cette action ne supprime pas la session elle-même.
        // ============================================================================
        auth()->logout();

        // ============================================================================
        // Invalidation complète de la session utilisateur.
        // invalidate() détruit toutes les données de session.
        // Cela empêche la réutilisation de l'ancienne session.
        // ============================================================================
        $request->session()->invalidate();

        // ============================================================================
        // Régénération du token CSRF pour prévenir les attaques CSRF.
        // regenerateToken() crée un nouveau token de sécurité.
        // Le nouveau token doit être utilisé pour les prochaines requêtes.
        // ============================================================================
        $request->session()->regenerateToken();

        // Retour d'une réponse JSON confirmant la déconnexion.
        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    // ============================================================================
    // Méthode me pour récupérer les informations de l'utilisateur connecté.
    // Cette méthode vérifie d'abord si un utilisateur est authentifié.
    // Elle retourne les données utilisateur ou une erreur 401.
    // ============================================================================
    public function me(Request $request)
    {
        // ============================================================================
        // Vérification de l'état d'authentification de l'utilisateur.
        // auth()->check() retourne true si un utilisateur est connecté.
        // '!' inverse le booléen pour vérifier si NON connecté.
        // ============================================================================
        if (!auth()->check()) {
            return response()->json([
                'success' => false,
                'message' => 'Not authenticated',
            ], 401);
        }

        // ============================================================================
        // Récupération de l'utilisateur actuellement authentifié.
        // auth()->user() retourne l'instance User de l'utilisateur connecté.
        // Cette méthode utilise la session pour identifier l'utilisateur.
        // ============================================================================
        $user = auth()->user();

        // Retour des données utilisateur formatées en JSON.
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

    // ============================================================================
    // Méthode changePassword pour modifier le mot de passe de l'utilisateur.
    // Cette méthode vérifie l'ancien mot de passe avant d'accepter le nouveau.
    // Elle applique des règles de validation strictes sur le nouveau mot de passe.
    // ============================================================================
    public function changePassword(Request $request)
    {
        // Vérification que l'utilisateur est authentifié.
        if (!auth()->check()) {
            return response()->json([
                'success' => false,
                'message' => 'Not authenticated',
            ], 401);
        }

        // ============================================================================
        // Validation des champs avec règles de complexité pour le mot de passe.
        // Le second tableau contient les messages d'erreur personnalisés.
        // La regex exige majuscule, minuscule, chiffre, et caractère spécial.
        // ============================================================================
        $request->validate([
            'currentPassword' => 'required|string|min:6',
            // 'different:currentPassword' assure que le nouveau diffère de l'ancien.
            // 'regex:...' définit un pattern de complexité pour le mot de passe.
            'newPassword' => 'required|string|min:8|different:currentPassword|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{8,}$/',
        ], [
            'newPassword.min' => 'Password must be at least 8 characters long.',
            'newPassword.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).',
            'newPassword.different' => 'New password must be different from current password.',
        ]);

        // Récupération de l'utilisateur connecté.
        $user = auth()->user();

        // ============================================================================
        // Vérification que le mot de passe actuel fourni est correct.
        // Hash::check() compare le mot de passe en clair avec le hash stocké.
        // Cette vérification empêche le changement de mot de passe par un tiers.
        // ============================================================================
        if (!Hash::check($request->currentPassword, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect',
            ], 401);
        }

        // ============================================================================
        // Mise à jour du mot de passe avec hachage sécurisé.
        // Hash::make() crée un hash bcrypt du nouveau mot de passe.
        // Le mot de passe en clair n'est jamais stocké dans la base de données.
        // ============================================================================
        $user->password = Hash::make($request->newPassword);

        // ============================================================================
        // Sauvegarde des modifications dans la base de données.
        // save() persiste les changements apportés au modèle.
        // Cette méthode déclenche les événements Eloquent (updated, etc.).
        // ============================================================================
        $user->save();
        
        // ============================================================================
        // Création d'une notification pour informer l'utilisateur du changement.
        // Notification::create() insère un nouvel enregistrement dans la table notifications.
        // Cette notification sert de confirmation et d'alerte de sécurité.
        // ============================================================================
        Notification::create([
            'user_id' => $user->id,
            'type' => 'info',
            'message' => 'Password Changed',
            'details' => 'Your password was successfully changed. If this wasn\'t you, please contact support immediately.',
        ]);

        // Retour d'une confirmation de succès.
        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully',
        ]);
    }
}

