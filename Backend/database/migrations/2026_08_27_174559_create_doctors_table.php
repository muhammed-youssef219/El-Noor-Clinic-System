<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doctors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('specialty_id')->nullable()->index();
            $table->string('license')->unique();
            $table->unsignedSmallInteger('experience_years');
            $table->string('photo_path')->nullable();
            $table->text('bio')->nullable();
            $table->decimal('new_visit_price', 10, 2);
            $table->decimal('follow_up_price', 10, 2);
            $table->decimal('rating', 3, 2)->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctors');
    }
};