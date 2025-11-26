<?php

namespace App\Models;

// Importe la classe Model de base pour tous les modèles Eloquent
use Illuminate\Database\Eloquent\Model;

/**
 * Modèle ClientAccount
 * 
 * Ce modèle représente le compte client (portefeuille) dans l'application BitChest.
 * Chaque utilisateur avec le rôle 'client' a exactement un ClientAccount.
 * 
 * Le ClientAccount stocke:
 * - user_id: le lien vers l'utilisateur propriétaire du compte
 * - balance_eur: le solde en euros du client (montant disponible pour acheter des cryptos)
 * 
 * Quand un client achète une crypto, son balance_eur diminue
 * Quand un client vend une crypto, son balance_eur augmente
 */
class ClientAccount extends Model
{
    /**
     * Les attributs assignables en masse (mass assignable).
     * 
     * Ces attributs peuvent être remplis en masse via create() ou update()
     * 
     * Attributs:
     * - user_id: l'ID de l'utilisateur propriétaire du compte (clé étrangère)
     * - balance_eur: le solde EUR disponible pour acheter des cryptos
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',      // Clé étrangère: ID de l'utilisateur propriétaire
        'balance_eur',  // Solde en euros (montant disponible pour acheter)
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
            // Cast 'balance_eur' comme 'decimal:2': stocke et récupère comme décimal à 2 chiffres
            // decimal:2 signifie: montant monétaire avec 2 décimales (ex: 1234.56)
            // Évite les erreurs de précision avec les nombres décimaux (money = no floating point!)
            'balance_eur' => 'decimal:2',
        ];
    }

    /**
     * Relation: Un compte client APPARTIENT À un utilisateur
     * 
     * Cette relation définit qu'un ClientAccount appartient à exactement un User
     * Chaque compte client est possédé par un utilisateur spécifique
     * 
     * Utilisation:
     * - $clientAccount->user()->first(): obtenir l'utilisateur propriétaire
     * - $clientAccount->user->first_name: accéder au prénom du propriétaire (Eager loading)
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo La relation plusieurs-à-un
     */
    public function user()
    {
        // Retourne une relation belongsTo vers le modèle User
        // Par convention, Laravel cherche 'user_id' comme clé étrangère
        // Un compte client appartient à un utilisateur, un utilisateur peut avoir un compte
        return $this->belongsTo(User::class);
    }
}
