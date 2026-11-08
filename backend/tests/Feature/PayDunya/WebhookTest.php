<?php

use App\Enums\BookingStatus;
use App\Models\Booking;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config(['services.paydunya.mode' => 'test']);
    $this->booking = Booking::factory()->create([
        'paydunya_invoice_token' => 'inv_123',
        'status' => BookingStatus::Pending->value,
    ]);
});

function ipnPayload(string $token = 'inv_123'): array
{
    return ['data' => ['invoice' => ['token' => $token]]];
}

function fakeConfirm(string $status, string $code = '00'): void
{
    Http::fake([
        '*/checkout-invoice/confirm/*' => Http::response([
            'response_code' => $code,
            'invoice' => ['status' => $status],
        ]),
    ]);
}

it('marks the booking paid once paydunya confirms the invoice', function () {
    fakeConfirm('completed');

    $this->postJson('/paydunya/webhook', ipnPayload())->assertOk();

    expect($this->booking->fresh()->status)->toBe(BookingStatus::Paid);
});

it('is idempotent when the same ipn arrives twice', function () {
    fakeConfirm('completed');

    $this->postJson('/paydunya/webhook', ipnPayload())->assertOk();
    $this->postJson('/paydunya/webhook', ipnPayload())->assertOk();

    expect($this->booking->fresh()->status)->toBe(BookingStatus::Paid);
});

it('does not trust the ipn body: an unpaid invoice stays pending', function () {
    fakeConfirm('pending');

    $this->postJson('/paydunya/webhook', ipnPayload())->assertOk();

    expect($this->booking->fresh()->status)->toBe(BookingStatus::Pending);
});

it('ignores an invoice paydunya cannot confirm', function () {
    fakeConfirm('completed', '1001');

    $this->postJson('/paydunya/webhook', ipnPayload())->assertOk();

    expect($this->booking->fresh()->status)->toBe(BookingStatus::Pending);
});

it('ignores a token that matches no booking', function () {
    fakeConfirm('completed');

    $this->postJson('/paydunya/webhook', ipnPayload('unknown'))->assertOk();

    expect($this->booking->fresh()->status)->toBe(BookingStatus::Pending);
});

it('rejects a payload without an invoice token', function () {
    Http::fake();

    $this->postJson('/paydunya/webhook', [])->assertStatus(400);

    Http::assertNothingSent();
});
