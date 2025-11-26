<?php

namespace App\Models;

// Importe HasFactory pour permettre à ce modèle d'utiliser la factory UserFactory
use Illuminate\Database\Eloquent\Factories\HasFactory;
// Importe la classe Authenticatable - classe de base pour les modèles d'authentification Laravel
use Illuminate\Foundation\Auth\User as Authenticatable;

/**
 * Modèle User
 * 
 * Ce modèle représente un utilisateur de l'application BitChest.
 * Les utilisateurs peuvent être:
 * - 'admin': administrateur avec accès complet à la gestion des clients
 * - 'client': utilisateur client qui peut acheter/vendre des cryptomonnaies
 * 
 * Ce modèle étend Authenticatable pour supporter l'authentification Laravel
 */
class User extends Authenticatable
{
    // HasFactory: permet d'utiliser la factory UserFactory pour créer des instances de test
    use HasFactory;

    /**
     * Les attributs assignables en masse (mass assignable).
     * 
     * Ces attributs peuvent être remplis en masse via create() ou update()
     * Exemple: User::create(['first_name' => 'John', 'email' => 'john@example.com', ...])
     * 
     * Attributs:
     * - first_name: le prénom de l'utilisateur
     * - last_name: le nom de famille de l'utilisateur
     * - email: l'adresse email unique de l'utilisateur (identifiant de connexion)
     * - password: le mot de passe hashé de l'utilisateur
     * - role: le rôle de l'utilisateur ('admin' ou 'client')
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',    // Le prénom de l'utilisateur
        'last_name',     // Le nom de famille
        'email',         // L'adresse email (clé unique pour la connexion)
        'password',      // Le mot de passe (sera hashé avant sauvegarde)
        'role',          // Le rôle: 'admin' ou 'client'
    ];

    /**
     * Les attributs qui doivent être cachés lors de la sérialisation.
     * 
     * Lorsque le modèle est converti en JSON (lors d'une réponse API),
     * ces attributs ne seront PAS inclus pour des raisons de sécurité.
     * 
     * Attributs cachés:
     * - password: le mot de passe ne doit jamais être envoyé au frontend
     * - remember_token: le token de mémorisation ne doit pas être exposé
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',         // Le mot de passe - JAMAIS envoyé en JSON
        'remember_token',   // Token de "se souvenir de moi" - cache pour la sécurité
    ];

    /**
     * Défini les conversions de type pour les attributs du modèle.
     * 
     * Spécifie comment les attributs doivent être castés (convertis) en types spécifiques
     * lors de la récupération ou du stockage en base de données.
     *
     * @return array<string, string> Tableau de conversions [attribut => type]
     */
    protected function casts(): array
    {
        // Retourne les conversions de type pour ce modèle
        return [
            // Cast 'password' comme 'hashed': Laravel hashera automatiquement le mot de passe
            // lors de la sauvegarde et le comparera automatiquement lors de la vérification
            'password' => 'hashed',
        ];
    }

    /**
     * Relation: Un utilisateur a PLUSIEURS transactions de portefeuille
     * 
     * Cette relation définit qu'un utilisateur peut avoir plusieurs WalletTransaction
     * Un utilisateur client effectue plusieurs achats/ventes au fil du temps
     * 
     * Utilisation:
     * - $user->walletTransactions()->get(): obtenir toutes les transactions d'un utilisateur
     * - $user->walletTransactions: accès lazy-loaded via l'accesseur dynamique
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany La relation un-à-plusieurs
     */
    public function walletTransactions()
    {
        // Retourne une relation hasMany vers le modèle WalletTransaction
        // Un utilisateur a plusieurs transactions, une transaction appartient à un utilisateur
        return $this->hasMany(WalletTransaction::class);
    }

    /**
     * Relation: Un utilisateur a UN compte client
     * 
     * Cette relation définit qu'un utilisateur client a exactement un ClientAccount
     * Un ClientAccount stocke le solde EUR et les informations de compte du client
     * 
     * Note: Seuls les utilisateurs avec le rôle 'client' ont un ClientAccount
     * Les administrateurs ('admin') n'en ont pas
     * 
     * Utilisation:
     * - $user->clientAccount()->first(): obtenir le compte client si existant
     * - $user->clientAccount->balance_eur: accéder au solde EUR du client
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasOne La relation un-à-un
     */
    public function clientAccount()
    {
        // Retourne une relation hasOne vers le modèle ClientAccount
        // Un utilisateur client a un compte client, un compte client appartient à un utilisateur
        return $this->hasOne(ClientAccount::class);
    }
}
