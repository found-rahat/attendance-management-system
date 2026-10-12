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
        Schema::table('companies', function (Blueprint $table) {
            $table->foreignId('subscription_plan_id')
                ->nullable()
                ->after('is_active')
                ->constrained('subscription_plans')
                ->nullOnDelete();

            $table->string('subscription_status', 20)->default('active')->after('subscription_plan_id');
            $table->date('subscription_starts_at')->nullable()->after('subscription_status');
            $table->date('subscription_ends_at')->nullable()->after('subscription_starts_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropConstrainedForeignId('subscription_plan_id');
            $table->dropColumn(['subscription_status', 'subscription_starts_at', 'subscription_ends_at']);
        });
    }
};