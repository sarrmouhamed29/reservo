<?php

namespace App\Http\Requests\Booking;

use App\Models\Resource;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'resource_id' => ['required', 'integer', 'exists:resources,id'],
            'starts_at'   => ['required', 'date', 'after:now'],
            'ends_at'     => ['required', 'date', 'after:starts_at'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $resource = Resource::find($this->input('resource_id'));
            if ($resource && !$resource->is_active) {
                $validator->errors()->add('resource_id', 'This resource is not available for booking.');
            }
        });
    }
}
