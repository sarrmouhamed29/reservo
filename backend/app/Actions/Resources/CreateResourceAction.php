<?php

namespace App\Actions\Resources;

use App\Models\Resource;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class CreateResourceAction
{
    /** @param array<string, mixed> $data */
    public function execute(array $data): Resource
    {
        return DB::transaction(function () use ($data) {
            $resource = Resource::create([
                'name' => $data['name'],
                'type' => $data['type'],
                'description' => $data['description'] ?? null,
                'capacity' => $data['capacity'] ?? null,
                'hourly_price' => $data['hourly_price'],
                'is_active' => $data['is_active'] ?? true,
            ]);

            if (! empty($data['images'])) {
                foreach ($data['images'] as $index => $image) {
                    /** @var UploadedFile $image */
                    $path = $image->store("resources/{$resource->id}", 'public');
                    $resource->images()->create([
                        'path' => $path,
                        'sort_order' => $index,
                    ]);
                }
            }

            return $resource->load('images');
        });
    }
}
