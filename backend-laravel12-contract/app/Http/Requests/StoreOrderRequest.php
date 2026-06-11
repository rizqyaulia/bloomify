<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'customer_name' => $this->input('customer_name', $this->input('recipient_name')),
            'phone' => $this->input('phone', $this->input('phone_number', $this->input('recipient_phone'))),
            'campus_address' => $this->input('campus_address', $this->input('delivery_address')),
        ]);
    }

    public function rules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'max:255'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'phone' => ['required', 'string', 'max:40'],
            'campus_address' => ['required', 'string', 'max:2000'],
            'delivery_date' => ['nullable', 'date'],
            'delivery_time' => ['nullable', 'string', 'max:120'],
            'delivery_fee' => ['nullable', 'numeric', 'min:0'],
            'service_fee' => ['nullable', 'numeric', 'min:0'],
            'payment_method' => ['nullable', 'string', 'max:80'],
            'notes' => ['nullable', 'string', 'max:4000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['nullable', 'integer', 'exists:products,id'],
            'items.*.slug' => ['nullable', 'string', 'exists:products,slug'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.recipient_name' => ['nullable', 'string', 'max:255'],
            'items.*.bouquet_size' => ['nullable', 'string', 'max:80'],
            'items.*.size' => ['nullable', 'string', 'max:80'],
            'items.*.wrapping_color' => ['nullable', 'string', 'max:80'],
            'items.*.color' => ['nullable', 'string', 'max:80'],
            'items.*.greeting_message' => ['nullable', 'string', 'max:4000'],
            'items.*.gift_message' => ['nullable', 'string', 'max:4000'],
            'items.*.card_message' => ['nullable', 'string', 'max:4000'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                foreach ($this->input('items', []) as $index => $item) {
                    if (empty($item['product_id']) && empty($item['slug'])) {
                        $validator->errors()->add(
                            "items.$index.product_id",
                            'Each order item must include a product_id or slug.'
                        );
                    }
                }
            },
        ];
    }
}
