<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    protected $fillable = [
        'user_id',
        'session_id',
        'product_id',
        'product_name',
        'product_price',
        'image',
        'category',
        'quantity',
        'recipient_name',
        'bouquet_size',
        'wrapping_color',
        'extras',
        'gift_message',
    ];

    protected $appends = [
        'greeting_message',
    ];

    protected function casts(): array
    {
        return [
            'product_price' => 'decimal:2',
            'quantity' => 'integer',
            'extras' => 'array',
        ];
    }

    public function getGreetingMessageAttribute(): ?string
    {
        return $this->gift_message;
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
