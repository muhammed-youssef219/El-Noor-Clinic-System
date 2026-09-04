<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('doctors', function (Blueprint $table) {
            $table->foreign('specialty_id')->references('id')->on('specialties')->nullOnDelete();
        });

        Schema::table('service_catalog_items', function (Blueprint $table) {
            $table->foreign('specialty_id')->references('id')->on('specialties')->nullOnDelete();
        });

        Schema::table('invoice_items', function (Blueprint $table) {
            $table->foreign('service_catalog_item_id')->references('id')->on('service_catalog_items')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('invoice_items', function (Blueprint $table) {
            $table->dropForeign(['service_catalog_item_id']);
        });

        Schema::table('service_catalog_items', function (Blueprint $table) {
            $table->dropForeign(['specialty_id']);
        });

        Schema::table('doctors', function (Blueprint $table) {
            $table->dropForeign(['specialty_id']);
        });
    }
};