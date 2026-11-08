<?php

namespace App\Http\Controllers\Api\V1\PayDunya;

use App\Actions\Payments\HandlePayDunyaIpnAction;
use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;

/**
 * Lets the payment return page settle a booking without waiting for the IPN
 * (which cannot reach a local machine). PayDunya is asked directly, so the browser
 * cannot make a booking paid by itself.
 */
class SyncController extends Controller
{
    public function __invoke(Booking $booking, HandlePayDunyaIpnAction $action): BookingResource|JsonResponse
    {
        $this->authorize('view', $booking);

        if (! $booking->paydunya_invoice_token) {
            return response()->json(['message' => 'Aucun paiement PayDunya n\'a été lancé pour cette réservation.'], 422);
        }

        $settled = $action->execute($booking->paydunya_invoice_token) ?? $booking;

        return new BookingResource($settled->load('resource.images'));
    }
}
