<?php

namespace App\Events;

// Importe Channel pour créer des canaux de broadcast publics et privés
use Illuminate\Broadcasting\Channel;
// Importe InteractsWithSockets pour gérer les interactions socket
use Illuminate\Broadcasting\InteractsWithSockets;
// Importe PrivateChannel pour créer des canaux privés (accessibles par les utilisateurs autorisés)
use Illuminate\Broadcasting\PrivateChannel;
// Importe l'interface pour les événements qui doivent être diffusés via WebSocket
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
// Importe Dispatchable pour pouvoir déclencher cet événement partout dans l'application
use Illuminate\Foundation\Events\Dispatchable;
// Importe SerializesModels pour pouvoir sérialiser les modèles Eloquent lors de la diffusion
use Illuminate\Queue\SerializesModels;

/**
 * Événement UserBalanceChanged
 * 
 * Cet événement est déclenché chaque fois que le solde EUR d'un client change
 * (achat, vente, dépôt, etc.). Il est diffusé via WebSocket aux utilisateurs autorisés
 * pour mettre à jour leur interface en temps réel.
 */
class UserBalanceChanged implements ShouldBroadcast
{
    // Dispatchable: permet de déclencher l'événement avec UserBalanceChanged::dispatch()
    // InteractsWithSockets: fournit des méthodes utiles pour la gestion WebSocket
    // SerializesModels: sérialise automatiquement les modèles dans les données de broadcast
    use Dispatchable, InteractsWithSockets, SerializesModels;

    // L'ID de l'utilisateur dont le solde a changé (clé primaire)
    public int $userId;
    // Le nouveau solde EUR de l'utilisateur après la modification
    public float $newBalance;
    // L'ancien solde EUR de l'utilisateur avant la modification
    public float $previousBalance;
    // La différence entre le nouveau et l'ancien solde (peut être positif ou négatif)
    public float $balanceChange;
    // La raison du changement (ex: "crypto_buy", "crypto_sell", etc.)
    public string $reason;
    // L'horodatage du changement au format ISO 8601 (pour le frontend)
    public string $updatedAt;

    /**
     * Constructeur de l'événement UserBalanceChanged
     * 
     * @param int $userId L'ID de l'utilisateur affecté
     * @param float $newBalance Le nouveau solde après la modification
     * @param float $previousBalance L'ancien solde avant la modification
     * @param string $reason La raison du changement de solde
     */
    public function __construct(int $userId, float $newBalance, float $previousBalance, string $reason)
    {
        // Stocke l'ID de l'utilisateur affecté
        $this->userId = $userId;
        // Stocke le nouveau solde
        $this->newBalance = $newBalance;
        // Stocke l'ancien solde
        $this->previousBalance = $previousBalance;
        // Calcule et stocke la différence (montant du changement: positif ou négatif)
        $this->balanceChange = $newBalance - $previousBalance;
        // Stocke la raison du changement de solde
        $this->reason = $reason;
        // Enregistre le timestamp actuel au format ISO 8601 pour la synchronisation frontend/backend
        $this->updatedAt = now()->toIso8601String();
    }

    /**
     * Détermine les canaux sur lesquels cet événement doit être diffusé
     * 
     * Retourne un tableau de canaux de broadcast privés
     * Seul l'utilisateur avec cet ID peut recevoir cet événement pour la sécurité
     * 
     * @return array Les canaux de broadcast (canal privé pour cet utilisateur)
     */
    public function broadcastOn(): array
    {
        // Crée un canal privé nommé 'user.{userId}' - seulement cet utilisateur peut l'écouter
        // Cette approche garantit que chaque utilisateur ne reçoit que ses propres mises à jour
        return [
            new PrivateChannel('user.' . $this->userId),
        ];
    }

    /**
     * Définit le nom de l'événement tel qu'il sera reçu par le frontend
     * 
     * Retourne le nom d'événement pour que le frontend puisse écouter 'balance-changed'
     * 
     * @return string Le nom d'événement pour le broadcast WebSocket
     */
    public function broadcastAs(): string
    {
        // Retourne le nom d'événement que le frontend doit écouter
        // Sur le frontend: listen('balance-changed', (data) => { ... })
        return 'balance-changed';
    }

    /**
     * Prépare les données à diffuser via WebSocket
     * 
     * Retourne les données exactes qui seront envoyées au frontend
     * Utilisé pour contrôler quelles informations sont transmises
     * 
     * @return array Les données à broadcaster au frontend
     */
    public function broadcastWith(): array
    {
        // Retourne toutes les propriétés publiques de l'événement formatées comme tableau
        // Ces données sont envoyées au frontend en JSON via WebSocket
        return [
            'userId' => $this->userId,              // L'utilisateur concerné
            'newBalance' => $this->newBalance,      // Le nouveau solde EUR
            'previousBalance' => $this->previousBalance,  // L'ancien solde EUR
            'balanceChange' => $this->balanceChange,  // La différence (montant modifié)
            'reason' => $this->reason,              // La raison du changement
            'updatedAt' => $this->updatedAt,        // L'horodatage du changement
        ];
    }
}
