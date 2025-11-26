<?php

namespace App\Models;

// Importe la classe Model de base pour tous les modèles Eloquent
use Illuminate\Database\Eloquent\Model;

/**
 * Modèle Cryptocurrency
 * 
 * Ce modèle représente une cryptomonnaie disponible sur la plateforme BitChest.
 * Chaque cryptomonnaie a un ID unique (ex: 'BTC', 'ETH', 'XRP')
 * qui sert de clé primaire au lieu d'un ID numérique auto-incrémenté.
 * 
 * Les cryptomonnaies sont les assets qu'on peut acheter/vendre sur la plateforme.
 */
class Cryptocurrency extends Model
{
    // Spécifie que la clé primaire est de type 'string' (pas 'integer')
    // Par défaut, Eloquent utilise 'integer' pour la clé primaire
    protected $keyType = 'string';
    
    // Désactive l'auto-incrémentation de la clé primaire
    // Par défaut, Eloquent auto-incrémente l'ID (1, 2, 3...)
    // Ici, la clé primaire est définie manuellement (BTC, ETH, XRP)
    public $incrementing = false;

    /**
     * Les attributs assignables en masse (mass assignable).
     * 
     * Ces attributs peuvent être remplis en masse via create() ou update()
     * 
     * Attributs:
     * - id: l'identifiant unique de la cryptomonnaie (BTC, ETH, XRP, etc.)
     * - name: le nom complet de la cryptomonnaie (Bitcoin, Ethereum, Ripple)
     * - symbol: le symbole ticker (généralement = id)
     * - icon: URL de l'icône de la cryptomonnaie (pour l'affichage frontend)
     *
     * @var list<string>
     */
    protected $fillable = [
        'id',       // Clé primaire: identifiant court (BTC, ETH, XRP, etc.)
        'name',     // Nom complet de la cryptomonnaie
        'symbol',   // Symbole ticker (généralement égal à 'id')
        'icon',     // URL vers l'image/icône pour l'affichage
    ];

    /**
     * Relation: Une cryptomonnaie a PLUSIEURS prix historiques
     * 
     * Cette relation définit qu'une cryptomonnaie a plusieurs CryptoPrice
     * Chaque jour, un nouveau prix est enregistré dans CryptoPrice
     * Permet de tracer l'historique des prix sur 30 jours
     * 
     * Utilisation:
     * - $crypto->prices()->get(): obtenir tous les prix historiques
     * - $crypto->prices: accès lazy-loaded
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany La relation un-à-plusieurs
     */
    public function prices()
    {
        // Retourne une relation hasMany vers le modèle CryptoPrice
        // Spécifie les clés: 'crypto_id' (clé étrangère) => 'id' (clé primaire ici)
        // Une cryptomonnaie a plusieurs prix, un prix appartient à une cryptomonnaie
        return $this->hasMany(CryptoPrice::class, 'crypto_id', 'id');
    }

    /**
     * Relation: Une cryptomonnaie a PLUSIEURS transactions de portefeuille
     * 
     * Cette relation définit qu'une cryptomonnaie peut être impliquée dans plusieurs transactions
     * Lorsqu'un utilisateur achète/vend BTC, une WalletTransaction est créée avec cette crypto
     * 
     * Utilisation:
     * - $crypto->transactions()->get(): obtenir toutes les transactions impliquant cette crypto
     * - Permet de voir combien de BTC ont été vendus/achetés en total
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany La relation un-à-plusieurs
     */
    public function transactions()
    {
        // Retourne une relation hasMany vers le modèle WalletTransaction
        // Spécifie les clés: 'crypto_id' (clé étrangère) => 'id' (clé primaire ici)
        // Une cryptomonnaie peut être impliquée dans plusieurs transactions
        return $this->hasMany(WalletTransaction::class, 'crypto_id', 'id');
    }
}
