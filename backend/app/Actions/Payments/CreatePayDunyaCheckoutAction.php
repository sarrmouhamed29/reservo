<?php

namespace App\Actions\Payments;

use App\Models\Booking;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class CreatePayDunyaCheckoutAction
{
    public function execute(Booking $booking): string
    {
        $mode = config('services.paydunya.mode', 'test');
        $baseUrl = $mode === 'live'
            ? 'https://app.paydunya.com/api/v1'
            : 'https://app.paydunya.com/sandbox-api/v1';

        $resource = $booking->resource;
        $frontendUrl = rtrim((string) config('app.frontend_url'), '/');
        $appUrl = rtrim((string) config('app.url'), '/');

        $response = Http::withHeaders([
            'PAYDUNYA-MASTER-KEY' => config('services.paydunya.master_key'),
            'PAYDUNYA-PRIVATE-KEY' => config('services.paydunya.private_key'),
            'PAYDUNYA-TOKEN' => config('services.paydunya.token'),
            'Content-Type' => 'application/json',
        ])->post("{$baseUrl}/checkout-invoice/create", [
            'invoice' => [
                'total_amount' => (int) $booking->total_price,
                'description' => sprintf(
                    'Réservation : %s — %s → %s',
                    $resource->name,
                    $booking->starts_at->format('d/m/Y H:i'),
                    $booking->ends_at->format('d/m/Y H:i')
                ),
            ],
            'store' => [
                'name' => config('app.name', 'Reservo'),
                'website_url' => $frontendUrl,
            ],
            'actions' => [
                'cancel_url' => "{$frontendUrl}/bookings",
                'return_url' => "{$frontendUrl}/bookings/success?token={CHECKOUT_TOKEN}",
                'callback_url' => "{$appUrl}/paydunya/webhook",
            ],
            'custom_data' => [
                'booking_id' => $booking->id,
            ],
        ]);

        $data = $response->json();

        if (($data['response_code'] ?? '') !== '00') {
            throw new RuntimeException('PayDunya invoice creation failed: '.($data['response_text'] ?? 'unknown error'));
        }

        // On success PayDunya puts the checkout URL in `response_text` (there is no `redirect_url`).
        $checkoutUrl = $data['response_text'] ?? '';
        $token = $data['token'] ?? '';

        if ($token === '' || ! filter_var($checkoutUrl, FILTER_VALIDATE_URL)) {
            throw new RuntimeException('PayDunya returned an unexpected invoice response.');
        }

        $booking->update(['paydunya_invoice_token' => $token]);

        return $checkoutUrl;
    }
}
