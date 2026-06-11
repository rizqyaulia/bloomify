<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->queryCart($request)->with('product')->latest()->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => ['required_without:user_id', 'string', 'max:120'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'product_id' => ['required_without:slug', 'integer', 'exists:products,id'],
            'slug' => ['required_without:product_id', 'string', 'exists:products,slug'],
            'quantity' => ['nullable', 'integer', 'min:1'],
            'recipient_name' => ['nullable', 'string', 'max:255'],
            'bouquet_size' => ['nullable', 'string', 'max:80'],
            'wrapping_color' => ['nullable', 'string', 'max:80'],
            'extras' => ['nullable', 'array'],
            'gift_message' => ['nullable', 'string', 'max:4000'],
            'greeting_message' => ['nullable', 'string', 'max:4000'],
        ]);

        $product = Product::query()
            ->when(isset($validated['product_id']), fn ($query) => $query->whereKey($validated['product_id']))
            ->when(isset($validated['slug']), fn ($query) => $query->where('slug', $validated['slug']))
            ->where('is_active', true)
            ->firstOrFail();

        $cartItem = CartItem::create([
            'session_id' => $validated['session_id'] ?? null,
            'user_id' => $validated['user_id'] ?? null,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'product_price' => $product->price,
            'image' => $product->image,
            'category' => $product->category,
            'quantity' => $validated['quantity'] ?? 1,
            'recipient_name' => $validated['recipient_name'] ?? null,
            'bouquet_size' => $validated['bouquet_size'] ?? 'Standard',
            'wrapping_color' => $validated['wrapping_color'] ?? 'Bloomify',
            'extras' => $validated['extras'] ?? [],
            'gift_message' => $validated['greeting_message'] ?? $validated['gift_message'] ?? null,
        ]);

        return response()->json([
            'message' => 'Product added to cart.',
            'data' => $cartItem->load('product'),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:0'],
        ]);

        $cartItem = CartItem::query()->findOrFail($id);
        if ((int) $validated['quantity'] === 0) {
            $cartItem->delete();
            return response()->json(['message' => 'Cart item removed.', 'data' => null]);
        }

        $cartItem->update(['quantity' => $validated['quantity']]);

        return response()->json([
            'message' => 'Cart item updated.',
            'data' => $cartItem->fresh('product'),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        CartItem::query()->findOrFail($id)->delete();

        return response()->json([
            'message' => 'Cart item removed.',
        ]);
    }

    public function clear(Request $request): JsonResponse
    {
        $this->queryCart($request)->delete();

        return response()->json([
            'message' => 'Cart cleared.',
        ]);
    }

    private function queryCart(Request $request)
    {
        return CartItem::query()
            ->when($request->filled('user_id'), fn ($query) => $query->where('user_id', $request->integer('user_id')))
            ->when(!$request->filled('user_id'), fn ($query) => $query->where('session_id', (string) $request->query('session_id', '')));
    }
}
