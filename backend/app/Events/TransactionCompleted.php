<?php

namespace App\Events;

// Importe Channel pour créer des canaux de broadcast
use Illuminate\Broadcasting\Channel;
// Importe InteractsWithSockets pour gérer les interactions WebSocket
use Illuminate\Broadcasting\InteractsWithSockets;
// Importe PrivateChannel pour créer des canaux privés (sécurisés)
use Illuminate\Broadcasting\PrivateChannel;
// Importe l'interface pour les événements diffusables via WebSocket
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
// Importe Dispatchable pour déclencher cet événement
use Illuminate\Foundation\Events\Dispatchable;
// Importe SerializesModels pour sérialiser les modèles Eloquent
use Illuminate\Queue\SerializesModels;

/**
 * Événement TransactionCompleted
 * 
 * Cet événement est déclenché lorsqu'une transaction d'achat ou de vente de cryptomonnaie
 * est complétée avec succès. Il notifie l'utilisateur en temps réel du résultat de sa transaction.
 * L'événement est diffusé via WebSocket au client concerné.
 */
class TransactionCompleted implements ShouldBroadcast
{
    // Dispatchable: permet de déclencher l'événement avec dispatch()
    // InteractsWithSockets: fournit des méthodes pour les événements WebSocket
    // SerializesModels: sérialise les modèles automatiquement lors du broadcast
    use Dispatchable, InteractsWithSockets, SerializesModels;

    // L'ID de l'utilisateur qui a effectué la transaction
    public int $userId;
    // Le type de transaction: 'buy' (achat) ou 'sell' (vente)
    public string $type;
    // L'ID de la cryptomonnaie impliquée dans la transaction (ex: 'BTC', 'ETH', 'XRP')
    public string $cryptoId;
    // La quantité de crypto achetée ou vendue
    public float $quantity;
    // Le prix par unité de crypto au moment de la transaction
    public float $pricePerUnit;
    // Le montant total de la transaction (quantity × pricePerUnit)
    public float $totalAmount;
    // Le statut de la transaction: 'success' ou 'failed'
    public string $status;
    // Le message descriptif de la transaction (ex: "Buy of 0.5 BTC completed successfully")
    public string $message;
    // L'horodatage de la transaction au format ISO 8601
    public string $timestamp;

    /**
     * Constructeur de l'événement TransactionCompleted
     * 
     * @param int $userId L'ID de l'utilisateur qui a effectué la transaction
     * @param string $type Le type de transaction: 'buy' ou 'sell'
     * @param string $cryptoId L'ID de la cryptomonnaie (BTC, ETH, XRP, etc.)
     * @param float $quantity La quantité de crypto transactionnée
     * @param float $pricePerUnit Le prix par unité de crypto
     * @param string $status Le statut de la transaction (par défaut: 'success')
     * @param string $message Le message descriptif (par défaut: généré automatiquement)
     */
    public function __construct(int $userId, string $type, string $cryptoId, float $quantity, float $pricePerUnit, string $status = 'success', string $message = '')
    {
        // Stocke l'ID de l'utilisateur qui a effectué la transaction
        $this->userId = $userId;
        // Stocke le type de transaction (buy ou sell)
        $this->type = $type;
        // Stocke l'ID de la cryptomonnaie (clé primaire: BTC, ETH, XRP, etc.)
        $this->cryptoId = $cryptoId;
        // Stocke la quantité transactionnée
        $this->quantity = $quantity;
        // Stocke le prix par unité au moment de la transaction
        $this->pricePerUnit = $pricePerUnit;
        // Calcule et stocke le montant total (quantity × pricePerUnit)
        $this->totalAmount = $quantity * $pricePerUnit;
        // Stocke le statut de la transaction (success ou failed)
        $this->status = $status;
        // Si aucun message n'est fourni, génère un message par défaut
        // Exemple: "Buy of 0.5 BTC completed successfully"
        $this->message = $message ?: ucfirst($type) . ' of ' . $quantity . ' ' . strtoupper($cryptoId) . ' completed successfully';
        // Enregistre le timestamp actuel au format ISO 8601 pour synchronisation avec le frontend
        $this->timestamp = now()->toIso8601String();
    }

    /**
     * Détermine les canaux sur lesquels cet événement doit être diffusé
     * 
     * Retourne un tableau de canaux privés pour que seul l'utilisateur concerné reçoive l'événement
     * 
     * @return array Les canaux de broadcast (canal privé pour cet utilisateur)
     */
    public function broadcastOn(): array
    {
        // Crée un canal privé nommé 'user.{userId}'
        // Seul cet utilisateur spécifique peut écouter les mises à jour de ses transactions
        // Cette approche assure la confidentialité des données de transaction
        return [
            new PrivateChannel('user.' . $this->userId),
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
        // Sur le frontend: listen('transaction-completed', (data) => { ... })
        return 'transaction-completed';
    }

    /**
     * Prépare les données à diffuser via WebSocket
     * 
     * Retourne les données formatées qui seront envoyées au frontend
     * 
     * @return array Les données à broadcaster au frontend
     */
    public function broadcastWith(): array
    {
        // Retourne toutes les informations de la transaction formatées comme tableau
        // Ces données sont transmises au frontend en JSON via WebSocket
        return [
            'userId' => $this->userId,              // L'utilisateur qui a transactionné
            'type' => $this->type,                  // Type: 'buy' ou 'sell'
            'cryptoId' => $this->cryptoId,          // La cryptomonnaie impliquée
            'quantity' => $this->quantity,          // Quantité transactionnée
            'pricePerUnit' => $this->pricePerUnit,  // Prix unitaire au moment de la transaction
            'totalAmount' => $this->totalAmount,    // Montant total (quantity × pricePerUnit)
            'status' => $this->status,              // Statut: 'success' ou 'failed'
            'message' => $this->message,            // Message descriptif pour l'utilisateur
            'timestamp' => $this->timestamp,        // Horodatage de la transaction
        ];
    }
}
