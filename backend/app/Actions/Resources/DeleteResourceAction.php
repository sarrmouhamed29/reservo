<?php

namespace App\Actions\Resources;

use App\Enums\BookingStatus;
use App\Models\Resource;

class DeleteResourceAction
{
    public function execute(Resource $resource): void
    {
        $hasActiveBookings = $resource->bookings()
            ->whereIn('status', [BookingStatus::Pending->value, BookingStatus::Paid->value])
            ->exists();

        if ($hasActiveBookings) {
            abort(422, 'Cannot delete a resource with active or paid bookings.');
        }

        $resource->delete();
    }
}
