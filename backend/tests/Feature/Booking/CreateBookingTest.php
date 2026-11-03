<?php

use App\Models\Resource;
use App\Models\User;

test('authenticated user can create a booking', function () {
    $user = User::factory()->create();
    $resource = Resource::factory()->create(['hourly_price_cents' => 5000, 'is_active' => true]);

    $this->actingAs($user)
        ->postJson('/api/v1/bookings', [
            'resource_id' => $resource->id,
            'starts_at' => '2026-12-01T09:00:00Z',
            'ends_at' => '2026-12-01T11:00:00Z',
        ])
        ->assertCreated()
        ->assertJsonPath('data.total_price_cents', 10000);
});

test('guest cannot create a booking', function () {
    $resource = Resource::factory()->create();

    $this->postJson('/api/v1/bookings', [
        'resource_id' => $resource->id,
        'starts_at' => '2026-12-01T09:00:00Z',
        'ends_at' => '2026-12-01T11:00:00Z',
    ])->assertUnauthorized();
});

test('booking on inactive resource returns 422', function () {
    $user = User::factory()->create();
    $resource = Resource::factory()->create(['is_active' => false]);

    $this->actingAs($user)
        ->postJson('/api/v1/bookings', [
            'resource_id' => $resource->id,
            'starts_at' => '2026-12-01T09:00:00Z',
            'ends_at' => '2026-12-01T11:00:00Z',
        ])
        ->assertUnprocessable();
});

test('ends_at must be after starts_at', function () {
    $user = User::factory()->create();
    $resource = Resource::factory()->create(['is_active' => true]);

    $this->actingAs($user)
        ->postJson('/api/v1/bookings', [
            'resource_id' => $resource->id,
            'starts_at' => '2026-12-01T11:00:00Z',
            'ends_at' => '2026-12-01T09:00:00Z',
        ])
        ->assertUnprocessable();
});
