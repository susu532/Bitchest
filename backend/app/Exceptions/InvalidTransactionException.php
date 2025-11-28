<?php

namespace App\Exceptions;

use Exception;

/**
 * Exception lancée quand une transaction est invalide
 */
class InvalidTransactionException extends Exception
{
    /**
     * Constructeur de l'exception
     * 
     * @param string $reason Raison de l'invalidité de la transaction
     */
    public function __construct($reason)
    {
        $message = sprintf('Invalid transaction: %s', $reason);
        parent::__construct($message, 400);
    }
}
