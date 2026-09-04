<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class ValidationTest extends TestCase
{
    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create([
            'role' => 'admin',
            'email' => 'admin-'.uniqid().'@example.com',
        ]);
    }

    public function test_doctor_creation_requires_valid_email(): void
    {
        $data = [
            'name' => 'Test Doctor',
            'email' => 'invalid-email',
            'specialtyKey' => 'cardiology',
            'license' => '12345',
            'schedule' => [['09:00', '13:00']],
        ];

        $this->actingAs($this->admin)
            ->postJson('/api/v1/doctors', $data)
            ->assertStatus(422)
            ->assertJsonPath('errors.email', fn ($errors) => count($errors) > 0);
    }

    public function test_doctor_creation_requires_schedule(): void
    {
        $data = [
            'name' => 'Test Doctor',
            'email' => 'doctor-schedule-'.uniqid().'@example.com',
            'specialtyKey' => 'cardiology',
            'license' => '12345',
        ];

        $this->actingAs($this->admin)
            ->postJson('/api/v1/doctors', $data)
            ->assertStatus(422)
            ->assertJsonPath('errors.schedule', fn ($errors) => count($errors) > 0);
    }

    public function test_appointment_creation_requires_valid_date(): void
    {
        $data = [
            'doctorId' => 1,
            'patientId' => 1,
            'date' => 'invalid-date',
            'time' => '10:00',
        ];

        $this->actingAs($this->admin)
            ->postJson('/api/v1/appointments', $data)
            ->assertStatus(422);
    }

    public function test_patient_creation_requires_valid_phone(): void
    {
        $data = [
            'name' => 'Test Patient',
            'email' => 'patient-phone-'.uniqid().'@example.com',
            'phone' => 'invalid-phone',
            'birthDate' => '1990-01-01',
        ];

        $this->actingAs($this->admin)
            ->postJson('/api/v1/patients', $data)
            ->assertStatus(422);
    }

    public function test_invalid_specialty_key_is_rejected(): void
    {
        $data = [
            'name' => 'Test Doctor',
            'email' => 'doctor-specialty-'.uniqid().'@example.com',
            'specialtyKey' => 'non-existent-specialty',
            'license' => '12345',
            'schedule' => [['09:00', '13:00']],
        ];

        $this->actingAs($this->admin)
            ->postJson('/api/v1/doctors', $data)
            ->assertStatus(422)
            ->assertJsonPath('errors.specialtyKey', fn ($errors) => count($errors) > 0);
    }

    public function test_schedule_time_format_must_be_valid(): void
    {
        $data = [
            'name' => 'Test Doctor',
            'email' => 'doctor-time-'.uniqid().'@example.com',
            'specialtyKey' => 'cardiology',
            'license' => '12345',
            'schedule' => [['25:00', '13:00']],
        ];

        $this->actingAs($this->admin)
            ->postJson('/api/v1/doctors', $data)
            ->assertStatus(422);
    }
}
