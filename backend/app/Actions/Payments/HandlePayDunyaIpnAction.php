<?php

namespace App\Actions\Payments;

use App\Enums\BookingStatus;
use App\Models\Booking;
use Illuminate\Support\Facades\Http;

class HandlePayDunyaIpnAction
{
    public function execute(string $invoiceToken): void
    {
        $mode = config('services.paydunya.mode', 'test');
        $baseUrl = $mode === 'live'
            ? 'https://app.paydunya.com/api/v1'
            : 'https://app.paydunya.com/sandbox-api/v1';

        $response = Http::withHeaders([
            'PAYDUNYA-MASTER-KEY' => config('services.paydunya.master_key'),
            'PAYDUNYA-PRIVATE-KEY' => config('services.paydunya.private_key'),
            'PAYDUNYA-TOKEN' => config('services.paydunya.token'),
        ])->get("{$baseUrl}/checkout-invoice/confirm/{$invoiceToken}");

        $data = $response->json();

        if (($data['response_code'] ?? '') !== '00') {
            return;
        }

        $status = $data['invoice']['status'] ?? '';

        if ($status !== 'completed') {
            return;
        }

        $booking = Booking::where('paydunya_invoice_token', $invoiceToken)->first();

        if (! $booking || $booking->status === BookingStatus::Paid) {
            return;
        }

        $booking->update(['status' => BookingStatus::Paid]);
    }
}
