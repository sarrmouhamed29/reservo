<?php

use App\Http\Controllers\PayDunya\WebhookController as PayDunyaWebhookController;
use App\Http\Controllers\Stripe\WebhookController;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Stripe webhook — bypasses CSRF via VerifyCsrfToken exclusion in middleware
Route::post('stripe/webhook', WebhookController::class)
    ->withoutMiddleware([VerifyCsrfToken::class]);

// PayDunya IPN webhook — bypasses CSRF
Route::post('paydunya/webhook', PayDunyaWebhookController::class)
    ->withoutMiddleware([VerifyCsrfToken::class]);
