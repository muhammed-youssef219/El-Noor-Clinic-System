<?php

namespace App\Services;

use App\Events\AppointmentCreated;
use App\Events\AppointmentCancelled;
use App\Models\Appointment;
use App\Models\AuditLog;
use App\Models\Doctor;
use App\Models\Leave;
use App\Models\ScheduleException;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ClinicService
{
    public function createAppointment(array $data, User $actor): Appointment
    {
        return DB::transaction(function () use ($data, $actor): Appointment {
            $doctor = Doctor::query()->with('workingHours')->lockForUpdate()->findOrFail($data['doctor_id']);
            $date = Carbon::parse($data['appointment_date']);
            $exception = ScheduleException::query()->where('doctor_id', $doctor->id)->whereDate('exception_date', $date)->first();
            $hours = $exception ? [$exception->starts_at, $exception->ends_at] : $doctor->workingHours->firstWhere('weekday', $date->dayOfWeek);

            if (! $hours || Leave::query()->where('doctor_id', $doctor->id)->where('status', 'approved')->whereDate('starts_on', '<=', $date)->whereDate('ends_on', '>=', $date)->exists()) {
                abort(422, 'The doctor is unavailable on this date.');
            }

            $startsAt = $data['starts_at'];
            $start = $exception ? $exception->starts_at : $hours->starts_at;
            $end = $exception ? $exception->ends_at : $hours->ends_at;
            if ($startsAt < $start || $startsAt >= $end) {
                abort(422, 'The requested time is outside the doctor working hours.');
            }

            if (Appointment::query()->where('doctor_id', $doctor->id)->whereDate('appointment_date', $date)->where('starts_at', $startsAt)->where('status', '!=', 'cancelled')->exists()) {
                abort(422, 'This time slot is already booked.');
            }

            $appointment = Appointment::query()->create([...$data, 'booked_by' => $actor->role, 'booked_by_user_id' => $actor->id, 'status' => 'booked']);
            
            AppointmentCreated::dispatch($appointment->load(['patient', 'doctor.user']));
            
            return $appointment;
        });
    }

    public function audit(User $actor, string $action, object $model, string $summary): void
    {
        AuditLog::query()->create(['actor_user_id' => $actor->id, 'action' => $action, 'auditable_type' => $model::class, 'auditable_id' => $model->id, 'summary' => $summary, 'occurred_at' => now()]);
    }
}

