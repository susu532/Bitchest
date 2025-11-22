<?php

use Illuminate\Support\Facades\Broadcast;

// Broadcast authentication
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Private user channel for balance and transaction notifications
Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Public channel for crypto price updates
Broadcast::channel('crypto-prices', function ($user) {
    return true;
});

// Public channel for specific crypto prices
Broadcast::channel('crypto-price.{cryptoId}', function ($user, $cryptoId) {
    return true;
});
