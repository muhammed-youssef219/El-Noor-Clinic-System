<?php

namespace App\Listeners;

use App\Events\AppointmentCreated;
use App\Mail\AppointmentConfirmed;
use App\Models\Notification;
use Illuminate\Support\Facades\Mail;

class SendAppointmentConfirmationEmail
{
    public function handle(AppointmentCreated $event): void
    {
        $appointment = $event->appointment;

        $recipients = collect([
            $appointment->patient?->user,
            $appointment->doctor?->user,
            $appointment->bookedByUser,
        ])->filter()->unique('id')->values();

        foreach ($recipients as $user) {
            Notification::query()->create([
                'type' => 'appointment_created',
                'appointment_id' => $appointment->id,
                'recipient_user_id' => $user->id,
                'title' => 'تم تأكيد الموعد',
                'body' => $user->role === 'patient'
                    ? "تم تأكيد موعدك مع د. {$appointment->doctor->user->name} بتاريخ {$appointment->appointment_date->format('d/m/Y')} في {$appointment->starts_at}."
                    : "تم حجز موعد جديد مع المريض {$appointment->patient->user->name} بتاريخ {$appointment->appointment_date->format('d/m/Y')} في {$appointment->starts_at}.",
                'channel' => 'in_app',
                'status' => 'sent',
                'sent_at' => now(),
            ]);
        }

        if ($appointment->patient->email) {
            Mail::to($appointment->patient->email)->queue(new AppointmentConfirmed($appointment));
        }

        if ($appointment->doctor->user->email) {
            Mail::to($appointment->doctor->user->email)->queue(new AppointmentConfirmed($appointment));
        }
    }
}
