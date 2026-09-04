<?php

namespace App\Listeners;

use App\Events\AppointmentCancelled;
use App\Mail\AppointmentCancelled as AppointmentCancelledMail;
use App\Models\Notification;
use Illuminate\Support\Facades\Mail;

class SendAppointmentCancellationEmail
{
    public function handle(AppointmentCancelled $event): void
    {
        $appointment = $event->appointment;

        $recipients = collect([
            $appointment->patient?->user,
            $appointment->doctor?->user,
            $appointment->bookedByUser,
        ])->filter()->unique('id')->values();

        foreach ($recipients as $user) {
            $reasonText = $event->reason ? " السبب: {$event->reason}." : '';

            Notification::query()->create([
                'type' => 'appointment_cancelled',
                'appointment_id' => $appointment->id,
                'recipient_user_id' => $user->id,
                'title' => 'تم إلغاء الموعد',
                'body' => $user->role === 'patient'
                    ? "تم إلغاء موعدك مع د. {$appointment->doctor->user->name} بتاريخ {$appointment->appointment_date->format('d/m/Y')} في {$appointment->starts_at}.{$reasonText}"
                    : "تم إلغاء موعد المريض {$appointment->patient->user->name} بتاريخ {$appointment->appointment_date->format('d/m/Y')} في {$appointment->starts_at}.{$reasonText}",
                'channel' => 'in_app',
                'status' => 'sent',
                'sent_at' => now(),
            ]);
        }

        if ($appointment->patient->email) {
            Mail::to($appointment->patient->email)->queue(new AppointmentCancelledMail($appointment, $event->reason));
        }

        if ($appointment->doctor->user->email) {
            Mail::to($appointment->doctor->user->email)->queue(new AppointmentCancelledMail($appointment, $event->reason));
        }
    }
}
