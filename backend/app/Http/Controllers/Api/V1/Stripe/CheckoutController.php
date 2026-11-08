<?php

namespace App\Http\Controllers\Api\V1\Stripe;

use App\Actions\Payments\CreateStripeCheckoutAction;
use App\Enums\BookingStatus;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;

class CheckoutController extends Controller
{
    public function __invoke(Booking $booking, CreateStripeCheckoutAction $action): JsonResponse
    {
        $this->authorize('view', $booking);

        if ($booking->status !== BookingStatus::Pending) {
            abort(409, 'This booking cannot be paid (status: '.$booking->status->value.').');
        }

        $checkoutUrl = $action->execute($booking);

        return response()->json(['checkout_url' => $checkoutUrl]);
    }
}
