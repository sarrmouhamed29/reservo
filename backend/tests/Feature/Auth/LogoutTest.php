<?php

use App\Models\User;

test('authenticated user can logout', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/api/v1/auth/logout')
        ->assertNoContent();
});

test('unauthenticated request returns 401', function () {
    $this->postJson('/api/v1/auth/logout')
        ->assertUnauthorized();
});
