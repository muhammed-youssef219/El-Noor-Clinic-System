<?php

namespace Database\Factories;

use App\Models\Doctor;
use App\Models\Leave;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Leave> */
class LeaveFactory extends Factory
{
    public function definition(): array
    {
        return ['doctor_id' => Doctor::factory(), 'starts_on' => now()->addWeek()->toDateString(), 'ends_on' => now()->addWeek()->addDay()->toDateString(), 'reason' => fake()->sentence(), 'status' => 'pending'];
    }
}