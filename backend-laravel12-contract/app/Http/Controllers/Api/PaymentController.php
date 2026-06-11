<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentRequest;
use App\Models\Order;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    public function store(StorePaymentRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $order = Order::query()
            ->when(isset($validated['order_id']), fn ($query) => $query->whereKey($validated['order_id']))
            ->when(isset($validated['order_code']), fn ($query) => $query->where('order_code', $validated['order_code']))
            ->firstOrFail();

        $proofPath = $validated['proof_url'] ?? null;
        if ($request->hasFile('proof_image')) {
            $proofPath = $request->file('proof_image')->store('payment-proofs', 'public');
        }

        $status = $validated['status'] ?? 'waiting_verification';
        $payment = $order->payments()->create([
            'payment_method' => $validated['payment_method'],
            'amount' => $validated['amount'] ?? $order->total,
            'proof_image' => $proofPath,
            'status' => $status,
            'paid_at' => $validated['paid_at'] ?? now(),
        ]);

        $order->update([
            'payment_status' => $status,
            'order_status' => $status === 'paid' ? 'payment_verified' : $order->order_status,
        ]);

        return response()->json([
            'message' => 'Payment submitted successfully.',
            'data' => $payment->load('order'),
        ], 201);
    }
}
