<?php
// ============================================================================
// Déclaration du namespace pour le modèle WalletTransaction.
// 'namespace' organise le code dans l'espace App\Models.
// Les Models représentent les tables de la base de données via Eloquent ORM.
// ============================================================================
namespace App\Models;

// ============================================================================
// Import de la classe Model comme base pour les modèles Eloquent.
// Illuminate\Database\Eloquent\Model fournit les fonctionnalités ORM.
// Cette classe permet d'interagir avec la base de données de manière orientée objet.
// ============================================================================
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// ============================================================================
// Déclaration de la classe WalletTransaction représentant une transaction.
// 'class' définit une nouvelle classe PHP.
// 'extends Model' hérite des fonctionnalités Eloquent pour l'ORM.
// Ce modèle mappe la table 'wallet_transactions' de la base de données.
// ============================================================================
class WalletTransaction extends Model
{
    use HasFactory;
    // ============================================================================
    // Propriété $fillable définissant les attributs assignables en masse.
    // 'protected' restreint l'accès à cette classe et ses enfants.
    // $fillable liste les colonnes qu'on peut remplir via create() ou fill().
    // Cela protège contre les attaques d'assignation de masse (mass assignment).
    // ============================================================================
    protected $fillable = [
        // user_id : identifiant de l'utilisateur propriétaire de la transaction.
        'user_id',
        // crypto_id : identifiant de la cryptomonnaie concernée.
        'crypto_id',
        // quantity : quantité de crypto achetée ou vendue.
        'quantity',
        // price_per_unit : prix unitaire au moment de la transaction.
        'price_per_unit',
        // type : type de transaction ('buy' pour achat, 'sell' pour vente).
        'type',
        // transaction_date : date et heure de la transaction.
        'transaction_date',
    ];

    // ============================================================================
    // Méthode casts pour définir les conversions de type des attributs.
    // 'protected function' déclare une méthode protégée retournant un tableau.
    // Les casts permettent de convertir automatiquement les types lors de l'accès.
    // ============================================================================
    protected function casts()
    {
        return [
            // ============================================================================
            // 'datetime' convertit transaction_date en objet Carbon.
            // Carbon est une bibliothèque PHP pour manipuler les dates.
            // Cela permet d'utiliser des méthodes comme ->format(), ->toIso8601String().
            // ============================================================================
            'transaction_date' => 'datetime',
        ];
    }

    // ============================================================================
    // Relation Eloquent belongsTo avec le modèle User.
    // 'public function' déclare une méthode publique.
    // Cette méthode définit la relation "Une WalletTransaction appartient à un User".
    // ============================================================================
    public function user()
    {
        // ============================================================================
        // $this->belongsTo() définit une relation plusieurs-à-un.
        // User::class référence la classe du modèle lié.
        // Laravel déduit automatiquement la clé étrangère 'user_id'.
        // ============================================================================
        return $this->belongsTo(User::class);
    }

    // ============================================================================
    // Relation Eloquent belongsTo avec le modèle Cryptocurrency.
    // Cette méthode définit la relation "Une WalletTransaction concerne une Cryptocurrency".
    // Les paramètres explicites définissent les clés de la relation.
    // ============================================================================
    public function cryptocurrency()
    {
        // ============================================================================
        // $this->belongsTo() avec paramètres explicites pour les clés.
        // Cryptocurrency::class : classe du modèle lié.
        // 'crypto_id' : nom de la clé étrangère dans cette table.
        // 'id' : nom de la clé primaire dans la table des cryptos.
        // Ces paramètres sont nécessaires quand les noms ne suivent pas la convention.
        // ============================================================================
        return $this->belongsTo(Cryptocurrency::class, 'crypto_id', 'id');
    }
}

