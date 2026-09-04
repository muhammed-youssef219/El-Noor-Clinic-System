<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\AuthUserResource;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        $user = User::query()->where('email', $credentials['email'])->first();

        if (! $user || $user->status !== 'active' || $user->role !== $credentials['role'] || ! Hash::check($credentials['password'], $user->password)) {
            return ApiResponse::error('Invalid credentials.', 422, ['email' => ['Invalid credentials.']]);
        }

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return ApiResponse::success(new AuthUserResource($user->load(['doctor', 'patient'])));
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return ApiResponse::success(message: 'Logged out.');
    }

    public function me(Request $request): JsonResponse
    {
        return ApiResponse::success(new AuthUserResource($request->user()->load(['doctor', 'patient'])));
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $request->user()->update(['password' => $request->validated('password')]);
        $request->session()->regenerate();

        return ApiResponse::success(message: 'Password changed.');
    }
}
