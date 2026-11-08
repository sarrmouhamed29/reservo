<?php

namespace App\Http\Resources;

use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @property Booking $resource */
class BookingResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'user_id' => $this->resource->user_id,
            'resource' => new ResourceResource($this->whenLoaded('resource')),
            'starts_at' => $this->resource->starts_at->toIso8601String(),
            'ends_at' => $this->resource->ends_at->toIso8601String(),
            'status' => $this->resource->status->value,
            'total_price' => $this->resource->total_price,
            'stripe_session_id' => $this->resource->stripe_session_id,
            'paydunya_payment_started' => $this->resource->paydunya_invoice_token !== null,
            'cancelled_at' => $this->resource->cancelled_at?->toIso8601String(),
            'created_at' => $this->resource->created_at?->toIso8601String(),
            'updated_at' => $this->resource->updated_at?->toIso8601String(),
        ];
    }
}
