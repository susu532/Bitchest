<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TransactionCompleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $userId;
    public string $type; // 'buy' or 'sell'
    public string $cryptoId;
    public float $quantity;
    public float $pricePerUnit;
    public float $totalAmount;
    public string $status;
    public string $message;
    public string $timestamp;

    public function __construct(int $userId, string $type, string $cryptoId, float $quantity, float $pricePerUnit, string $status = 'success', string $message = '')
    {
        $this->userId = $userId;
        $this->type = $type;
        $this->cryptoId = $cryptoId;
        $this->quantity = $quantity;
        $this->pricePerUnit = $pricePerUnit;
        $this->totalAmount = $quantity * $pricePerUnit;
        $this->status = $status;
        $this->message = $message ?: ucfirst($type) . ' of ' . $quantity . ' ' . strtoupper($cryptoId) . ' completed successfully';
        $this->timestamp = now()->toIso8601String();
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->userId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'transaction-completed';
    }

    public function broadcastWith(): array
    {
        return [
            'userId' => $this->userId,
            'type' => $this->type,
            'cryptoId' => $this->cryptoId,
            'quantity' => $this->quantity,
            'pricePerUnit' => $this->pricePerUnit,
            'totalAmount' => $this->totalAmount,
            'status' => $this->status,
            'message' => $this->message,
            'timestamp' => $this->timestamp,
        ];
    }
}
