<?php

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config(['services.paydunya.mode' => 'test']);
    $this->user = User::factory()->create();
    $this->booking = Booking::factory()->for($this->user)->create([
        'paydunya_invoice_token' => 'inv_sync',
        'status' => BookingStatus::Pending->value,
    ]);
});

function fakeConfirmStatus(string $status): void
{
    // PayDunya reports the status at the top level of the confirm response.
    Http::fake([
        '*/checkout-invoice/confirm/*' => Http::response([
            'response_code' => '00',
            'response_text' => 'Transaction Found',
            'status' => $status,
            'invoice' => ['token' => 'inv_sync', 'total_amount' => 1000],
        ]),
    ]);
}

it('settles the booking when PayDunya says the invoice is completed', function () {
    fakeConfirmStatus('completed');

    $this->actingAs($this->user)
        ->postJson("/api/v1/bookings/{$this->booking->id}/paydunya-sync")
        ->assertOk()
        ->assertJsonPath('data.status', 'paid');

    expect($this->booking->fresh()->status)->toBe(BookingStatus::Paid);
});

it('keeps the booking pending while the invoice is not paid', function () {
    fakeConfirmStatus('pending');

    $this->actingAs($this->user)
        ->postJson("/api/v1/bookings/{$this->booking->id}/paydunya-sync")
        ->assertOk()
        ->assertJsonPath('data.status', 'pending');
});

it('never revives a cancelled booking even if the invoice was paid', function () {
    $this->booking->update(['status' => BookingStatus::Cancelled->value]);
    fakeConfirmStatus('completed');

    $this->actingAs($this->user)
        ->postJson("/api/v1/bookings/{$this->booking->id}/paydunya-sync")
        ->assertOk()
        ->assertJsonPath('data.status', 'cancelled');
});

it('refuses another user', function () {
    Http::fake();

    $this->actingAs(User::factory()->create())
        ->postJson("/api/v1/bookings/{$this->booking->id}/paydunya-sync")
        ->assertForbidden();

    Http::assertNothingSent();
});

it('answers 422 when no PayDunya payment was started', function () {
    Http::fake();
    $booking = Booking::factory()->for($this->user)->create();

    $this->actingAs($this->user)
        ->postJson("/api/v1/bookings/{$booking->id}/paydunya-sync")
        ->assertStatus(422);

    Http::assertNothingSent();
});

it('requires authentication', function () {
    $this->postJson("/api/v1/bookings/{$this->booking->id}/paydunya-sync")->assertUnauthorized();
});
