<?php

namespace App\Actions\Payments;

use App\Models\Booking;
use Stripe\Checkout\Session;
use Stripe\Stripe;

class CreateStripeCheckoutAction
{
    public function execute(Booking $booking): string
    {
        Stripe::setApiKey(config('services.stripe.secret'));

        $resource = $booking->resource;
        $frontendUrl = config('app.frontend_url');

        $session = Session::create([
            'line_items' => [[
                'price_data' => [
                    'currency' => 'eur',
                    'unit_amount' => $booking->total_price_cents,
                    'product_data' => [
                        'name' => "Réservation : {$resource->name}",
                        'description' => sprintf(
                            'Du %s au %s',
                            $booking->starts_at->format('d/m/Y H:i'),
                            $booking->ends_at->format('d/m/Y H:i')
                        ),
                    ],
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => "{$frontendUrl}/bookings/success?session_id={CHECKOUT_SESSION_ID}",
            'cancel_url' => "{$frontendUrl}/bookings",
            'metadata' => [
                'booking_id' => $booking->id,
            ],
        ]);

        $booking->update(['stripe_session_id' => $session->id]);

        return $session->url;
    }
}
