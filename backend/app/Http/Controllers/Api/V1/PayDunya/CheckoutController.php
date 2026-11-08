<?php

namespace App\Http\Controllers\Api\V1\PayDunya;

use App\Actions\Payments\CreatePayDunyaCheckoutAction;
use App\Enums\BookingStatus;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;

class CheckoutController extends Controller
{
    public function __invoke(Booking $booking, CreatePayDunyaCheckoutAction $action): JsonResponse
    {
        $this->authorize('view', $booking);

        if ($booking->status !== BookingStatus::Pending) {
            return response()->json(['message' => 'Cette réservation ne peut plus être payée.'], 409);
        }

        $checkoutUrl = $action->execute($booking);

        return response()->json(['checkout_url' => $checkoutUrl]);
    }
}
