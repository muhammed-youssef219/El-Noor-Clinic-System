<?php

namespace Database\Factories;

use App\Models\Doctor;
use App\Models\ScheduleException;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ScheduleException> */
class ScheduleExceptionFactory extends Factory
{
    public function definition(): array
    {
        return ['doctor_id' => Doctor::factory(), 'exception_date' => now()->addWeek()->toDateString(), 'starts_at' => '10:00:00', 'ends_at' => '16:00:00', 'note' => fake()->sentence()];
    }
}