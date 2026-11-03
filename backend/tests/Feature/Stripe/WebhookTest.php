<?php

use App\Enums\BookingStatus;
use App\Models\Booking;
use Stripe\Event;
use Stripe\Webhook;

beforeEach(function () {
    config(['services.stripe.webhook_secret' => 'whsec_test_secret']);
    $this->booking = Booking::factory()->create([
        'stripe_session_id' => 'cs_test_abc123',
        'status'            => BookingStatus::Pending->value,
    ]);
});

function buildStripeEvent(string $sessionId): array
{
    return [
        'id'   => 'evt_test',
        'type' => 'checkout.session.completed',
        'data' => [
            'object' => [
                'id'             => $sessionId,
                'payment_intent' => 'pi_test_abc',
                'object'         => 'checkout.session',
            ],
        ],
    ];
}

it('sets booking to paid on valid webhook', function () {
    $payload   = json_encode(buildStripeEvent('cs_test_abc123'));
    $timestamp = time();
    $sig       = hash_hmac('sha256', "{$timestamp}.{$payload}", 'whsec_test_secret');
    $header    = "t={$timestamp},v1={$sig}";

    $this->postJson('/stripe/webhook', json_decode($payload, true), [
        'Stripe-Signature' => $header,
    ])->assertOk();

    $this->booking->refresh();
    expect($this->booking->status)->toBe(BookingStatus::Paid);
});

it('returns 400 on invalid signature', function () {
    $this->postJson('/stripe/webhook', buildStripeEvent('cs_test_abc123'), [
        'Stripe-Signature' => 'invalid_sig',
    ])->assertStatus(400);

    $this->booking->refresh();
    expect($this->booking->status)->toBe(BookingStatus::Pending);
});

it('is idempotent — processing the same event twice does not fail', function () {
    $this->booking->update(['status' => BookingStatus::Paid->value]);

    $payload   = json_encode(buildStripeEvent('cs_test_abc123'));
    $timestamp = time();
    $sig       = hash_hmac('sha256', "{$timestamp}.{$payload}", 'whsec_test_secret');
    $header    = "t={$timestamp},v1={$sig}";

    $this->postJson('/stripe/webhook', json_decode($payload, true), [
        'Stripe-Signature' => $header,
    ])->assertOk();

    $this->booking->refresh();
    expect($this->booking->status)->toBe(BookingStatus::Paid);
});
