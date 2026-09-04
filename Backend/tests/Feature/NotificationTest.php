<?php

namespace Tests\Feature;

use App\Events\AppointmentCancelled;
use App\Events\AppointmentCreated;
use App\Mail\AppointmentCancelled as AppointmentCancelledMail;
use App\Mail\AppointmentConfirmed;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Notification;
use App\Models\Patient;
use App\Models\User;
use Tests\TestCase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Mail;

class NotificationTest extends TestCase
{
    private User $admin;
    private Doctor $doctor;
    private Patient $patient;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->doctor = Doctor::factory()->create();
        $this->patient = Patient::factory()->create();
        
        // Ensure doctor has working hours for tomorrow
        $tomorrow = today()->addDay();
        $this->doctor->workingHours()->updateOrCreate(
            ['weekday' => $tomorrow->dayOfWeek],
            ['starts_at' => '09:00', 'ends_at' => '17:00']
        );
    }

    public function test_appointment_created_event_is_dispatched(): void
    {
        Event::fake();

        $this->actingAs($this->admin)
            ->postJson('/api/v1/appointments', [
                'patientId' => $this->patient->id,
                'doctorId' => $this->doctor->id,
                'date' => today()->addDays(1)->toDateString(),
                'time' => '10:00',
                'type' => 'consultation',
            ])
            ->assertStatus(201);

        Event::assertDispatched(AppointmentCreated::class);
    }

    public function test_appointment_confirmation_email_is_sent(): void
    {
        Mail::fake();

        $this->actingAs($this->admin)
            ->postJson('/api/v1/appointments', [
                'patientId' => $this->patient->id,
                'doctorId' => $this->doctor->id,
                'date' => today()->addDays(1)->toDateString(),
                'time' => '10:00',
                'type' => 'consultation',
            ])
            ->assertStatus(201);

        Mail::assertQueued(AppointmentConfirmed::class);
    }

    public function test_appointment_cancellation_event_is_dispatched(): void
    {
        Event::fake();

        $appointment = Appointment::factory()->create([
            'doctor_id' => $this->doctor->id,
            'patient_id' => $this->patient->id,
            'status' => 'booked',
        ]);

        $this->actingAs($this->admin)
            ->patchJson("/api/v1/appointments/{$appointment->id}/status", [
                'status' => 'cancelled',
                'reason' => 'Doctor unavailable',
            ])
            ->assertStatus(200);

        Event::assertDispatched(AppointmentCancelled::class);
    }

    public function test_appointment_cancellation_email_is_sent(): void
    {
        Mail::fake();

        $appointment = Appointment::factory()->create([
            'doctor_id' => $this->doctor->id,
            'patient_id' => $this->patient->id,
            'status' => 'booked',
        ]);

        $this->actingAs($this->admin)
            ->patchJson("/api/v1/appointments/{$appointment->id}/status", [
                'status' => 'cancelled',
                'reason' => 'Doctor unavailable',
            ])
            ->assertStatus(200);

        Mail::assertQueued(AppointmentCancelledMail::class);
    }

    public function test_patient_only_sees_their_own_notifications(): void
    {
        $owner = User::factory()->create(['role' => 'patient']);
        $other = User::factory()->create(['role' => 'patient']);

        Notification::query()->create([
            'type' => 'booking-status',
            'appointment_id' => null,
            'recipient_user_id' => $owner->id,
            'title' => 'Your slot is confirmed',
            'body' => 'Your appointment is confirmed.',
            'channel' => 'in_app',
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        Notification::query()->create([
            'type' => 'booking-status',
            'appointment_id' => null,
            'recipient_user_id' => $other->id,
            'title' => 'Other patient notification',
            'body' => 'This should not be visible.',
            'channel' => 'in_app',
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        $this->actingAs($owner)
            ->getJson('/api/v1/notifications')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.recipientId', $owner->id);
    }

    public function test_doctor_only_sees_notifications_for_their_own_patients_and_appointments(): void
    {
        $doctorUser = User::factory()->create(['role' => 'doctor']);
        $otherDoctorUser = User::factory()->create(['role' => 'doctor']);
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id]);
        $otherDoctor = Doctor::factory()->create(['user_id' => $otherDoctorUser->id]);
        $patient = Patient::factory()->create();
        $otherPatient = Patient::factory()->create();

        $appointment = Appointment::factory()->create([
            'doctor_id' => $doctor->id,
            'patient_id' => $patient->id,
            'status' => 'confirmed',
        ]);

        Notification::query()->create([
            'type' => 'booking-status',
            'appointment_id' => $appointment->id,
            'recipient_user_id' => $doctorUser->id,
            'title' => 'Your patient was updated',
            'body' => 'This should appear for the doctor.',
            'channel' => 'in_app',
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        Notification::query()->create([
            'type' => 'booking-status',
            'appointment_id' => Appointment::factory()->create([
                'doctor_id' => $otherDoctor->id,
                'patient_id' => $otherPatient->id,
                'status' => 'confirmed',
            ])->id,
            'recipient_user_id' => $otherDoctorUser->id,
            'title' => 'Other doctor notification',
            'body' => 'This should not be visible.',
            'channel' => 'in_app',
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        $this->actingAs($doctorUser)
            ->getJson('/api/v1/notifications')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.recipientId', $doctorUser->id);
    }

    public function test_appointment_creation_creates_in_app_notifications_for_patient_and_doctor(): void
    {
        $patientUser = User::factory()->create(['role' => 'patient']);
        $doctorUser = User::factory()->create(['role' => 'doctor']);
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id]);
        $patient = Patient::factory()->create(['user_id' => $patientUser->id]);

        $tomorrow = today()->addDay();
        $doctor->workingHours()->updateOrCreate(
            ['weekday' => $tomorrow->dayOfWeek],
            ['starts_at' => '09:00', 'ends_at' => '17:00']
        );

        $this->actingAs($this->admin)
            ->postJson('/api/v1/appointments', [
                'patientId' => $patient->id,
                'doctorId' => $doctor->id,
                'date' => $tomorrow->toDateString(),
                'time' => '10:00',
                'type' => 'consultation',
            ])
            ->assertStatus(201);

        $this->assertDatabaseHas('notifications', [
            'recipient_user_id' => $patientUser->id,
            'type' => 'appointment_created',
        ]);
        $this->assertDatabaseHas('notifications', [
            'recipient_user_id' => $doctorUser->id,
            'type' => 'appointment_created',
        ]);
    }

    public function test_status_update_creates_in_app_notifications_for_relevant_users(): void
    {
        $patientUser = User::factory()->create(['role' => 'patient']);
        $doctorUser = User::factory()->create(['role' => 'doctor']);
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id]);
        $patient = Patient::factory()->create(['user_id' => $patientUser->id]);
        $appointment = Appointment::factory()->create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'status' => 'booked',
        ]);

        $this->actingAs($this->admin)
            ->patchJson("/api/v1/appointments/{$appointment->id}/status", [
                'status' => 'confirmed',
            ])
            ->assertStatus(200);

        $this->assertDatabaseHas('notifications', [
            'recipient_user_id' => $patientUser->id,
            'type' => 'appointment_status_updated',
        ]);
        $this->assertDatabaseHas('notifications', [
            'recipient_user_id' => $doctorUser->id,
            'type' => 'appointment_status_updated',
        ]);
    }

    public function test_reminder_event_creates_in_app_notification_for_patient_and_doctor(): void
    {
        $patientUser = User::factory()->create(['role' => 'patient']);
        $doctorUser = User::factory()->create(['role' => 'doctor']);
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id]);
        $patient = Patient::factory()->create(['user_id' => $patientUser->id]);
        $appointment = Appointment::factory()->create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'status' => 'confirmed',
        ]);

        \App\Events\AppointmentReminderNeeded::dispatch($appointment->load(['patient.user', 'doctor.user']));

        $this->assertDatabaseHas('notifications', [
            'recipient_user_id' => $patientUser->id,
            'type' => 'appointment_reminder',
        ]);
        $this->assertDatabaseHas('notifications', [
            'recipient_user_id' => $doctorUser->id,
            'type' => 'appointment_reminder',
        ]);
    }

    public function test_admin_can_see_all_notifications_from_all_roles(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $doctorUser = User::factory()->create(['role' => 'doctor']);
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id]);
        $patientUser = User::factory()->create(['role' => 'patient']);
        $patient = Patient::factory()->create(['user_id' => $patientUser->id]);
        $receptionUser = User::factory()->create(['role' => 'reception']);

        // Create notifications for different recipients
        Notification::query()->create([
            'type' => 'appointment_created',
            'appointment_id' => null,
            'recipient_user_id' => $doctorUser->id,
            'title' => 'Doctor notification',
            'body' => 'Appointment created for your patient.',
            'channel' => 'in_app',
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        Notification::query()->create([
            'type' => 'appointment_created',
            'appointment_id' => null,
            'recipient_user_id' => $patientUser->id,
            'title' => 'Patient notification',
            'body' => 'Your appointment has been booked.',
            'channel' => 'in_app',
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        Notification::query()->create([
            'type' => 'appointment_created',
            'appointment_id' => null,
            'recipient_user_id' => $receptionUser->id,
            'title' => 'Reception notification',
            'body' => 'New appointment to process.',
            'channel' => 'in_app',
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        // Admin should see all notifications
        $response = $this->actingAs($admin)
            ->getJson('/api/v1/notifications')
            ->assertOk();

        $this->assertCount(3, $response->json('data'));
        $recipientIds = collect($response->json('data'))->pluck('recipientId')->toArray();
        $this->assertContains($doctorUser->id, $recipientIds);
        $this->assertContains($patientUser->id, $recipientIds);
        $this->assertContains($receptionUser->id, $recipientIds);
    }

    public function test_admin_can_read_all_notifications(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $doctorUser = User::factory()->create(['role' => 'doctor']);
        $patientUser = User::factory()->create(['role' => 'patient']);

        $doctorNotif = Notification::query()->create([
            'type' => 'appointment_created',
            'appointment_id' => null,
            'recipient_user_id' => $doctorUser->id,
            'title' => 'Doctor notification',
            'body' => 'Test',
            'channel' => 'in_app',
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        $patientNotif = Notification::query()->create([
            'type' => 'appointment_created',
            'appointment_id' => null,
            'recipient_user_id' => $patientUser->id,
            'title' => 'Patient notification',
            'body' => 'Test',
            'channel' => 'in_app',
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        // Admin should be able to mark all notifications as read
        $this->actingAs($admin)
            ->patchJson('/api/v1/notifications/read-all')
            ->assertOk();

        $this->assertNotNull($doctorNotif->fresh()->read_at);
        $this->assertNotNull($patientNotif->fresh()->read_at);
    }

    public function test_admin_can_clear_all_notifications(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $doctorUser = User::factory()->create(['role' => 'doctor']);
        $patientUser = User::factory()->create(['role' => 'patient']);

        Notification::query()->create([
            'type' => 'appointment_created',
            'appointment_id' => null,
            'recipient_user_id' => $doctorUser->id,
            'title' => 'Doctor notification',
            'body' => 'Test',
            'channel' => 'in_app',
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        Notification::query()->create([
            'type' => 'appointment_created',
            'appointment_id' => null,
            'recipient_user_id' => $patientUser->id,
            'title' => 'Patient notification',
            'body' => 'Test',
            'channel' => 'in_app',
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        // Admin should be able to clear all notifications
        $this->actingAs($admin)
            ->deleteJson('/api/v1/notifications/clear')
            ->assertOk();

        $this->assertCount(0, Notification::all());
    }
}
