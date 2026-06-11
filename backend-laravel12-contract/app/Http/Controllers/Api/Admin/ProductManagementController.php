<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductManagementController extends Controller
{
    public function index(): JsonResponse
    {
        return response()
            ->json(['data' => Product::query()->latest()->get()->map->toApiArray()->values()])
            ->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validatedProduct($request);
        $validated['slug'] = $this->uniqueSlug($validated['slug'] ?? $validated['name']);
        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['stock'] = $validated['stock'] ?? 0;
        $validated['image'] = $validated['image_url'] ?? null;
        unset($validated['image_url']);

        if ($request->hasFile('image')) {
            $validated['image'] = $this->storeProductImage($request);
        }

        $product = Product::create($validated);

        return response()->json([
            'message' => 'Product created successfully.',
            'data' => $product->toApiArray(),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::query()->findOrFail($id);
        $validated = $this->validatedProduct($request, $product);
        $validated['slug'] = $this->uniqueSlug($validated['slug'] ?? $validated['name'], $product);
        $validated['is_active'] = $request->boolean('is_active');
        $validated['stock'] = $validated['stock'] ?? 0;
        $validated['image'] = $validated['image_url'] ?? $product->getRawOriginal('image');
        unset($validated['image_url']);

        if ($request->hasFile('image')) {
            $validated['image'] = $this->storeProductImage($request, $product);
        }

        $product->update($validated);

        return response()->json([
            'message' => 'Product updated successfully.',
            'data' => $product->fresh()->toApiArray(),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $product = Product::query()->withCount('orderItems')->findOrFail($id);

        if ($product->order_items_count > 0) {
            $product->update(['is_active' => false]);

            return response()->json([
                'message' => 'Product has order history, so it was marked inactive.',
                'data' => $product->fresh()->toApiArray(),
                'deleted' => false,
            ]);
        }

        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully.',
            'deleted' => true,
        ]);
    }

    private function validatedProduct(Request $request, ?Product $product = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('products', 'slug')->ignore($product?->id),
            ],
            'category' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'image_url' => ['nullable', 'string', 'max:2000'],
        ]);
    }

    private function uniqueSlug(string $value, ?Product $product = null): string
    {
        $baseSlug = Str::slug($value) ?: Str::random(8);
        $slug = $baseSlug;
        $counter = 2;

        while (
            Product::query()
                ->where('slug', $slug)
                ->when($product, fn ($query) => $query->whereKeyNot($product->id))
                ->exists()
        ) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    private function storeProductImage(Request $request, ?Product $product = null): string
    {
        $oldPath = $this->publicDiskPathFromImage($product?->getRawOriginal('image'));
        if ($oldPath) {
            Storage::disk('public')->delete($oldPath);
        }

        $path = $request->file('image')->store('products', 'public');

        return $path;
    }

    private function publicDiskPathFromImage(?string $image): ?string
    {
        if (!$image) {
            return null;
        }

        $value = ltrim($image, '/');

        if (str_contains($value, '/storage/products/')) {
            return Str::after($value, '/storage/');
        }

        if (str_contains($value, '/product-images/')) {
            return 'products/'.Str::after($value, '/product-images/');
        }

        if (Str::startsWith($value, 'product-images/')) {
            return 'products/'.Str::after($value, 'product-images/');
        }

        if (Str::startsWith($value, 'storage/products/')) {
            return Str::after($value, 'storage/');
        }

        if (Str::startsWith($value, 'products/')) {
            return $value;
        }

        return null;
    }
}
