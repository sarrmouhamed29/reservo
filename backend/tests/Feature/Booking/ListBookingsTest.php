<?php

use App\Models\Booking;
use App\Models\User;

test('bookings can be filtered by paydunya invoice token', function () {
    $user = User::factory()->create();
    $target = Booking::factory()->for($user)->create(['paydunya_invoice_token' => 'tok_target']);
    Booking::factory()->for($user)->create(['paydunya_invoice_token' => 'tok_other']);

    $this->actingAs($user)
        ->getJson('/api/v1/bookings?paydunya_invoice_token=tok_target')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $target->id);
});

test('bookings can be filtered by stripe session id', function () {
    $user = User::factory()->create();
    $target = Booking::factory()->for($user)->create(['stripe_session_id' => 'cs_target']);
    Booking::factory()->for($user)->create(['stripe_session_id' => 'cs_other']);

    $this->actingAs($user)
        ->getJson('/api/v1/bookings?stripe_session_id=cs_target')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $target->id);
});

test('a token filter never exposes another user booking', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    Booking::factory()->for($owner)->create(['paydunya_invoice_token' => 'tok_private']);

    $this->actingAs($other)
        ->getJson('/api/v1/bookings?paydunya_invoice_token=tok_private')
        ->assertOk()
        ->assertJsonCount(0, 'data');
});
