<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('resource_id')->constrained()->restrictOnDelete();
            $table->timestampTz('starts_at');
            $table->timestampTz('ends_at');
            $table->string('status', 20)->default('pending');
            $table->unsignedInteger('total_price_cents');
            $table->string('stripe_session_id')->nullable()->unique();
            $table->string('stripe_payment_intent_id')->nullable();
            $table->timestampTz('cancelled_at')->nullable();
            $table->timestampsTz();

            $table->index('user_id');
            $table->index('resource_id');
            $table->index('status');
            $table->index('starts_at');
        });

        // CHECK: ends_at must be after starts_at
        DB::statement('ALTER TABLE bookings ADD CONSTRAINT bookings_check_dates CHECK (ends_at > starts_at)');

        // EXCLUDE: no overlapping bookings for the same resource (ignores cancelled bookings)
        DB::statement('
            ALTER TABLE bookings
            ADD CONSTRAINT bookings_no_overlap
            EXCLUDE USING gist (
                resource_id WITH =,
                tstzrange(starts_at, ends_at, \'[)\') WITH &&
            )
            WHERE (status != \'cancelled\')
        ');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_no_overlap');
        DB::statement('ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_check_dates');
        Schema::dropIfExists('bookings');
    }
};
