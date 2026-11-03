<?php

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\User;

test('owner can cancel a pending booking', function () {
    $user = User::factory()->create();
    $booking = Booking::factory()->for($user)->create(['status' => BookingStatus::Pending]);

    $this->actingAs($user)
        ->deleteJson("/api/v1/bookings/{$booking->id}")
        ->assertNoContent();

    expect($booking->fresh()->status)->toBe(BookingStatus::Cancelled);
});

test('other user cannot cancel someone else booking', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $booking = Booking::factory()->for($owner)->create(['status' => BookingStatus::Pending]);

    $this->actingAs($other)
        ->deleteJson("/api/v1/bookings/{$booking->id}")
        ->assertForbidden();
});

test('cannot cancel an already cancelled booking', function () {
    $user = User::factory()->create();
    $booking = Booking::factory()->for($user)->create(['status' => BookingStatus::Cancelled]);

    $this->actingAs($user)
        ->deleteJson("/api/v1/bookings/{$booking->id}")
        ->assertStatus(409);
});
