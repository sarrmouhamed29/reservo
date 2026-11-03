<?php

namespace App\Actions\Payments;

use App\Enums\BookingStatus;
use App\Models\Booking;
use Stripe\Event;

class HandleStripeWebhookAction
{
    public function execute(Event $event): void
    {
        if ($event->type !== 'checkout.session.completed') {
            return;
        }

        $session = $event->data->object;

        $booking = Booking::where('stripe_session_id', $session->id)->first();

        if (!$booking || $booking->status === BookingStatus::Paid) {
            return; // Idempotent — already processed or booking not found
        }

        $booking->update([
            'status'                    => BookingStatus::Paid,
            'stripe_payment_intent_id'  => $session->payment_intent,
        ]);
    }
}
