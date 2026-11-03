<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ResourceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'name'               => $this->name,
            'type'               => $this->type->value,
            'description'        => $this->description,
            'capacity'           => $this->capacity,
            'hourly_price_cents' => $this->hourly_price_cents,
            'is_active'          => $this->is_active,
            'images'             => ResourceImageResource::collection($this->whenLoaded('images')),
            'created_at'         => $this->created_at?->toIso8601String(),
            'updated_at'         => $this->updated_at?->toIso8601String(),
        ];
    }
}
