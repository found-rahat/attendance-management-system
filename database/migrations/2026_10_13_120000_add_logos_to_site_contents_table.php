<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_contents', function (Blueprint $table) {
            $table->string('logo_dark')->nullable()->after('brand_name');
            $table->string('logo_light')->nullable()->after('logo_dark');
        });
    }

    public function down(): void
    {
        Schema::table('site_contents', function (Blueprint $table) {
            $table->dropColumn(['logo_dark', 'logo_light']);
        });
    }
};
