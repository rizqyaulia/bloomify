<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function store(StoreOrderRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $order = DB::transaction(function () use ($validated) {
            $items = collect($validated['items'])->map(function (array $item) {
                $product = Product::query()
                    ->when(isset($item['product_id']), fn ($query) => $query->whereKey($item['product_id']))
                    ->when(isset($item['slug']), fn ($query) => $query->where('slug', $item['slug']))
                    ->where('is_active', true)
                    ->lockForUpdate()
                    ->firstOrFail();

                $quantity = (int) $item['quantity'];
                $lineTotal = round((float) $product->price * $quantity, 2);

                return [
                    'product' => $product,
                    'quantity' => $quantity,
                    'line_total' => $lineTotal,
                    'recipient_name' => $item['recipient_name'] ?? null,
                    'bouquet_size' => $item['bouquet_size'] ?? $item['size'] ?? null,
                    'wrapping_color' => $item['wrapping_color'] ?? $item['color'] ?? null,
                    'greeting_message' => $item['greeting_message'] ?? $item['gift_message'] ?? $item['card_message'] ?? null,
                ];
            });

            $subtotal = $items->sum(fn ($item) => (float) $item['line_total']);
            $deliveryFee = (float) ($validated['delivery_fee'] ?? 15000);
            $serviceFee = (float) ($validated['service_fee'] ?? 5000);
            $total = $subtotal + $deliveryFee + $serviceFee;

            $order = Order::create([
                'order_code' => $this->generateOrderCode(),
                'user_id' => $validated['user_id'] ?? null,
                'customer_name' => $validated['customer_name'],
                'phone' => $validated['phone'],
                'campus_address' => $validated['campus_address'],
                'delivery_date' => $validated['delivery_date'] ?? null,
                'delivery_time' => $validated['delivery_time'] ?? null,
                'subtotal' => $subtotal,
                'delivery_fee' => $deliveryFee,
                'service_fee' => $serviceFee,
                'total' => $total,
                'payment_status' => 'pending',
                'order_status' => 'waiting_payment',
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($items as $item) {
                $product = $item['product'];
                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_price' => $product->price,
                    'quantity' => $item['quantity'],
                    'recipient_name' => $item['recipient_name'],
                    'bouquet_size' => $item['bouquet_size'],
                    'wrapping_color' => $item['wrapping_color'],
                    'line_total' => $item['line_total'],
                    'greeting_message' => $item['greeting_message'],
                ]);

                if ($product->stock >= $item['quantity']) {
                    $product->decrement('stock', $item['quantity']);
                }
            }

            return $order->load(['items.product', 'latestPayment']);
        });

        return response()->json([
            'message' => 'Order created successfully.',
            'data' => $order,
        ], 201);
    }

    public function show(string $orderCode): JsonResponse
    {
        $order = Order::query()
            ->with(['items.product', 'payments', 'latestPayment'])
            ->where('order_code', $orderCode)
            ->firstOrFail();

        return response()->json([
            'data' => $order,
        ]);
    }

    public function confirmReceived(string $orderCode): JsonResponse
    {
        $order = Order::query()
            ->where('order_code', $orderCode)
            ->firstOrFail();

        if ($order->order_status !== 'delivering') {
            return response()->json([
                'message' => 'This order can only be confirmed after it is out for delivery.',
            ], 422);
        }

        $order->update([
            'order_status' => 'completed',
            'completed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Order marked as received.',
            'data' => $order->fresh(['items.product', 'payments', 'latestPayment']),
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $orders = Order::query()
            ->with(['items.product', 'latestPayment'])
            ->where('order_status', 'completed')
            ->when($request->filled('user_id'), fn ($query) => $query->where('user_id', $request->integer('user_id')))
            ->latest('completed_at')
            ->latest()
            ->paginate($request->integer('per_page', 25));

        return response()->json($orders);
    }

    private function generateOrderCode(): string
    {
        do {
            $code = 'BLM-'.now()->format('ymd').'-'.Str::upper(Str::random(5));
        } while (Order::where('order_code', $code)->exists());

        return $code;
    }
}
