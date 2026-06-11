<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PaymentManagementController extends Controller
{
    public function approve(int $id): JsonResponse
    {
        $payment = DB::transaction(function () use ($id) {
            $payment = Payment::query()->with('order')->lockForUpdate()->findOrFail($id);

            $payment->update([
                'status' => 'paid',
                'paid_at' => now(),
            ]);

            $payment->order->update([
                'payment_status' => 'paid',
                'order_status' => 'processing',
            ]);

            return $payment->fresh(['order.items.product', 'order.latestPayment']);
        });

        return response()->json([
            'message' => 'Payment approved successfully.',
            'data' => [
                'payment' => $payment,
                'order' => $payment->order,
            ],
        ]);
    }

    public function reject(int $id): JsonResponse
    {
        $payment = DB::transaction(function () use ($id) {
            $payment = Payment::query()->with('order')->lockForUpdate()->findOrFail($id);

            $payment->update([
                'status' => 'rejected',
                'paid_at' => null,
            ]);

            $payment->order->update([
                'payment_status' => 'rejected',
                'order_status' => 'waiting_payment',
            ]);

            return $payment->fresh(['order.items.product', 'order.latestPayment']);
        });

        return response()->json([
            'message' => 'Payment rejected successfully.',
            'data' => [
                'payment' => $payment,
                'order' => $payment->order,
            ],
        ]);
    }
}
