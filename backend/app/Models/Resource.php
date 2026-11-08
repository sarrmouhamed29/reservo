<?php

namespace App\Models;

use App\Enums\ResourceType;
use Database\Factories\ResourceFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @use HasFactory<ResourceFactory>
 *
 * @property int $id
 * @property string $name
 * @property ResourceType $type
 * @property string|null $description
 * @property int|null $capacity
 * @property int $hourly_price
 * @property bool $is_active
 */
class Resource extends Model
{
    /** @use HasFactory<ResourceFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'description',
        'capacity',
        'hourly_price',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'type' => ResourceType::class,
            'is_active' => 'boolean',
            'hourly_price' => 'integer',
            'capacity' => 'integer',
        ];
    }

    /** @return HasMany<ResourceImage, $this> */
    public function images(): HasMany
    {
        return $this->hasMany(ResourceImage::class)->orderBy('sort_order');
    }

    /** @return HasMany<Booking, $this> */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * @param  Builder<\App\Models\Resource>  $query
     * @return Builder<\App\Models\Resource>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
