<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderManagementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::query()
            ->with(['items.product', 'latestPayment'])
            ->when($request->filled('payment_status'), fn ($query) => $query->where('payment_status', $request->string('payment_status')))
            ->when($request->filled('order_status'), fn ($query) => $query->where('order_status', $request->string('order_status')))
            ->latest()
            ->paginate($request->integer('per_page', 25));

        return response()->json($orders);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'order_status' => ['required', Rule::in(Order::ORDER_STATUSES)],
        ]);

        return $this->setOrderStatus($id, $validated['order_status']);
    }

    public function updatePayment(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'payment_status' => ['required', Rule::in(Order::PAYMENT_STATUSES)],
        ]);
        $status = $validated['payment_status'];
        $order = Order::query()->with('latestPayment')->findOrFail($id);
        $order->update([
            'payment_status' => $status,
            'order_status' => $status === 'paid' ? 'payment_verified' : $order->order_status,
        ]);

        if ($order->latestPayment) {
            $order->latestPayment->update([
                'status' => $status,
                'paid_at' => $status === 'paid' ? now() : $order->latestPayment->paid_at,
            ]);
        }

        return response()->json([
            'message' => 'Payment status updated.',
            'data' => $order->fresh(['items.product', 'latestPayment']),
        ]);
    }

    public function process(int $id): JsonResponse
    {
        $order = Order::query()->with('latestPayment')->findOrFail($id);
        if (!$this->canStartProcessing($order)) {
            return response()->json([
                'message' => 'Payment must be approved before processing this order.',
            ], 422);
        }

        return $this->setOrderStatus($id, 'processing');
    }

    public function readyToDeliver(int $id): JsonResponse
    {
        return $this->setOrderStatus($id, 'ready_to_deliver');
    }

    public function deliver(int $id): JsonResponse
    {
        return $this->setOrderStatus($id, 'delivering');
    }

    public function complete(int $id): JsonResponse
    {
        return $this->setOrderStatus($id, 'completed');
    }

    public function destroy(int $id): JsonResponse
    {
        $order = Order::query()->findOrFail($id);
        $orderCode = $order->order_code;
        $order->delete();

        return response()->json([
            'message' => "{$orderCode} deleted successfully.",
        ]);
    }

    private function setOrderStatus(int $id, string $status): JsonResponse
    {
        $order = Order::query()->findOrFail($id);
        $order->update([
            'order_status' => $status,
            'completed_at' => $status === 'completed'
                ? ($order->completed_at ?? now())
                : $order->completed_at,
        ]);

        return response()->json([
            'message' => 'Order status updated.',
            'data' => $order->fresh(['items.product', 'latestPayment']),
        ]);
    }

    private function canStartProcessing(Order $order): bool
    {
        if (in_array($order->payment_status, ['paid', 'cod_pending', 'unpaid'], true)) {
            return true;
        }

        return strtolower((string) $order->latestPayment?->payment_method) === 'cod';
    }
}
