<?php

namespace App\Actions\Bookings;

use App\Enums\BookingStatus;
use App\Models\Booking;

class CancelBookingAction
{
    public function execute(Booking $booking): Booking
    {
        $booking->update([
            'status'       => BookingStatus::Cancelled,
            'cancelled_at' => now(),
        ]);

        return $booking->fresh();
    }
}
