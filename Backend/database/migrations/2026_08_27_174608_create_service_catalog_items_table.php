<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_catalog_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->unsignedBigInteger('specialty_id')->nullable()->index();
            $table->decimal('price', 12, 2);
            $table->softDeletes();
            $table->timestamps();

            $table->index(['specialty_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_catalog_items');
    }
};