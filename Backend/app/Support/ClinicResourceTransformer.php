<?php

namespace App\Support;

use App\Models\Appointment;
use App\Models\AuditLog;
use App\Models\ClinicSetting;
use App\Models\Doctor;
use App\Models\Invoice;
use App\Models\Leave;
use App\Models\MedicalRecord;
use App\Models\Notification;
use App\Models\Patient;
use App\Models\ScheduleException;
use App\Models\ServiceCatalogItem;
use App\Models\Specialty;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class ClinicResourceTransformer
{
    public function transform(Model $model): array
    {
        return match (true) {
            $model instanceof Doctor => $this->doctor($model),
            $model instanceof Patient => $this->patient($model),
            $model instanceof Appointment => $this->appointment($model),
            $model instanceof MedicalRecord => $this->medicalRecord($model),
            $model instanceof Invoice => $this->invoice($model),
            $model instanceof ServiceCatalogItem => ['id' => $model->id, 'name' => $model->name, 'specialtyKey' => $model->specialty?->key, 'price' => (float) $model->price],
            $model instanceof Specialty => ['id' => $model->id, 'key' => $model->key, 'name' => $model->name],
            $model instanceof Leave => ['id' => $model->id, 'doctorId' => $model->doctor_id, 'from' => $model->starts_on->toDateString(), 'to' => $model->ends_on->toDateString(), 'reason' => $model->reason, 'status' => $model->status],
            $model instanceof ScheduleException => ['id' => $model->id, 'doctorId' => $model->doctor_id, 'date' => $model->exception_date->toDateString(), 'from' => substr($model->starts_at, 0, 5), 'to' => substr($model->ends_at, 0, 5), 'note' => $model->note],
            $model instanceof Notification => ['id' => $model->id, 'type' => $model->type, 'appointmentId' => $model->appointment_id, 'recipientId' => $model->recipient_user_id, 'title' => $model->title, 'body' => $model->body, 'channel' => $model->channel, 'status' => $model->status, 'sentAt' => $model->sent_at?->toISOString(), 'read' => $model->read_at !== null],
            $model instanceof AuditLog => ['id' => $model->id, 'ts' => $model->occurred_at->getTimestampMs(), 'actor' => $model->actorUser?->name, 'action' => $model->action, 'entity' => class_basename($model->auditable_type), 'entityId' => $model->auditable_id, 'summary' => $model->summary],
            $model instanceof ClinicSetting => ['name' => $model->name, 'address' => $model->address, 'phone' => $model->phone, 'whatsapp' => $model->whatsapp, 'paymentNumber' => $model->transfer_receiving_number, 'hours' => $model->hours],
            $model instanceof User => ['id' => $model->id, 'name' => $model->name, 'role' => $model->role, 'email' => $model->email, 'phone' => $model->phone, 'status' => $model->status, 'doctorId' => $model->doctor?->id],
            default => $model->toArray(),
        };
    }

    private function doctor(Doctor $doctor): array
    {
        $days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        $schedule = [];
        foreach ($doctor->workingHours as $hour) {
            $schedule[$days[$hour->weekday]] = [substr($hour->starts_at, 0, 5), substr($hour->ends_at, 0, 5)];
        }

        return ['id' => $doctor->id, 'name' => $doctor->user?->name, 'email' => $doctor->user?->email, 'specialtyKey' => $doctor->specialty?->key, 'license' => $doctor->license, 'exp' => $doctor->experience_years, 'photo' => $doctor->photo_path ? url('storage/'.$doctor->photo_path) : null, 'bio' => $doctor->bio, 'price' => (float) $doctor->new_visit_price, 'followUp' => (float) $doctor->follow_up_price, 'rating' => (float) $doctor->rating, 'schedule' => $schedule];
    }

    private function patient(Patient $patient): array
    {
        return ['id' => $patient->id, 'name' => $patient->user?->name, 'email' => $patient->user?->email, 'dob' => $patient->date_of_birth?->toDateString(), 'gender' => $patient->gender, 'nationalId' => $patient->national_id, 'phone' => $patient->phone ?: $patient->user?->phone, 'address' => $patient->address, 'emergency' => trim($patient->emergency_contact_name.' '.$patient->emergency_contact_phone), 'blood' => $patient->blood_type, 'allergies' => $patient->allergies, 'chronic' => $patient->chronic_conditions, 'firstVisit' => $patient->first_visit_at?->toDateString()];
    }

    private function appointment(Appointment $appointment): array
    {
        return ['id' => $appointment->id, 'patientId' => $appointment->patient_id, 'doctorId' => $appointment->doctor_id, 'date' => $appointment->appointment_date->toDateString(), 'time' => substr($appointment->starts_at, 0, 5), 'duration' => $appointment->duration_minutes, 'type' => $appointment->type, 'status' => $appointment->status, 'notes' => $appointment->notes, 'bookedBy' => $appointment->booked_by];
    }

    private function medicalRecord(MedicalRecord $record): array
    {
        return ['id' => $record->id, 'appointmentId' => $record->appointment_id, 'patientId' => $record->patient_id, 'doctorId' => $record->doctor_id, 'date' => $record->record_date->toDateString(), 'complaint' => $record->complaint, 'exam' => $record->exam, 'diagnosis' => $record->diagnosis, 'notes' => $record->notes, 'labs' => $record->labs, 'medications' => $record->medications->map(fn ($medication) => ['name' => $medication->name, 'dose' => $medication->dose, 'freq' => $medication->frequency, 'duration' => $medication->duration])->values()];
    }

    private function invoice(Invoice $invoice): array
    {
        return ['id' => $invoice->id, 'patientId' => $invoice->patient_id, 'appointmentId' => $invoice->appointment_id, 'services' => $invoice->items->map(fn ($item) => ['name' => $item->name, 'price' => (float) $item->unit_price])->values(), 'total' => (float) $invoice->total, 'method' => $invoice->payment_method, 'status' => $invoice->status, 'date' => $invoice->issued_at->toDateString(), 'proofPhoto' => $invoice->paymentProofs->last()?->path ? url('storage/'.$invoice->paymentProofs->last()->path) : null];
    }
}
