<?php

namespace Database\Factories;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\MedicalRecord;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<MedicalRecord> */
class MedicalRecordFactory extends Factory
{
    public function definition(): array
    {
        return [
            'appointment_id' => Appointment::factory(),
            'patient_id' => Patient::factory(),
            'doctor_id' => Doctor::factory(),
            'record_date' => now()->toDateString(),
            'complaint' => fake()->sentence(),
            'exam' => fake()->paragraph(),
            'diagnosis' => fake()->sentence(),
        ];
    }
}