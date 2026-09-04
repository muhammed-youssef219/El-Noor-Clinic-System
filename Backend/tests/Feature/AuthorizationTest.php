<?php

namespace Tests\Feature;

use App\Models\Doctor;
use App\Models\User;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    private User $admin;

    private User $doctor;

    private User $receptionist;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->doctor = User::factory()->create(['role' => 'doctor']);
        $this->receptionist = User::factory()->create(['role' => 'receptionist']);
    }

    public function test_admin_can_access_all_endpoints(): void
    {
        $this->actingAs($this->admin)
            ->getJson('/api/v1/doctors')
            ->assertStatus(200);

        $this->actingAs($this->admin)
            ->getJson('/api/v1/patients')
            ->assertStatus(200);

        $this->actingAs($this->admin)
            ->getJson('/api/v1/invoices')
            ->assertStatus(200);
    }

    public function test_doctor_cannot_delete_other_doctors(): void
    {
        $targetDoctor = Doctor::factory()->create();

        $this->actingAs($this->doctor)
            ->deleteJson("/api/v1/doctors/{$targetDoctor->id}")
            ->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_access_protected_endpoints(): void
    {
        $this->getJson('/api/v1/doctors')
            ->assertStatus(200);

        $this->getJson('/api/v1/patients')
            ->assertStatus(401);
    }

    public function test_receptionist_cannot_create_doctors(): void
    {
        $data = [
            'name' => 'Test Doctor',
            'email' => 'test@example.com',
            'specialtyKey' => 'general',
            'license' => '12345',
            'price' => 100,
        ];

        $this->actingAs($this->receptionist)
            ->postJson('/api/v1/doctors', $data)
            ->assertStatus(403);
    }

    public function test_admin_can_create_doctors(): void
    {
        $uniqueEmail = 'test-'.time().'@example.com';
        $data = [
            'name' => 'Test Doctor',
            'email' => $uniqueEmail,
            'specialtyKey' => 'cardiology',
            'license' => '12345-'.time(),
            'price' => 100,
            'exp' => 5,
            'schedule' => [
                ['09:00', '13:00'],
                ['14:00', '18:00'],
            ],
        ];

        $this->actingAs($this->admin)
            ->postJson('/api/v1/doctors', $data)
            ->assertStatus(201)
            ->assertJsonStructure(['success', 'data']);
    }
}
