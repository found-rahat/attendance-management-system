<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');

            // Office geofence configuration (per tenant).
            $table->string('office_name')->default('Main Office');
            $table->decimal('latitude', 10, 7)->default(0);
            $table->decimal('longitude', 10, 7)->default(0);
            $table->unsignedInteger('radius_meters')->default(100);
            $table->string('late_after', 5)->default('09:15');
            $table->string('timezone', 64)->default('Asia/Dhaka');
            $table->unsignedSmallInteger('max_accuracy_meters')->default(100);

            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};