<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserBalanceChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $userId;
    public float $newBalance;
    public float $previousBalance;
    public float $balanceChange;
    public string $reason;
    public string $updatedAt;

    public function __construct(int $userId, float $newBalance, float $previousBalance, string $reason)
    {
        $this->userId = $userId;
        $this->newBalance = $newBalance;
        $this->previousBalance = $previousBalance;
        $this->balanceChange = $newBalance - $previousBalance;
        $this->reason = $reason;
        $this->updatedAt = now()->toIso8601String();
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->userId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'balance-changed';
    }

    public function broadcastWith(): array
    {
        return [
            'userId' => $this->userId,
            'newBalance' => $this->newBalance,
            'previousBalance' => $this->previousBalance,
            'balanceChange' => $this->balanceChange,
            'reason' => $this->reason,
            'updatedAt' => $this->updatedAt,
        ];
    }
}
