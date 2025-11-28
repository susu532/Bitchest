<?php

namespace App\Exceptions;

use Exception;

/**
 * Exception lancée quand le solde EUR d'un client est insuffisant pour une transaction
 */
class InsufficientBalanceException extends Exception
{
    /**
     * Constructeur de l'exception
     * 
     * @param float $required Montant requis pour la transaction
     * @param float $available Solde disponible
     */
    public function __construct($required, $available)
    {
        $message = sprintf(
            'Insufficient EUR balance. Required: €%.2f, Available: €%.2f',
            $required,
            $available
        );
        parent::__construct($message, 400);
    }
}
