<?php

namespace App\Events;

// Importe Channel pour créer des canaux de broadcast publics
use Illuminate\Broadcasting\Channel;
// Importe InteractsWithSockets pour gérer les interactions WebSocket
use Illuminate\Broadcasting\InteractsWithSockets;
// Importe PresenceChannel pour les canaux avec détection de présence (optionnel ici)
use Illuminate\Broadcasting\PresenceChannel;
// Importe PrivateChannel pour les canaux privés (optionnel ici)
use Illuminate\Broadcasting\PrivateChannel;
// Importe l'interface pour les événements diffusables via WebSocket
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
// Importe Dispatchable pour déclencher cet événement
use Illuminate\Foundation\Events\Dispatchable;
// Importe SerializesModels pour sérialiser les modèles
use Illuminate\Queue\SerializesModels;

/**
 * Événement CryptoPriceUpdated
 * 
 * Cet événement est déclenché chaque fois qu'un prix de cryptomonnaie est mis à jour
 * dans le système. Contrairement aux événements privés (UserBalanceChanged, TransactionCompleted),
 * cet événement est DIFFUSÉ PUBLIQUEMENT à tous les clients connectés car les données de prix
 * sont publiques. Tous les utilisateurs reçoivent les mises à jour de prix en temps réel.
 */
class CryptoPriceUpdated implements ShouldBroadcast
{
    // Dispatchable: permet de déclencher l'événement avec dispatch()
    // InteractsWithSockets: fournit des méthodes pour les événements WebSocket
    // SerializesModels: sérialise les modèles automatiquement lors du broadcast
    use Dispatchable, InteractsWithSockets, SerializesModels;

    // L'ID de la cryptomonnaie dont le prix a changé (ex: 'BTC', 'ETH', 'XRP')
    public string $cryptoId;
    // Le nouveau prix de la cryptomonnaie en EUR
    public float $price;
    // L'ancien prix de la cryptomonnaie en EUR (avant la mise à jour)
    public float $previousPrice;
    // La différence de prix en EUR (price - previousPrice): positif (hausse) ou négatif (baisse)
    public float $priceChange;
    // La variation de prix en pourcentage ((priceChange / previousPrice) × 100)
    public float $percentageChange;
    // L'horodatage de la mise à jour du prix au format ISO 8601
    public string $updatedAt;

    /**
     * Constructeur de l'événement CryptoPriceUpdated
     * 
     * @param string $cryptoId L'ID de la cryptomonnaie (BTC, ETH, XRP, etc.)
     * @param float $price Le nouveau prix en EUR
     * @param float $previousPrice L'ancien prix en EUR
     * @param string $updatedAt L'horodatage de la mise à jour
     */
    public function __construct(string $cryptoId, float $price, float $previousPrice, string $updatedAt)
    {
        // Stocke l'ID de la cryptomonnaie
        $this->cryptoId = $cryptoId;
        // Stocke le nouveau prix
        $this->price = $price;
        // Stocke l'ancien prix pour comparaison
        $this->previousPrice = $previousPrice;
        // Calcule et stocke la différence de prix en EUR
        $this->priceChange = $price - $previousPrice;
        // Calcule la variation en pourcentage
        // Vérifie que previousPrice > 0 pour éviter une division par zéro
        // Si previousPrice est 0, retourne 0 (aucune variation calculable)
        $this->percentageChange = $previousPrice > 0 ? (($this->priceChange / $previousPrice) * 100) : 0;
        // Stocke l'horodatage de la mise à jour
        $this->updatedAt = $updatedAt;
    }

    /**
     * Détermine les canaux sur lesquels cet événement doit être diffusé
     * 
     * Retourne un tableau de canaux PUBLICS (non privés) car les données de prix sont publiques
     * Tous les utilisateurs connectés reçoivent les mises à jour de prix
     * 
     * @return array Les canaux de broadcast publics
     */
    public function broadcastOn(): array
    {
        // Retourne deux canaux publics:
        // 1. 'crypto-prices': canal général pour TOUS les mises à jour de prix
        //    Tous les utilisateurs écoutent ce canal pour les mises à jour globales
        // 2. 'crypto-price.{cryptoId}': canal spécifique pour cette cryptomonnaie
        //    Les utilisateurs intéressés par BTC peuvent écouter 'crypto-price.BTC'
        return [
            new Channel('crypto-prices'),              // Canal public global pour tous les prix
            new Channel('crypto-price.' . $this->cryptoId), // Canal public spécifique pour cette crypto
        ];
    }

    /**
     * Définit le nom d'événement pour le broadcast WebSocket
     * 
     * Retourne le nom que le frontend utilisera pour écouter cet événement
     * 
     * @return string Le nom d'événement WebSocket
     */
    public function broadcastAs(): string
    {
        // Retourne le nom d'événement que le frontend doit écouter
        // Sur le frontend: 
        //   - listen('crypto-prices', 'price-updated', (data) => { ... })
        //   - listen('crypto-price.BTC', 'price-updated', (data) => { ... })
        return 'price-updated';
    }

    /**
     * Prépare les données à diffuser via WebSocket
     * 
     * Retourne les données formatées qui seront envoyées à tous les clients connectés
     * 
     * @return array Les données à broadcaster au frontend
     */
    public function broadcastWith(): array
    {
        // Retourne toutes les informations de mise à jour de prix formatées comme tableau
        // Ces données sont transmises à TOUS les clients en JSON via WebSocket
        return [
            'cryptoId' => $this->cryptoId,              // La cryptomonnaie mise à jour
            'price' => $this->price,                    // Le nouveau prix en EUR
            'previousPrice' => $this->previousPrice,    // L'ancien prix en EUR
            'priceChange' => $this->priceChange,        // La différence en EUR (peut être positive ou négative)
            'percentageChange' => $this->percentageChange,  // La variation en pourcentage
            'updatedAt' => $this->updatedAt,            // L'horodatage de la mise à jour
        ];
    }
}
