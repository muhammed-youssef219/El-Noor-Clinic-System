<?php

namespace App\Listeners;

use App\Events\AppointmentCancelled;
use App\Services\SmsNotificationService;

class SendAppointmentCancellationSms
{
    public function __construct(private SmsNotificationService $smsService)
    {
    }

    public function handle(AppointmentCancelled $event): void
    {
        $appointment = $event->appointment;
        $patient = $appointment->patient;
        $doctor = $appointment->doctor;

        if ($patient->phone) {
            $reason = $event->reason ? " - السبب: {$event->reason}" : '';
            $message = "تم إلغاء موعدك الطبي مع د. {$doctor->name} بتاريخ {$appointment->appointment_date->format('d/m/Y')}{$reason}. يرجى التواصل معنا لحجز موعد آخر.";
            $this->smsService->send($patient->phone, $message);
        }
    }
}
