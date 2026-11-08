<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Bookings\CancelBookingAction;
use App\Actions\Bookings\CreateBookingAction;
use App\Enums\BookingStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\StoreBookingRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class BookingController extends Controller
{
    public function index(Request $request): ResourceCollection
    {
        $this->authorize('viewAny', Booking::class);

        $query = Booking::with('resource.images')
            ->where('user_id', $request->user()->id);

        // Used by the payment return page to find the booking behind a checkout.
        foreach (['paydunya_invoice_token', 'stripe_session_id'] as $filter) {
            if ($request->filled($filter)) {
                $query->where($filter, $request->string($filter)->toString());
            }
        }

        $bookings = $query->latest()->paginate(15);

        return BookingResource::collection($bookings);
    }

    public function store(StoreBookingRequest $request, CreateBookingAction $action): JsonResponse
    {
        $this->authorize('create', Booking::class);

        $booking = $action->execute($request->user(), $request->validated());

        return (new BookingResource($booking->load('resource.images')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Booking $booking): BookingResource
    {
        $this->authorize('view', $booking);

        return new BookingResource($booking->load('resource.images'));
    }

    public function destroy(Booking $booking, CancelBookingAction $action): JsonResponse
    {
        $this->authorize('cancel', $booking);

        if ($booking->status === BookingStatus::Cancelled) {
            return response()->json(['message' => 'Booking is already cancelled.'], 409);
        }

        $action->execute($booking);

        return response()->json(null, 204);
    }
}
