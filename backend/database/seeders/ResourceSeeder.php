<?php

namespace Database\Seeders;

use App\Models\Resource;
use App\Models\ResourceImage;
use Illuminate\Database\Seeder;

class ResourceSeeder extends Seeder
{
    public function run(): void
    {
        $rooms = [
            [
                'name' => 'Salle Conférence A',
                'capacity' => 20,
                'hourly_price_cents' => 5000,
                'images' => [
                    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
                    'https://images.unsplash.com/photo-1497366754035-f200586c0a76?w=800&q=80',
                ],
            ],
            [
                'name' => 'Salle Conférence B',
                'capacity' => 10,
                'hourly_price_cents' => 3000,
                'images' => [
                    'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&q=80',
                    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
                ],
            ],
            [
                'name' => 'Grande Salle',
                'capacity' => 50,
                'hourly_price_cents' => 10000,
                'images' => [
                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
                    'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80',
                ],
            ],
            [
                'name' => 'Bureau Privé',
                'capacity' => 4,
                'hourly_price_cents' => 2000,
                'images' => [
                    'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&q=80',
                    'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
                ],
            ],
        ];

        foreach ($rooms as $room) {
            $images = $room['images'];
            unset($room['images']);

            $resource = Resource::create(array_merge($room, [
                'type' => 'room',
                'description' => 'Espace de travail entièrement équipé avec projecteur et tableau blanc.',
                'is_active' => true,
            ]));

            foreach ($images as $i => $url) {
                ResourceImage::create([
                    'resource_id' => $resource->id,
                    'path' => $url,
                    'sort_order' => $i,
                ]);
            }
        }

        $equipment = [
            [
                'name' => 'Vidéoprojecteur 4K',
                'hourly_price_cents' => 1500,
                'images' => [
                    'https://images.unsplash.com/photo-1626379953822-baec19c3accd?w=800&q=80',
                ],
            ],
            [
                'name' => 'Système de sonorisation',
                'hourly_price_cents' => 2000,
                'images' => [
                    'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800&q=80',
                ],
            ],
            [
                'name' => 'Tableau interactif',
                'hourly_price_cents' => 1000,
                'images' => [
                    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
                ],
            ],
        ];

        foreach ($equipment as $item) {
            $images = $item['images'];
            unset($item['images']);

            $resource = Resource::create(array_merge($item, [
                'type' => 'equipment',
                'description' => 'Matériel professionnel disponible à la location.',
                'capacity' => null,
                'is_active' => true,
            ]));

            foreach ($images as $i => $url) {
                ResourceImage::create([
                    'resource_id' => $resource->id,
                    'path' => $url,
                    'sort_order' => $i,
                ]);
            }
        }
    }
}
