<?php

namespace App\Exceptions;

use Exception;


class InsufficientBalanceException extends Exception
{
    
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
