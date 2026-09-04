<?php

namespace Database\Factories;

use App\Models\ServiceCatalogItem;
use App\Models\Specialty;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ServiceCatalogItem> */
class ServiceCatalogItemFactory extends Factory
{
    public function definition(): array
    {
        return ['name' => fake()->words(2, true), 'specialty_id' => Specialty::factory(), 'price' => fake()->randomFloat(2, 50, 2000)];
    }
}