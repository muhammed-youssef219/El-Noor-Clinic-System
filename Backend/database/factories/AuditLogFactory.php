<?php

namespace Database\Factories;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<AuditLog> */
class AuditLogFactory extends Factory
{
    public function definition(): array
    {
        return ['actor_user_id' => User::factory(), 'action' => 'create', 'auditable_type' => 'App\\Models\\Appointment', 'auditable_id' => fake()->numberBetween(1, 1000), 'summary' => fake()->sentence(), 'context' => ['source' => 'test'], 'occurred_at' => now()];
    }
}