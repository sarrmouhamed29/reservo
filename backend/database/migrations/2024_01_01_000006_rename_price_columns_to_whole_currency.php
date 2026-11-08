<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Prices are now whole F CFA (XOF has no minor unit), not euro cents.
 * Existing rows keep their numbers: reseed or convert them if they were cents.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('resources', function (Blueprint $table) {
            $table->renameColumn('hourly_price_cents', 'hourly_price');
        });
        Schema::table('bookings', function (Blueprint $table) {
            $table->renameColumn('total_price_cents', 'total_price');
        });
    }

    public function down(): void
    {
        Schema::table('resources', function (Blueprint $table) {
            $table->renameColumn('hourly_price', 'hourly_price_cents');
        });
        Schema::table('bookings', function (Blueprint $table) {
            $table->renameColumn('total_price', 'total_price_cents');
        });
    }
};
