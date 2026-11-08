<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ResourceImage extends Model
{
    /** @use HasFactory<Factory<ResourceImage>> */
    use HasFactory;

    protected $fillable = [
        'resource_id',
        'path',
        'sort_order',
    ];

    protected $appends = ['url'];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }

    /** @return BelongsTo<\App\Models\Resource, $this> */
    public function resource(): BelongsTo
    {
        return $this->belongsTo(Resource::class);
    }

    public function getUrlAttribute(): string
    {
        if (str_starts_with($this->path, 'http')) {
            return $this->path;
        }

        return Storage::url($this->path);
    }
}
