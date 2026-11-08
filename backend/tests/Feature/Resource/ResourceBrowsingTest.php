<?php

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\Resource;

test('resources can be sorted by price', function () {
    Resource::factory()->create(['name' => 'Mid', 'hourly_price_cents' => 3000]);
    Resource::factory()->create(['name' => 'Cheap', 'hourly_price_cents' => 1000]);
    Resource::factory()->create(['name' => 'Dear', 'hourly_price_cents' => 9000]);

    $this->getJson('/api/v1/resources?sort=price_asc')
        ->assertOk()
        ->assertJsonPath('data.0.name', 'Cheap');

    $this->getJson('/api/v1/resources?sort=price_desc')
        ->assertOk()
        ->assertJsonPath('data.0.name', 'Dear');
});

test('resources can be sorted by capacity with equipment last', function () {
    Resource::factory()->create(['name' => 'Gear', 'type' => 'equipment', 'capacity' => null]);
    Resource::factory()->create(['name' => 'Small', 'capacity' => 4]);
    Resource::factory()->create(['name' => 'Big', 'capacity' => 50]);

    $this->getJson('/api/v1/resources?sort=capacity_desc')
        ->assertOk()
        ->assertJsonPath('data.0.name', 'Big')
        ->assertJsonPath('data.2.name', 'Gear');
});

test('resources can be filtered by capacity range', function () {
    Resource::factory()->create(['name' => 'Tiny', 'capacity' => 3]);
    Resource::factory()->create(['name' => 'Medium', 'capacity' => 8]);
    Resource::factory()->create(['name' => 'Large', 'capacity' => 40]);

    $this->getJson('/api/v1/resources?capacity_min=5&capacity_max=10')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Medium');

    $this->getJson('/api/v1/resources?capacity_min=11')
        ->assertOk()
        ->assertJsonPath('data.0.name', 'Large');
});

test('per_page controls the page size and is capped', function () {
    Resource::factory()->count(30)->create();

    $this->getJson('/api/v1/resources?per_page=6')
        ->assertOk()
        ->assertJsonCount(6, 'data')
        ->assertJsonPath('meta.per_page', 6)
        ->assertJsonPath('meta.total', 30);

    $this->getJson('/api/v1/resources?per_page=500')
        ->assertOk()
        ->assertJsonPath('meta.per_page', 24);
});

test('availability lists busy intervals of the day without who booked', function () {
    $resource = Resource::factory()->create();
    Booking::factory()->for($resource)->create([
        'starts_at' => '2030-05-10 10:00:00',
        'ends_at' => '2030-05-10 12:00:00',
        'status' => BookingStatus::Paid->value,
    ]);
    Booking::factory()->for($resource)->create([
        'starts_at' => '2030-05-10 14:00:00',
        'ends_at' => '2030-05-10 15:00:00',
        'status' => BookingStatus::Cancelled->value,
    ]);
    Booking::factory()->for($resource)->create([
        'starts_at' => '2030-05-11 10:00:00',
        'ends_at' => '2030-05-11 11:00:00',
    ]);

    $response = $this->getJson("/api/v1/resources/{$resource->id}/availability?date=2030-05-10")
        ->assertOk()
        ->assertJsonCount(1, 'data');

    expect($response->json('data.0'))->toHaveKeys(['starts_at', 'ends_at'])
        ->and($response->json('data.0'))->not->toHaveKey('user_id');
});

test('availability requires a valid date', function () {
    $resource = Resource::factory()->create();

    $this->getJson("/api/v1/resources/{$resource->id}/availability")->assertStatus(422);
    $this->getJson("/api/v1/resources/{$resource->id}/availability?date=nope")->assertStatus(422);
});
