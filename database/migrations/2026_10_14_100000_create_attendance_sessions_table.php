<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_sessions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();

            $table->string('check_in_company_name')->nullable();
            $table->dateTime('check_in_at')->nullable();
            $table->decimal('check_in_latitude', 10, 7)->nullable();
            $table->decimal('check_in_longitude', 10, 7)->nullable();
            $table->unsignedSmallInteger('check_in_accuracy')->nullable();
            $table->string('check_in_address')->nullable();
            $table->string('check_in_photo')->nullable();
            $table->text('check_in_remarks')->nullable();

            $table->string('check_out_company_name')->nullable();
            $table->dateTime('check_out_at')->nullable();
            $table->decimal('check_out_latitude', 10, 7)->nullable();
            $table->decimal('check_out_longitude', 10, 7)->nullable();
            $table->unsignedSmallInteger('check_out_accuracy')->nullable();
            $table->string('check_out_address')->nullable();
            $table->string('check_out_photo')->nullable();
            $table->text('check_out_remarks')->nullable();

            $table->string('status')->default('pending'); // pending | completed

            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['company_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_sessions');
    }
};
