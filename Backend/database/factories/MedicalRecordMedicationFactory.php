<?php

namespace Database\Factories;

use App\Models\MedicalRecord;
use App\Models\MedicalRecordMedication;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<MedicalRecordMedication> */
class MedicalRecordMedicationFactory extends Factory
{
    public function definition(): array
    {
        return ['medical_record_id' => MedicalRecord::factory(), 'name' => fake()->word(), 'dose' => '500 mg', 'frequency' => 'twice daily', 'duration' => '5 days'];
    }
}