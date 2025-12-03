<?php

namespace App\Exceptions;

use Exception;


class InsufficientCryptoHoldingsException extends Exception
{
    
    public function __construct($cryptoId, $requested, $available)
    {
        $message = sprintf(
            'Insufficient %s holdings. Requested: %.8f, Available: %.8f',
            strtoupper($cryptoId),
            $requested,
            $available
        );
        parent::__construct($message, 400);
    }
}
