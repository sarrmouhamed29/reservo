<?php

namespace Database\Seeders;

use App\Models\Resource;
use Illuminate\Database\Seeder;

class ResourceSeeder extends Seeder
{
    public function run(): void
    {
        $rooms = [
            ['name' => 'Salle Conférence A', 'capacity' => 20, 'hourly_price_cents' => 5000],
            ['name' => 'Salle Conférence B', 'capacity' => 10, 'hourly_price_cents' => 3000],
            ['name' => 'Grande Salle', 'capacity' => 50, 'hourly_price_cents' => 10000],
            ['name' => 'Bureau Privé', 'capacity' => 4, 'hourly_price_cents' => 2000],
        ];

        foreach ($rooms as $room) {
            Resource::create(array_merge($room, [
                'type'        => 'room',
                'description' => 'Espace de travail entièrement équipé avec projecteur et tableau blanc.',
                'is_active'   => true,
            ]));
        }

        $equipment = [
            ['name' => 'Vidéoprojecteur 4K', 'hourly_price_cents' => 1500],
            ['name' => 'Système de sonorisation', 'hourly_price_cents' => 2000],
            ['name' => 'Tableau interactif', 'hourly_price_cents' => 1000],
        ];

        foreach ($equipment as $item) {
            Resource::create(array_merge($item, [
                'type'        => 'equipment',
                'description' => 'Matériel professionnel disponible à la location.',
                'capacity'    => null,
                'is_active'   => true,
            ]));
        }
    }
}
