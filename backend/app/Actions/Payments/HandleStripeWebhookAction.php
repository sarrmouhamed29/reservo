<?php

namespace App\Actions\Payments;

use App\Enums\BookingStatus;
use App\Models\Booking;
use Stripe\Checkout\Session;
use Stripe\Event;

class HandleStripeWebhookAction
{
    public function execute(Event $event): void
    {
        if ($event->type !== 'checkout.session.completed') {
            return;
        }

        /** @var Session $session */
        $session = $event->data->object;

        $booking = Booking::where('stripe_session_id', $session->id)->first();

        if (! $booking || $booking->status === BookingStatus::Paid) {
            return;
        }

        $booking->update([
            'status' => BookingStatus::Paid,
            'stripe_payment_intent_id' => $session->payment_intent,
        ]);
    }
}
