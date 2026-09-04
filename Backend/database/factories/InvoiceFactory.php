<?php

namespace Database\Factories;

use App\Models\Appointment;
use App\Models\Invoice;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Invoice> */
class InvoiceFactory extends Factory
{
    public function definition(): array
    {
        return ['patient_id' => Patient::factory(), 'appointment_id' => Appointment::factory(), 'total' => fake()->randomFloat(2, 100, 2000), 'payment_method' => 'cash', 'status' => 'pending', 'issued_at' => now()];
    }
}