<?php

use App\Http\Controllers\Api\V1\Auth\LoginController;
use App\Http\Controllers\Api\V1\Auth\LogoutController;
use App\Http\Controllers\Api\V1\Auth\RegisterController;
use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\PayDunya\CheckoutController as PayDunyaCheckoutController;
use App\Http\Controllers\Api\V1\ResourceController;
use App\Http\Controllers\Api\V1\Stripe\CheckoutController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — v1
|--------------------------------------------------------------------------
*/

Route::prefix('api/v1')->group(function () {

    // ── Public ──────────────────────────────────────────────────────────
    Route::get('resources', [ResourceController::class, 'index']);
    Route::get('resources/{resource}/availability', [ResourceController::class, 'availability']);
    Route::get('resources/{resource}', [ResourceController::class, 'show']);

    // ── Guest only ───────────────────────────────────────────────────────
    Route::middleware('guest')->group(function () {
        Route::post('auth/register', RegisterController::class);
        Route::post('auth/login', LoginController::class);
    });

    // ── Authenticated ────────────────────────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', LogoutController::class);
        Route::get('user', [UserController::class, 'show']);

        // Bookings
        Route::get('bookings', [BookingController::class, 'index']);
        Route::post('bookings', [BookingController::class, 'store']);
        Route::get('bookings/{booking}', [BookingController::class, 'show']);
        Route::delete('bookings/{booking}', [BookingController::class, 'destroy']);
        Route::post('bookings/{booking}/checkout', CheckoutController::class);
        Route::post('bookings/{booking}/paydunya-checkout', PayDunyaCheckoutController::class);

        // Resources (admin write operations)
        Route::post('resources', [ResourceController::class, 'store']);
        Route::put('resources/{resource}', [ResourceController::class, 'update']);
        Route::delete('resources/{resource}', [ResourceController::class, 'destroy']);
    });
});
