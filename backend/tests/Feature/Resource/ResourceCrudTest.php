<?php

use App\Models\Resource;
use App\Models\User;

test('anyone can list resources', function () {
    Resource::factory()->count(3)->create();

    $this->getJson('/api/v1/resources')
        ->assertOk()
        ->assertJsonCount(3, 'data');
});

test('anyone can view a resource', function () {
    $resource = Resource::factory()->create();

    $this->getJson("/api/v1/resources/{$resource->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $resource->id);
});

test('admin can create a resource', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->postJson('/api/v1/resources', [
            'name' => 'Salle B',
            'type' => 'room',
            'hourly_price_cents' => 3000,
            'is_active' => true,
        ])
        ->assertCreated()
        ->assertJsonPath('data.name', 'Salle B');
});

test('regular user cannot create a resource', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/api/v1/resources', [
            'name' => 'Salle C',
            'type' => 'room',
            'hourly_price_cents' => 3000,
            'is_active' => true,
        ])
        ->assertForbidden();
});

test('admin can update a resource', function () {
    $admin = User::factory()->admin()->create();
    $resource = Resource::factory()->create();

    $this->actingAs($admin)
        ->putJson("/api/v1/resources/{$resource->id}", [
            'name' => 'Updated Name',
            'type' => $resource->type->value,
            'hourly_price_cents' => $resource->hourly_price_cents,
            'is_active' => $resource->is_active,
        ])
        ->assertOk()
        ->assertJsonPath('data.name', 'Updated Name');
});

test('admin can delete a resource', function () {
    $admin = User::factory()->admin()->create();
    $resource = Resource::factory()->create();

    $this->actingAs($admin)
        ->deleteJson("/api/v1/resources/{$resource->id}")
        ->assertNoContent();

    $this->assertDatabaseMissing('resources', ['id' => $resource->id]);
});

test('resources can be filtered by type', function () {
    Resource::factory()->count(2)->create(['type' => 'room']);
    Resource::factory()->count(1)->create(['type' => 'equipment']);

    $this->getJson('/api/v1/resources?type=room')
        ->assertOk()
        ->assertJsonCount(2, 'data');
});
