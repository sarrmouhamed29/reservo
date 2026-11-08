<?php

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config([
        'services.paydunya.mode' => 'test',
        'services.paydunya.master_key' => 'master',
        'services.paydunya.private_key' => 'private',
        'services.paydunya.token' => 'token',
    ]);
});

test('owner gets a paydunya checkout url and the invoice token is stored', function () {
    Http::fake([
        '*/checkout-invoice/create' => Http::response([
            'response_code' => '00',
            'token' => 'inv_123',
            'redirect_url' => 'https://paydunya.test/checkout/inv_123',
        ]),
    ]);
    $user = User::factory()->create();
    $booking = Booking::factory()->for($user)->create();

    $this->actingAs($user)
        ->postJson("/api/v1/bookings/{$booking->id}/paydunya-checkout")
        ->assertOk()
        ->assertJson(['checkout_url' => 'https://paydunya.test/checkout/inv_123']);

    expect($booking->fresh()->paydunya_invoice_token)->toBe('inv_123');
    Http::assertSent(fn ($request) => str_contains($request->url(), '/sandbox-api/')
        && $request->hasHeader('PAYDUNYA-MASTER-KEY', 'master')
        && $request['invoice']['total_amount'] === $booking->total_price);
});

test('live mode calls the production api', function () {
    config(['services.paydunya.mode' => 'live']);
    Http::fake([
        '*' => Http::response(['response_code' => '00', 'token' => 't', 'redirect_url' => 'https://p.test']),
    ]);
    $user = User::factory()->create();
    $booking = Booking::factory()->for($user)->create();

    $this->actingAs($user)->postJson("/api/v1/bookings/{$booking->id}/paydunya-checkout")->assertOk();

    Http::assertSent(fn ($request) => str_contains($request->url(), 'app.paydunya.com/api/v1/')
        && ! str_contains($request->url(), 'sandbox'));
});

test('a booking that is not pending cannot be paid', function () {
    Http::fake();
    $user = User::factory()->create();
    $booking = Booking::factory()->paid()->for($user)->create();

    $this->actingAs($user)
        ->postJson("/api/v1/bookings/{$booking->id}/paydunya-checkout")
        ->assertStatus(409);

    Http::assertNothingSent();
});

test('another user cannot start a checkout for someone else booking', function () {
    Http::fake();
    $booking = Booking::factory()->create(['status' => BookingStatus::Pending->value]);

    $this->actingAs(User::factory()->create())
        ->postJson("/api/v1/bookings/{$booking->id}/paydunya-checkout")
        ->assertForbidden();
});

test('a paydunya failure surfaces as an error and stores nothing', function () {
    Http::fake([
        '*/checkout-invoice/create' => Http::response(['response_code' => '1001', 'response_text' => 'Invalid keys']),
    ]);
    $user = User::factory()->create();
    $booking = Booking::factory()->for($user)->create();

    $this->withoutExceptionHandling();
    expect(fn () => $this->actingAs($user)->postJson("/api/v1/bookings/{$booking->id}/paydunya-checkout"))
        ->toThrow(RuntimeException::class, 'Invalid keys');

    expect($booking->fresh()->paydunya_invoice_token)->toBeNull();
});
