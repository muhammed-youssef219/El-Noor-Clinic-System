<?php

namespace Database\Factories;

use App\Models\Appointment;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Notification> */
class NotificationFactory extends Factory
{
    public function definition(): array
    {
        return ['type' => 'booking-status', 'appointment_id' => Appointment::factory(), 'recipient_user_id' => User::factory(), 'title' => fake()->sentence(3), 'body' => fake()->paragraph(), 'channel' => 'in_app', 'status' => 'pending'];
    }
}