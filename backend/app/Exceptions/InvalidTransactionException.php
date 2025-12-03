<?php

namespace App\Exceptions;

use Exception;


class InvalidTransactionException extends Exception
{
    
    public function __construct($reason)
    {
        $message = sprintf('Invalid transaction: %s', $reason);
        parent::__construct($message, 400);
    }
}
