<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @property \App\Models\Resource $resource */
class ResourceResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'name' => $this->resource->name,
            'type' => $this->resource->type->value,
            'description' => $this->resource->description,
            'capacity' => $this->resource->capacity,
            'hourly_price_cents' => $this->resource->hourly_price_cents,
            'is_active' => $this->resource->is_active,
            'images' => ResourceImageResource::collection($this->whenLoaded('images')),
            'created_at' => $this->resource->created_at?->toIso8601String(),
            'updated_at' => $this->resource->updated_at?->toIso8601String(),
        ];
    }
}
