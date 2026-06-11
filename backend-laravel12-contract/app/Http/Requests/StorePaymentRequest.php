<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_id' => ['nullable', 'integer', 'exists:orders,id'],
            'order_code' => ['nullable', 'string', 'exists:orders,order_code'],
            'payment_method' => ['required', 'string', 'max:80'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'proof_image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
            'proof_url' => ['nullable', 'string', 'max:2000'],
            'status' => ['nullable', Rule::in(['pending', 'waiting_verification', 'cod_pending', 'unpaid', 'paid', 'rejected'])],
            'paid_at' => ['nullable', 'date'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if (!$this->filled('order_id') && !$this->filled('order_code')) {
                    $validator->errors()->add(
                        'order_id',
                        'A payment must include either order_id or order_code.'
                    );
                }
            },
        ];
    }
}
