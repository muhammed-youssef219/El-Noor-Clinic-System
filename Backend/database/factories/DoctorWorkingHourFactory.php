<?php

namespace Database\Factories;

use App\Models\Doctor;
use App\Models\DoctorWorkingHour;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<DoctorWorkingHour> */
class DoctorWorkingHourFactory extends Factory
{
    public function definition(): array
    {
        return ['doctor_id' => Doctor::factory(), 'weekday' => fake()->numberBetween(0, 6), 'starts_at' => '09:00:00', 'ends_at' => '17:00:00'];
    }
}