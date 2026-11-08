<?php

namespace Database\Factories;

use App\Enums\BookingStatus;
use App\Models\Resource;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BookingFactory extends Factory
{
    public function definition(): array
    {
        $startsAt = fake()->dateTimeBetween('now', '+30 days');
        $endsAt = fake()->dateTimeBetween($startsAt, '+31 days');

        return [
            'user_id' => User::factory(),
            'resource_id' => Resource::factory(),
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'status' => BookingStatus::Pending->value,
            'total_price_cents' => fake()->numberBetween(1000, 50000),
        ];
    }

    public function paid(): static
    {
        return $this->state([
            'status' => BookingStatus::Paid->value,
            'stripe_session_id' => 'cs_test_'.fake()->regexify('[a-zA-Z0-9]{20}'),
            'stripe_payment_intent_id' => 'pi_test_'.fake()->regexify('[a-zA-Z0-9]{20}'),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state([
            'status' => BookingStatus::Cancelled->value,
            'cancelled_at' => now(),
        ]);
    }
}
