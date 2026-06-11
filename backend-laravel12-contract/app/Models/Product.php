<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Product extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'category',
        'price',
        'image',
        'description',
        'stock',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'stock' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function getImageAttribute(?string $value): ?string
    {
        return $this->publicImageUrl($value);
    }

    public function publicImageUrl(?string $value = null): ?string
    {
        $value ??= $this->getRawOriginal('image');

        if (!$value) {
            return $value;
        }

        $filename = $this->productImageFilename($value);
        if ($filename) {
            return url('/product-images/'.$filename);
        }

        if (Str::startsWith($value, ['http://', 'https://', 'data:', 'blob:'])) {
            return $value;
        }

        return $value;
    }

    public function toApiArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'category' => $this->category,
            'price' => $this->price,
            'image' => $this->publicImageUrl(),
            'description' => $this->description,
            'stock' => $this->stock,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    private function productImageFilename(string $value): ?string
    {
        $path = parse_url($value, PHP_URL_PATH) ?: $value;
        $path = ltrim($path, '/');

        if (Str::startsWith($path, 'product-images/')) {
            return $this->safeProductImageBasename(Str::after($path, 'product-images/'));
        }

        if (Str::startsWith($path, 'storage/products/')) {
            return $this->safeProductImageBasename(Str::after($path, 'storage/products/'));
        }

        if (Str::startsWith($path, 'products/')) {
            $filename = $this->safeProductImageBasename(Str::after($path, 'products/'));

            if ($filename && Storage::disk('public')->exists('products/'.$filename)) {
                return $filename;
            }
        }

        return null;
    }

    private function safeProductImageBasename(string $filename): ?string
    {
        if ($filename !== basename($filename)) {
            return null;
        }

        return preg_match('/\A[A-Za-z0-9._-]+\.(?:jpe?g|png|webp)\z/i', $filename) === 1
            ? $filename
            : null;
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }
}
