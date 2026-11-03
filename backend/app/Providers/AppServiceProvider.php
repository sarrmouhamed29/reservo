<?php

namespace App\Providers;

use App\Models\Booking;
use App\Models\Resource;
use App\Policies\BookingPolicy;
use App\Policies\ResourcePolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Gate::policy(Resource::class, ResourcePolicy::class);
        Gate::policy(Booking::class, BookingPolicy::class);
    }
}
