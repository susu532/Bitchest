<?php

namespace App\Exceptions;

use Exception;

/**
 * Exception lancée quand un client tente de vendre plus de crypto qu'il n'en possède
 */
class InsufficientCryptoHoldingsException extends Exception
{
    /**
     * Constructeur de l'exception
     * 
     * @param string $cryptoId ID de la cryptomonnaie
     * @param float $requested Quantité demandée
     * @param float $available Quantité disponible
     */
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
