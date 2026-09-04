<?php

namespace Database\Factories;

use App\Models\ClinicSetting;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ClinicSetting> */
class ClinicSettingFactory extends Factory
{
    public function definition(): array
    {
        return ['name' => fake()->company(), 'address' => fake()->address(), 'phone' => fake()->numerify('01#########'), 'hours' => ['sunday' => ['09:00', '17:00']]];
    }
}