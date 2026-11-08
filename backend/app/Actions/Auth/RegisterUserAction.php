<?php

namespace App\Actions\Auth;

use App\Models\User;

class RegisterUserAction
{
    /** @param array<string, mixed> $data */
    public function execute(array $data): User
    {
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => 'user',
        ]);
    }
}
