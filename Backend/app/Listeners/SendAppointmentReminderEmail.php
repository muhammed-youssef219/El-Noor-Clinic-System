<?php

namespace App\Listeners;

use App\Events\AppointmentReminderNeeded;
use App\Mail\AppointmentReminder;
use App\Models\Notification;
use Illuminate\Support\Facades\Mail;

class SendAppointmentReminderEmail
{
    public function handle(AppointmentReminderNeeded $event): void
    {
        $appointment = $event->appointment;

        $recipients = collect([
            $appointment->patient?->user,
            $appointment->doctor?->user,
            $appointment->bookedByUser,
        ])->filter()->unique('id')->values();

        foreach ($recipients as $user) {
            Notification::query()->create([
                'type' => 'appointment_reminder',
                'appointment_id' => $appointment->id,
                'recipient_user_id' => $user->id,
                'title' => 'تذكير بالمواعيد',
                'body' => $user->role === 'patient'
                    ? "لديك موعد مع د. {$appointment->doctor->user->name} بتاريخ {$appointment->appointment_date->format('d/m/Y')} في {$appointment->starts_at}."
                    : "تذكير: موعد المريض {$appointment->patient->user->name} مع د. {$appointment->doctor->user->name} بتاريخ {$appointment->appointment_date->format('d/m/Y')} في {$appointment->starts_at}.",
                'channel' => 'in_app',
                'status' => 'sent',
                'sent_at' => now(),
            ]);
        }

        if ($appointment->patient->email) {
            Mail::to($appointment->patient->email)->queue(new AppointmentReminder($appointment));
        }

        if ($appointment->doctor->user->email) {
            Mail::to($appointment->doctor->user->email)->queue(new AppointmentReminder($appointment));
        }
    }
}
