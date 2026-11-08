<?php

namespace App\Exceptions;

use RuntimeException;

class BookingConflictException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('This time slot is already booked. Please choose another time.');
    }
}
