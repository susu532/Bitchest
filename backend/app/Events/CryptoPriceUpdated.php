<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;

use Illuminate\Broadcasting\InteractsWithSockets;

use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

use Illuminate\Foundation\Events\Dispatchable;

use Illuminate\Queue\SerializesModels;

class CryptoPriceUpdated implements ShouldBroadcast
{

    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $cryptoId;

    public float $price;

    public float $previousPrice;

    public float $priceChange;

    public float $percentageChange;

    public string $updatedAt;

    
    public function __construct(string $cryptoId, float $price, float $previousPrice, string $updatedAt)
    {

        $this->cryptoId = $cryptoId;

        $this->price = $price;

        $this->previousPrice = $previousPrice;

        $this->priceChange = $price - $previousPrice;

        $this->percentageChange = $previousPrice > 0 ? (($this->priceChange / $previousPrice) * 100) : 0;

        $this->updatedAt = $updatedAt;
    }

    
    public function broadcastOn(): array
    {

        return [
            new Channel('crypto-prices'),
            new Channel('crypto-price.' . $this->cryptoId),
        ];
    }

    
    public function broadcastAs(): string
    {

        return 'price-updated';
    }

    
    public function broadcastWith(): array
    {

        return [
            'cryptoId' => $this->cryptoId,
            'price' => $this->price,
            'previousPrice' => $this->previousPrice,
            'priceChange' => $this->priceChange,
            'percentageChange' => $this->percentageChange,
            'updatedAt' => $this->updatedAt,
        ];
    }
}
