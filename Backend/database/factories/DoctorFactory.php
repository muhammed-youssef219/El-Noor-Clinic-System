<?php

namespace Database\Factories;

use App\Models\Doctor;
use App\Models\Specialty;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Doctor> */
class DoctorFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->doctor(),
            'specialty_id' => Specialty::factory(),
            'license' => fake()->unique()->bothify('LIC-#####'),
            'experience_years' => fake()->numberBetween(1, 35),
            'bio' => fake()->paragraph(),
            'new_visit_price' => fake()->randomFloat(2, 100, 1000),
            'follow_up_price' => fake()->randomFloat(2, 50, 500),
            'rating' => fake()->randomFloat(2, 1, 5),
        ];
    }
}