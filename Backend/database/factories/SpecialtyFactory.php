<?php

namespace Database\Factories;

use App\Models\Specialty;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Specialty> */
class SpecialtyFactory extends Factory
{
    public function definition(): array
    {
        return ['key' => fake()->unique()->slug(2), 'name' => fake()->words(2, true)];
    }
}