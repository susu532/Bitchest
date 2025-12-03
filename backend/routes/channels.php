<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

Broadcast::channel('crypto-prices', function ($user) {
    return true;
});

Broadcast::channel('crypto-price.{cryptoId}', function ($user, $cryptoId) {
    return true;
});

