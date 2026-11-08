<?php

namespace Database\Seeders;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\Resource;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Demo data for screenshots and manual testing: bookings in every status for
 * user@reservo.test, plus slots taken by another user so the slot picker shows "Occupé".
 */
class DemoBookingSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'user@reservo.test')->firstOrFail();
        $other = User::firstOrCreate(['email' => 'awa@reservo.test'], [
            'name' => 'Awa Ndiaye',
            'password' => Hash::make('password'),
            'role' => 'user',
        ]);

        $room = Resource::where('name', 'Salle Conférence A')->firstOrFail();
        $big = Resource::where('name', 'Grande Salle')->firstOrFail();
        $projector = Resource::where('name', 'Vidéoprojecteur 4K')->firstOrFail();
        $office = Resource::where('name', 'Bureau Privé')->firstOrFail();

        // [user, resource, day offset, start hour, hours, status]
        $rows = [
            // Upcoming
            [$user, $room, 2, 10, 2, BookingStatus::Paid],
            [$user, $projector, 3, 14, 3, BookingStatus::Pending],
            [$user, $big, 6, 9, 4, BookingStatus::Paid],
            // Past
            [$user, $office, -3, 9, 2, BookingStatus::Paid],
            [$user, $room, -9, 15, 1, BookingStatus::Paid],
            // Cancelled
            [$user, $projector, 5, 11, 2, BookingStatus::Cancelled],
            // Taken by someone else: shows as "Occupé" in the slot picker
            [$other, $room, 1, 9, 1, BookingStatus::Paid],
            [$other, $room, 1, 12, 2, BookingStatus::Paid],
            [$other, $room, 1, 16, 1, BookingStatus::Pending],
        ];

        foreach ($rows as [$owner, $resource, $day, $hour, $hours, $status]) {
            $start = now()->startOfDay()->addDays($day)->setTime($hour, 0);

            Booking::create([
                'user_id' => $owner->id,
                'resource_id' => $resource->id,
                'starts_at' => $start,
                'ends_at' => $start->copy()->addHours($hours),
                'status' => $status,
                'total_price' => $hours * $resource->hourly_price,
                'paydunya_invoice_token' => $status === BookingStatus::Paid ? 'demo_'.fake()->unique()->regexify('[a-z0-9]{12}') : null,
                'cancelled_at' => $status === BookingStatus::Cancelled ? now() : null,
            ]);
        }
    }
}
