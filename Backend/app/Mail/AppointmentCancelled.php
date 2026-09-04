<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentCancelled extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Appointment $appointment, public ?string $reason = null)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'إلغاء الموعد الطبي - ' . $this->appointment->appointment_date,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.appointment-cancelled',
            with: [
                'patient' => $this->appointment->patient,
                'doctor' => $this->appointment->doctor,
                'appointment' => $this->appointment,
                'appointmentDate' => $this->appointment->appointment_date->format('d/m/Y'),
                'appointmentTime' => $this->appointment->starts_at,
                'reason' => $this->reason,
            ],
        );
    }
}
