<?php

namespace App\Models;

// Importe la classe Model de base pour tous les modèles Eloquent
use Illuminate\Database\Eloquent\Model;

/**
 * Modèle WalletTransaction
 * 
 * Ce modèle représente une transaction de portefeuille (achat ou vente de crypto).
 * Chaque fois qu'un utilisateur achète ou vend une cryptomonnaie, une WalletTransaction est créée.
 * 
 * Cela permet de tracer l'historique complet des achats/ventes de chaque utilisateur
 * pour:
 * - Calculer les holdings actuels (quantité nette possédée)
 * - Afficher l'historique des transactions au client
 * - Calculer le prix moyen d'achat (cost basis)
 * 
 * Les transactions forment l'audit trail (journal d'audit) du portefeuille.
 */
class WalletTransaction extends Model
{
    /**
     * Les attributs assignables en masse (mass assignable).
     * 
     * Ces attributs peuvent être remplis en masse via create() ou update()
     * 
     * Attributs:
     * - user_id: l'ID de l'utilisateur qui a effectué la transaction (clé étrangère)
     * - crypto_id: l'ID de la cryptomonnaie transactionnée (clé étrangère)
     * - quantity: la quantité de crypto achetée ou vendue
     * - price_per_unit: le prix par unité de crypto au moment de la transaction (en EUR)
     * - type: le type de transaction ('buy' pour achat, 'sell' pour vente)
     * - transaction_date: la date et l'heure de la transaction
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',              // Clé étrangère: ID de l'utilisateur
        'crypto_id',            // Clé étrangère: ID de la cryptomonnaie (BTC, ETH, XRP)
        'quantity',             // Quantité de crypto transactionnée
        'price_per_unit',       // Prix par unité en EUR au moment de la transaction
        'type',                 // Type: 'buy' (achat) ou 'sell' (vente)
        'transaction_date',     // Date et heure de la transaction
    ];

    /**
     * Défini les conversions de type pour les attributs du modèle.
     * 
     * Spécifie comment les attributs doivent être castés en types spécifiques
     * lors de la récupération ou du stockage en base de données.
     *
     * @return array<string, string> Tableau de conversions [attribut => type]
     */
    protected function casts()
    {
        // Retourne les conversions de type pour ce modèle
        return [
            // Cast 'transaction_date' comme 'datetime': convertit en objet Carbon\DateTime
            // Facilite la manipulation des dates (ex: $transaction->transaction_date->format('Y-m-d H:i:s'))
            'transaction_date' => 'datetime',
        ];
    }

    /**
     * Relation: Une transaction APPARTIENT À un utilisateur
     * 
     * Cette relation définit qu'une WalletTransaction appartient à exactement un User
     * Chaque transaction est effectuée par un utilisateur spécifique
     * 
     * Utilisation:
     * - $transaction->user()->first(): obtenir l'utilisateur qui a effectué la transaction
     * - $transaction->user->email: accéder à l'email de l'utilisateur (Eager loading)
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo La relation plusieurs-à-un
     */
    public function user()
    {
        // Retourne une relation belongsTo vers le modèle User
        // Par convention, Laravel cherche 'user_id' comme clé étrangère
        // Une transaction appartient à un utilisateur, un utilisateur peut avoir plusieurs transactions
        return $this->belongsTo(User::class);
    }

    /**
     * Relation: Une transaction APPARTIENT À une cryptomonnaie
     * 
     * Cette relation définit qu'une WalletTransaction appartient à exactement une Cryptocurrency
     * Chaque transaction implique l'achat/vente d'une cryptomonnaie spécifique
     * 
     * Utilisation:
     * - $transaction->cryptocurrency()->first(): obtenir la crypto impliquée
     * - $transaction->cryptocurrency->name: accéder au nom de la crypto (Eager loading)
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo La relation plusieurs-à-un
     */
    public function cryptocurrency()
    {
        // Retourne une relation belongsTo vers le modèle Cryptocurrency
        // Spécifie les clés: 'crypto_id' (clé étrangère ici) => 'id' (clé primaire du parent)
        // Une transaction implique une crypto, une crypto peut être impliquée dans plusieurs transactions
        return $this->belongsTo(Cryptocurrency::class, 'crypto_id', 'id');
    }
}
