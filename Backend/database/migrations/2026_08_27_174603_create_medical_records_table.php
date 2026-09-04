<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medical_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->unique()->constrained()->restrictOnDelete();
            $table->foreignId('patient_id')->constrained()->restrictOnDelete();
            $table->foreignId('doctor_id')->constrained()->restrictOnDelete();
            $table->date('record_date');
            $table->text('complaint')->nullable();
            $table->text('exam')->nullable();
            $table->text('diagnosis')->nullable();
            $table->text('notes')->nullable();
            $table->text('labs')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'record_date']);
            $table->index(['doctor_id', 'record_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medical_records');
    }
};