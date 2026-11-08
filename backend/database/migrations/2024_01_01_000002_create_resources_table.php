<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resources', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type', 50);
            $table->text('description')->nullable();
            $table->unsignedInteger('capacity')->nullable();
            $table->unsignedInteger('hourly_price_cents');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('type');
            $table->index('is_active');
            $table->index('name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resources');
    }
};
