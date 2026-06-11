<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupportTicketController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'order_code' => ['nullable', 'string', 'max:80'],
            'message' => ['required', 'string', 'max:4000'],
        ]);

        $ticket = SupportTicket::create($validated + ['status' => 'open']);

        return response()->json([
            'message' => 'Support ticket created.',
            'data' => $ticket,
        ], 201);
    }
}
