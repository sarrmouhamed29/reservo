<?php

namespace App\Http\Resources;

use App\Models\ResourceImage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @property ResourceImage $resource */
class ResourceImageResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'url' => $this->resource->url,
            'sort_order' => $this->resource->sort_order,
        ];
    }
}
