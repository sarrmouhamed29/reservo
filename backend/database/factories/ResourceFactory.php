<?php

namespace Database\Factories;

use App\Enums\ResourceType;
use Illuminate\Database\Eloquent\Factories\Factory;

class ResourceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'type' => fake()->randomElement(ResourceType::cases())->value,
            'description' => fake()->paragraph(),
            'capacity' => fake()->optional()->numberBetween(2, 50),
            'hourly_price' => fake()->numberBetween(2000, 50000),
            'is_active' => true,
        ];
    }

    public function room(): static
    {
        return $this->state(['type' => ResourceType::Room->value, 'capacity' => fake()->numberBetween(2, 50)]);
    }

    public function equipment(): static
    {
        return $this->state(['type' => ResourceType::Equipment->value, 'capacity' => null]);
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
