<?php

namespace App\Http\Requests\Resource;

use App\Enums\ResourceType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateResourceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'               => ['sometimes', 'string', 'max:255'],
            'type'               => ['sometimes', new Enum(ResourceType::class)],
            'description'        => ['nullable', 'string', 'max:5000'],
            'capacity'           => ['nullable', 'integer', 'min:1', 'max:10000'],
            'hourly_price_cents' => ['sometimes', 'integer', 'min:0'],
            'is_active'          => ['sometimes', 'boolean'],
        ];
    }
}
