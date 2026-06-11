<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:40'],
            'campus_address' => ['nullable', 'string', 'max:2000'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user = User::create([
            ...$validated,
            'password' => Hash::make($validated['password']),
            'role' => 'customer',
            'api_token' => Str::random(60),
        ]);

        return response()->json([
            'message' => 'Account created.',
            'data' => ['user' => $user, 'token' => $user->api_token],
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();
        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json(['message' => 'Invalid email or password.'], 422);
        }

        $user->forceFill(['api_token' => Str::random(60)])->save();

        return response()->json([
            'message' => 'Logged in.',
            'data' => ['user' => $user, 'token' => $user->api_token],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $token = $request->bearerToken();
        $user = $token ? User::where('api_token', $token)->first() : null;

        return response()->json(['data' => $user]);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->bearerToken();
        if ($token) {
            User::where('api_token', $token)->update(['api_token' => null]);
        }

        return response()->json(['message' => 'Logged out.']);
    }
}
