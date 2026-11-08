<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(['email' => 'admin@reservo.test'], [
            'name' => 'Admin',
            'password' => Hash::make('admin'),
            'role' => 'admin',
        ]);

        User::firstOrCreate(['email' => 'user@reservo.test'], [
            'name' => 'User',
            'password' => Hash::make('user'),
            'role' => 'user',
        ]);
    }
}
