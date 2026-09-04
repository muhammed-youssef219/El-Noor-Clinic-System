<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    /**
     * @param array<string, mixed> $meta
     */
    public static function success(
        mixed $data = null,
        ?string $message = null,
        int $status = 200,
        array $meta = [],
    ): JsonResponse {
        return response()->json(array_filter([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'meta' => $meta === [] ? null : $meta,
        ], static fn (mixed $value): bool => $value !== null), $status);
    }

    /**
     * @param array<string, mixed> $errors
     */
    public static function error(
        string $message,
        int $status,
        array $errors = [],
    ): JsonResponse {
        return response()->json(array_filter([
            'success' => false,
            'message' => $message,
            'errors' => $errors === [] ? null : $errors,
        ], static fn (mixed $value): bool => $value !== null), $status);
    }
}