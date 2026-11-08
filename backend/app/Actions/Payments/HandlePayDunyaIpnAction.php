<?php

namespace App\Actions\Payments;

use App\Enums\BookingStatus;
use App\Models\Booking;
use Illuminate\Support\Facades\Http;

/**
 * Settles a booking from a PayDunya invoice token.
 *
 * The token never proves anything by itself: the invoice is always re-fetched from PayDunya's
 * API, so this is safe to call from the IPN webhook and from the return page alike.
 */
class HandlePayDunyaIpnAction
{
    /** Returns the booking behind the token (fresh), or null when there is none. */
    public function execute(string $invoiceToken): ?Booking
    {
        $booking = Booking::where('paydunya_invoice_token', $invoiceToken)->first();

        if (! $booking) {
            return null;
        }

        if ($booking->status === BookingStatus::Pending && $this->isCompleted($invoiceToken)) {
            $booking->update(['status' => BookingStatus::Paid]);
        }

        return $booking->fresh();
    }

    private function isCompleted(string $invoiceToken): bool
    {
        $baseUrl = config('services.paydunya.mode') === 'live'
            ? 'https://app.paydunya.com/api/v1'
            : 'https://app.paydunya.com/sandbox-api/v1';

        $data = Http::withHeaders([
            'PAYDUNYA-MASTER-KEY' => config('services.paydunya.master_key'),
            'PAYDUNYA-PRIVATE-KEY' => config('services.paydunya.private_key'),
            'PAYDUNYA-TOKEN' => config('services.paydunya.token'),
        ])->get("{$baseUrl}/checkout-invoice/confirm/{$invoiceToken}")->json();

        if (($data['response_code'] ?? '') !== '00') {
            return false;
        }

        // PayDunya reports the payment status at the top level of the response.
        return ($data['status'] ?? $data['invoice']['status'] ?? '') === 'completed';
    }
}
