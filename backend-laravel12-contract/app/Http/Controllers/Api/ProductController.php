<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $products = Product::query()
            ->when(!$request->boolean('include_inactive'), fn ($query) => $query->where('is_active', true))
            ->when($request->filled('category'), fn ($query) => $query->where('category', (string) $request->query('category')))
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = '%'.strtolower((string) $request->query('search')).'%';
                $query->where(function ($inner) use ($search) {
                    $inner->whereRaw('LOWER(name) LIKE ?', [$search])
                        ->orWhereRaw('LOWER(category) LIKE ?', [$search])
                        ->orWhereRaw('LOWER(description) LIKE ?', [$search]);
                });
            })
            ->when($request->filled('min_price'), fn ($query) => $query->where('price', '>=', $request->float('min_price')))
            ->when($request->filled('max_price'), fn ($query) => $query->where('price', '<=', $request->float('max_price')))
            ->orderBy('name')
            ->get();

        return response()
            ->json(['data' => $products->map->toApiArray()->values()])
            ->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return response()
            ->json(['data' => $product->toApiArray()])
            ->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    }
}
