<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NewsletterSubscriptionController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        $subscription = NewsletterSubscription::updateOrCreate(
            ['email' => strtolower($validated['email'])],
            ['subscribed_at' => now()]
        );

        return response()->json([
            'message' => 'You are subscribed to Bloomify updates.',
            'data' => $subscription,
        ], 201);
    }
}
