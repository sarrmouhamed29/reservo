<?php

use App\Models\User;

it('can register with valid data and returns 201', function () {
    $response = $this->postJson('/api/v1/auth/register', [
        'name'                  => 'John Doe',
        'email'                 => 'john@example.com',
        'password'              => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertStatus(201)->assertJsonPath('data.email', 'john@example.com');
    $this->assertDatabaseHas('users', ['email' => 'john@example.com']);
});

it('cannot register with a duplicate email', function () {
    User::factory()->create(['email' => 'john@example.com']);

    $this->postJson('/api/v1/auth/register', [
        'name'                  => 'John Doe',
        'email'                 => 'john@example.com',
        'password'              => 'password',
        'password_confirmation' => 'password',
    ])->assertStatus(422)->assertJsonValidationErrors(['email']);
});

it('cannot register with a short password', function () {
    $this->postJson('/api/v1/auth/register', [
        'name'                  => 'John Doe',
        'email'                 => 'john@example.com',
        'password'              => 'short',
        'password_confirmation' => 'short',
    ])->assertStatus(422)->assertJsonValidationErrors(['password']);
});

it('cannot register with mismatched password confirmation', function () {
    $this->postJson('/api/v1/auth/register', [
        'name'                  => 'John Doe',
        'email'                 => 'john@example.com',
        'password'              => 'password123',
        'password_confirmation' => 'different',
    ])->assertStatus(422)->assertJsonValidationErrors(['password']);
});
