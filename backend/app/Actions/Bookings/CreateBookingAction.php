<?php

namespace App\Actions\Bookings;

use App\Enums\BookingStatus;
use App\Exceptions\BookingConflictException;
use App\Models\Booking;
use App\Models\Resource;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

class CreateBookingAction
{
    /** @param array<string, mixed> $data */
    public function execute(User $user, array $data): Booking
    {
        $resource = Resource::findOrFail($data['resource_id']);

        $startsAt = Carbon::parse($data['starts_at']);
        $endsAt = Carbon::parse($data['ends_at']);

        $durationHours = $startsAt->diffInMinutes($endsAt) / 60;
        $totalPriceCents = (int) ceil($durationHours * $resource->hourly_price_cents);

        try {
            return DB::transaction(function () use ($user, $resource, $startsAt, $endsAt, $totalPriceCents) {
                return Booking::create([
                    'user_id' => $user->id,
                    'resource_id' => $resource->id,
                    'starts_at' => $startsAt,
                    'ends_at' => $endsAt,
                    'status' => BookingStatus::Pending,
                    'total_price_cents' => $totalPriceCents,
                ]);
            });
        } catch (QueryException $e) {
            // PostgreSQL exclusion violation: SQLSTATE 23P01
            if ($e->getCode() === '23P01') {
                throw new BookingConflictException;
            }
            throw $e;
        }
    }
}
