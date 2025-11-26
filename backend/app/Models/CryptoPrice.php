<?php

namespace App\Models;

// Importe la classe Model de base pour tous les modèles Eloquent
use Illuminate\Database\Eloquent\Model;

/**
 * Modèle CryptoPrice
 * 
 * Ce modèle représente un enregistrement de prix historique pour une cryptomonnaie
 * à une date donnée. Chaque jour, un nouveau prix est enregistré pour chaque crypto.
 * 
 * Cela permet de construire un graphique de l'historique des prix sur 30 jours
 * pour afficher l'évolution du prix des cryptomonnaies au frontend.
 */
class CryptoPrice extends Model
{
    /**
     * Les attributs assignables en masse (mass assignable).
     * 
     * Ces attributs peuvent être remplis en masse via create() ou update()
     * 
     * Attributs:
     * - crypto_id: l'ID de la cryptomonnaie (clé étrangère vers Cryptocurrency)
     * - price_date: la date du prix (jour pour lequel ce prix s'applique)
     * - price: la valeur du prix en EUR pour cette date
     *
     * @var list<string>
     */
    protected $fillable = [
        'crypto_id',    // Clé étrangère: ID de la cryptomonnaie (BTC, ETH, XRP)
        'price_date',   // Date du prix (l'horodatage du prix)
        'price',        // Valeur du prix en EUR
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
            // Cast 'price_date' comme 'date': convertit la chaîne de date en objet Carbon\Date
            // Facilite la manipulation des dates (ex: $cryptoPrice->price_date->format('Y-m-d'))
            'price_date' => 'date',
        ];
    }

    /**
     * Relation: Un prix de crypto APPARTIENT À une cryptomonnaie
     * 
     * Cette relation définit qu'un CryptoPrice appartient à exactement une Cryptocurrency
     * Chaque prix est lié à une cryptomonnaie spécifique (BTC, ETH, XRP)
     * 
     * Utilisation:
     * - $cryptoPrice->cryptocurrency()->first(): obtenir la crypto parent
     * - $cryptoPrice->cryptocurrency->name: accéder au nom de la crypto (Eager loading)
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo La relation plusieurs-à-un
     */
    public function cryptocurrency()
    {
        // Retourne une relation belongsTo vers le modèle Cryptocurrency
        // Spécifie les clés: 'crypto_id' (clé étrangère ici) => 'id' (clé primaire du parent)
        // Plusieurs prix appartiennent à une crypto, une crypto peut avoir plusieurs prix
        return $this->belongsTo(Cryptocurrency::class, 'crypto_id', 'id');
    }
}
