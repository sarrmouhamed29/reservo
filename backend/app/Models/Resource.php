<?php

namespace App\Models;

use App\Enums\ResourceType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Resource extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'description',
        'capacity',
        'hourly_price_cents',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'type' => ResourceType::class,
            'is_active' => 'boolean',
            'hourly_price_cents' => 'integer',
            'capacity' => 'integer',
        ];
    }

    public function images(): HasMany
    {
        return $this->hasMany(ResourceImage::class)->orderBy('sort_order');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
