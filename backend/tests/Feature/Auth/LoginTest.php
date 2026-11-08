<?php

use App\Models\User;

it('can login with valid credentials', function () {
    $user = User::factory()->create(['password' => bcrypt('password')]);

    $this->postJson('/api/v1/auth/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertOk()->assertJsonPath('data.email', $user->email);
});

it('cannot login with wrong password', function () {
    $user = User::factory()->create();

    $this->postJson('/api/v1/auth/login', [
        'email' => $user->email,
        'password' => 'wrong_password',
    ])->assertStatus(422)->assertJsonValidationErrors(['email']);
});

it('cannot login with non-existent email', function () {
    $this->postJson('/api/v1/auth/login', [
        'email' => 'nobody@example.com',
        'password' => 'password',
    ])->assertStatus(422);
});
