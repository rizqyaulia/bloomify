<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Payment extends Model
{
    public const STATUSES = [
        'pending',
        'waiting_verification',
        'cod_pending',
        'paid',
        'rejected',
    ];

    protected $fillable = [
        'order_id',
        'payment_method',
        'amount',
        'proof_image',
        'status',
        'paid_at',
    ];

    protected $appends = [
        'proof_image_url',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    public function getProofImageUrlAttribute(): ?string
    {
        $filename = $this->paymentProofFilename($this->proof_image);

        return $filename ? url('/payment-proofs/'.$filename) : null;
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    private function paymentProofFilename(?string $value): ?string
    {
        if (!$value) {
            return null;
        }

        $path = parse_url($value, PHP_URL_PATH) ?: $value;
        $path = ltrim($path, '/');

        if (Str::startsWith($path, 'payment-proofs/')) {
            return $this->safePaymentProofBasename(Str::after($path, 'payment-proofs/'));
        }

        if (Str::startsWith($path, 'storage/payment-proofs/')) {
            return $this->safePaymentProofBasename(Str::after($path, 'storage/payment-proofs/'));
        }

        return null;
    }

    private function safePaymentProofBasename(string $filename): ?string
    {
        if ($filename !== basename($filename)) {
            return null;
        }

        return preg_match('/\A[A-Za-z0-9._-]+\.(?:jpe?g|png|webp|pdf)\z/i', $filename) === 1
            ? $filename
            : null;
    }
}
