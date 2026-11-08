<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin Reservo',
            'email' => 'admin@reservo.test',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        User::factory()->count(3)->create();
    }
}
