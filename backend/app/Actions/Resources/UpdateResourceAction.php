<?php

namespace App\Actions\Resources;

use App\Models\Resource;
use Illuminate\Support\Facades\DB;

class UpdateResourceAction
{
    public function execute(Resource $resource, array $data): Resource
    {
        return DB::transaction(function () use ($resource, $data) {
            $resource->update(array_filter([
                'name'               => $data['name'] ?? null,
                'type'               => $data['type'] ?? null,
                'description'        => $data['description'] ?? null,
                'capacity'           => $data['capacity'] ?? null,
                'hourly_price_cents' => $data['hourly_price_cents'] ?? null,
                'is_active'          => $data['is_active'] ?? null,
            ], fn($v) => !is_null($v)));

            return $resource->fresh('images');
        });
    }
}
