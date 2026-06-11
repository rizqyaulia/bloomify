<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    public const PAYMENT_STATUSES = [
        'pending',
        'waiting_verification',
        'cod_pending',
        'unpaid',
        'paid',
        'rejected',
    ];

    public const ORDER_STATUSES = [
        'order_created',
        'waiting_payment',
        'payment_verified',
        'processing',
        'ready_to_deliver',
        'delivering',
        'completed',
        'cancelled',
    ];

    protected $fillable = [
        'order_code',
        'user_id',
        'customer_name',
        'phone',
        'campus_address',
        'delivery_date',
        'delivery_time',
        'subtotal',
        'delivery_fee',
        'service_fee',
        'total',
        'payment_status',
        'order_status',
        'notes',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'delivery_date' => 'date',
            'subtotal' => 'decimal:2',
            'delivery_fee' => 'decimal:2',
            'service_fee' => 'decimal:2',
            'total' => 'decimal:2',
            'completed_at' => 'datetime',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function latestPayment(): HasOne
    {
        return $this->hasOne(Payment::class)->latestOfMany();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
