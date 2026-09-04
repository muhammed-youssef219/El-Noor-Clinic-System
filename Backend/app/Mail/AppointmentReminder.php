<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentReminder extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Appointment $appointment)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'تذكير بالموعد الطبي غداً - ' . $this->appointment->appointment_date,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.appointment-reminder',
            with: [
                'patient' => $this->appointment->patient,
                'doctor' => $this->appointment->doctor,
                'appointment' => $this->appointment,
                'appointmentDate' => $this->appointment->appointment_date->format('d/m/Y'),
                'appointmentTime' => $this->appointment->starts_at,
            ],
        );
    }
}
