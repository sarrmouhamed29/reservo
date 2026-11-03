<?php

use App\Http\Controllers\Stripe\WebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Stripe webhook — bypasses CSRF via VerifyCsrfToken exclusion in middleware
Route::post('stripe/webhook', WebhookController::class)
    ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class]);
