<?php

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\Resource;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->resource = Resource::factory()->room()->create();
});

it('can create a booking on an available slot', function () {
    $this->actingAs($this->user)
        ->postJson('/api/v1/bookings', [
            'resource_id' => $this->resource->id,
            'starts_at' => now()->addDay()->toIso8601String(),
            'ends_at' => now()->addDay()->addHours(2)->toIso8601String(),
        ])->assertStatus(201);
});

it('returns 409 when booking overlaps an existing one', function () {
    Booking::factory()->create([
        'resource_id' => $this->resource->id,
        'starts_at' => now()->addDay(),
        'ends_at' => now()->addDay()->addHours(3),
        'status' => BookingStatus::Pending->value,
    ]);

    $this->actingAs($this->user)
        ->postJson('/api/v1/bookings', [
            'resource_id' => $this->resource->id,
            'starts_at' => now()->addDay()->addHour()->toIso8601String(),
            'ends_at' => now()->addDay()->addHours(2)->toIso8601String(),
        ])->assertStatus(409);
});

it('allows adjacent (non-overlapping) bookings on the same resource', function () {
    Booking::factory()->create([
        'resource_id' => $this->resource->id,
        'starts_at' => now()->addDay(),
        'ends_at' => now()->addDay()->addHours(2),
        'status' => BookingStatus::Pending->value,
    ]);

    $this->actingAs($this->user)
        ->postJson('/api/v1/bookings', [
            'resource_id' => $this->resource->id,
            'starts_at' => now()->addDay()->addHours(2)->toIso8601String(),
            'ends_at' => now()->addDay()->addHours(4)->toIso8601String(),
        ])->assertStatus(201);
});

it('allows rebooking a cancelled slot', function () {
    Booking::factory()->cancelled()->create([
        'resource_id' => $this->resource->id,
        'starts_at' => now()->addDay(),
        'ends_at' => now()->addDay()->addHours(2),
    ]);

    $this->actingAs($this->user)
        ->postJson('/api/v1/bookings', [
            'resource_id' => $this->resource->id,
            'starts_at' => now()->addDay()->toIso8601String(),
            'ends_at' => now()->addDay()->addHours(2)->toIso8601String(),
        ])->assertStatus(201);
});
