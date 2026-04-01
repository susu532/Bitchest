<?php
// ============================================================================
// Déclaration du namespace pour le modèle User.
// 'namespace' organise le code dans l'espace App\Models.
// Les Models représentent les tables de la base de données via Eloquent ORM.
// ============================================================================
namespace App\Models;

// ============================================================================
// Import du trait HasFactory pour la génération de données de test.
// Illuminate\Database\Eloquent\Factories\HasFactory permet d'utiliser les factories.
// Les factories créent des données fictives pour les tests et le seeding.
// ============================================================================
use Illuminate\Database\Eloquent\Factories\HasFactory;

// ============================================================================
// Import de la classe Authenticatable comme classe de base pour User.
// Illuminate\Foundation\Auth\User fournit les fonctionnalités d'authentification.
// Cette classe implémente les interfaces nécessaires pour auth(), login(), etc.
// ============================================================================
use Illuminate\Foundation\Auth\User as Authenticatable;

// ============================================================================
// Déclaration de la classe User qui représente un utilisateur du système.
// 'class' définit une nouvelle classe PHP.
// 'extends Authenticatable' hérite des fonctionnalités d'authentification Laravel.
// Cette classe mappe la table 'users' de la base de données.
// ============================================================================
class User extends Authenticatable
{
    // ============================================================================
    // Utilisation du trait HasFactory pour les factories de test.
    // 'use' à l'intérieur d'une classe importe un trait.
    // HasFactory ajoute la méthode statique factory() pour créer des instances de test.
    // ============================================================================
    use HasFactory;

    // ============================================================================
    // Propriété $fillable définissant les attributs assignables en masse.
    // 'protected' restreint l'accès à cette classe et ses enfants.
    // $fillable liste les colonnes qu'on peut remplir via create() ou fill().
    // Cela protège contre les attaques d'assignation de masse.
    // ============================================================================
    protected $fillable = [
        // first_name : prénom de l'utilisateur.
        'first_name',
        // last_name : nom de famille de l'utilisateur.
        'last_name',
        // email : adresse email unique de l'utilisateur.
        'email',
        // password : mot de passe hashé de l'utilisateur.
        'password',
        // role : rôle de l'utilisateur ('admin' ou 'client').
        'role',
    ];

    // ============================================================================
    // Propriété $hidden définissant les attributs exclus de la sérialisation.
    // Ces attributs ne seront pas inclus lors de la conversion en JSON/array.
    // Cela empêche l'exposition accidentelle de données sensibles.
    // ============================================================================
    protected $hidden = [
        // password : jamais exposé dans les réponses API.
        'password',
        // remember_token : token de session "se souvenir de moi".
        'remember_token',
    ];

    // ============================================================================
    // Méthode casts pour définir les conversions de type des attributs.
    // 'protected function' déclare une méthode protégée.
    // ': array' indique que la méthode retourne un tableau.
    // ============================================================================
    protected function casts(): array
    {
        return [
            // 'hashed' indique que password est automatiquement hashé.
            // Laravel hash automatiquement lors de l'assignation.
            'password' => 'hashed',
        ];
    }

    // ============================================================================
    // Relation Eloquent hasMany avec WalletTransaction.
    // 'public function' déclare une méthode publique.
    // Cette méthode définit la relation "Un User a plusieurs WalletTransactions".
    // ============================================================================
    public function walletTransactions()
    {
        // ============================================================================
        // $this->hasMany() définit une relation un-à-plusieurs.
        // WalletTransaction::class référence la classe du modèle lié.
        // Laravel déduit automatiquement la clé étrangère 'user_id'.
        // ============================================================================
        return $this->hasMany(WalletTransaction::class);
    }

    // ============================================================================
    // Relation Eloquent hasOne avec ClientAccount.
    // Cette méthode définit la relation "Un User a un ClientAccount".
    // Seuls les utilisateurs avec role='client' ont un compte client.
    // ============================================================================
    public function clientAccount()
    {
        // ============================================================================
        // $this->hasOne() définit une relation un-à-un.
        // ClientAccount::class référence la classe du modèle lié.
        // Laravel déduit automatiquement la clé étrangère 'user_id'.
        // ============================================================================
        return $this->hasOne(ClientAccount::class);
    }
}

