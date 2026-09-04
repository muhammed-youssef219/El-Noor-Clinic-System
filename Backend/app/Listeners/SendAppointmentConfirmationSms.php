<?php

namespace App\Listeners;

use App\Events\AppointmentCreated;
use App\Services\SmsNotificationService;

class SendAppointmentConfirmationSms
{
    public function __construct(private SmsNotificationService $smsService)
    {
    }

    public function handle(AppointmentCreated $event): void
    {
        $appointment = $event->appointment;
        $patient = $appointment->patient;
        $doctor = $appointment->doctor;

        if ($patient->phone) {
            $message = "تم تأكيد موعدك الطبي مع د. {$doctor->name} بتاريخ {$appointment->appointment_date->format('d/m/Y')} في تمام الساعة {$appointment->starts_at}";
            $this->smsService->send($patient->phone, $message);
        }
    }
}
