<?php

namespace Database\Factories;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Appointment> */
class AppointmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'patient_id' => Patient::factory(),
            'doctor_id' => Doctor::factory(),
            'appointment_date' => now()->addDay()->toDateString(),
            'starts_at' => '09:00:00',
            'duration_minutes' => 30,
            'type' => 'new_visit',
            'status' => 'booked',
            'booked_by' => 'reception',
            'booked_by_user_id' => User::factory()->reception(),
        ];
    }
}