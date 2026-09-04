<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 20)->default('patient')->index();
            $table->string('phone', 30)->nullable()->unique();
            $table->string('status', 20)->default('active')->index();
            $table->softDeletes();
            $table->index('name');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropUnique(['phone']);
            $table->dropIndex(['status']);
            $table->dropIndex(['name']);
            $table->dropSoftDeletes();
            $table->dropColumn(['role', 'phone', 'status']);
        });
    }
};