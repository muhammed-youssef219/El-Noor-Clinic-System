<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreAppointmentRequest;
use App\Http\Requests\Api\StoreDoctorRequest;
use App\Http\Requests\Api\StoreMedicalRecordRequest;
use App\Http\Requests\Api\StorePatientRequest;
use App\Http\Resources\ClinicResource;
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
use App\Services\ClinicService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ClinicController extends Controller
{
    public function __construct(private ClinicService $clinicService) {}

    public function doctors(): JsonResponse { return $this->collection(Doctor::query()->with(['user', 'specialty', 'workingHours'])->get()); }
    public function doctor(Doctor $doctor): JsonResponse { return $this->item($doctor->load(['user', 'specialty', 'workingHours'])); }
    public function specialties(): JsonResponse { return $this->collection(Specialty::query()->orderBy('name')->get()); }

    public function storeDoctor(StoreDoctorRequest $request): JsonResponse
    {
        $data = $request->validated();
        $doctor = DB::transaction(function () use ($data) {
            $user = User::query()->create(['name' => $data['name'], 'email' => $data['email'], 'password' => $data['password'] ?? 'ChangeMe123!', 'role' => 'doctor', 'status' => 'active']);
            $doctor = Doctor::query()->create(['user_id' => $user->id, 'specialty_id' => Specialty::query()->where('key', $data['specialtyKey'] ?? null)->value('id'), 'license' => $data['license'], 'experience_years' => $data['exp'] ?? 0, 'new_visit_price' => $data['price'] ?? 0, 'follow_up_price' => $data['followUp'] ?? 0, 'bio' => $data['bio'] ?? null, 'rating' => 4.5]);
            $this->syncWorkingHours($doctor, $data['schedule']);
            return $doctor;
        });
        $this->clinicService->audit($request->user(), 'create', $doctor, 'Created doctor account.');
        return $this->item($doctor->load(['user', 'specialty', 'workingHours']), 201);
    }

    public function updateDoctor(Request $request, Doctor $doctor): JsonResponse
    {
        abort_unless($request->user()->role === 'admin' || $request->user()->doctor?->is($doctor), 403);
        $data = $request->validate(['name' => ['sometimes', 'string'], 'email' => ['sometimes', 'email'], 'specialtyKey' => ['sometimes', 'nullable', 'exists:specialties,key'], 'license' => ['sometimes', 'string'], 'exp' => ['sometimes', 'integer', 'min:0'], 'price' => ['sometimes', 'numeric', 'min:0'], 'followUp' => ['sometimes', 'numeric', 'min:0'], 'bio' => ['sometimes', 'nullable', 'string'], 'schedule' => ['sometimes', 'array', 'min:1'], 'schedule.*.0' => ['date_format:H:i'], 'schedule.*.1' => ['date_format:H:i']]);
        DB::transaction(function () use ($data, $doctor) {
            $doctor->user->update(array_filter(['name' => $data['name'] ?? null, 'email' => $data['email'] ?? null], fn ($value) => $value !== null));
            $doctor->update(array_filter(['specialty_id' => array_key_exists('specialtyKey', $data) ? Specialty::query()->where('key', $data['specialtyKey'])->value('id') : null, 'license' => $data['license'] ?? null, 'experience_years' => $data['exp'] ?? null, 'new_visit_price' => $data['price'] ?? null, 'follow_up_price' => $data['followUp'] ?? null, 'bio' => $data['bio'] ?? null], fn ($value) => $value !== null));
            if (isset($data['schedule'])) { $this->syncWorkingHours($doctor, $data['schedule']); }
        });
        $this->clinicService->audit($request->user(), 'update', $doctor, 'Updated doctor profile.');
        return $this->item($doctor->fresh()->load(['user', 'specialty', 'workingHours']));
    }

    public function deleteDoctor(Request $request, Doctor $doctor): JsonResponse
    {
        abort_unless($request->user()->role === 'admin', 403);
        abort_if($doctor->appointments()->whereDate('appointment_date', '>=', today())->where('status', '!=', 'cancelled')->exists(), 409, 'Doctor has future appointments.');
        $doctor->delete(); $doctor->user->update(['status' => 'inactive']);
        $this->clinicService->audit($request->user(), 'delete', $doctor, 'Deactivated doctor.');
        return ApiResponse::success(message: 'Doctor deactivated.');
    }

    public function uploadDoctorPhoto(Request $request, Doctor $doctor): JsonResponse
    {
        abort_unless($request->user()->role === 'admin' || $request->user()->doctor?->is($doctor), 403);
        $request->validate(['photo' => ['required', 'image', 'max:5120']]);
        if ($doctor->photo_path) { Storage::disk('public')->delete($doctor->photo_path); }
        $doctor->update(['photo_path' => $request->file('photo')->store('doctor-photos', 'public')]);
        return $this->item($doctor->fresh()->load(['user', 'specialty', 'workingHours']));
    }

    public function availability(Request $request, Doctor $doctor): JsonResponse
    {
        $data = $request->validate(['date' => ['required', 'date']]); $date = $data['date'];
        $doctor->load('workingHours'); $exception = ScheduleException::query()->where('doctor_id', $doctor->id)->whereDate('exception_date', $date)->first();
        $hours = $exception ?: $doctor->workingHours->firstWhere('weekday', \Carbon\Carbon::parse($date)->dayOfWeek);
        $onLeave = Leave::query()->where('doctor_id', $doctor->id)->where('status', 'approved')->whereDate('starts_on', '<=', $date)->whereDate('ends_on', '>=', $date)->exists();
        if (! $hours || $onLeave) { return ApiResponse::success(['date' => $date, 'slots' => []]); }
        $booked = Appointment::query()->where('doctor_id', $doctor->id)->whereDate('appointment_date', $date)->where('status', '!=', 'cancelled')->pluck('starts_at')->map(fn ($time) => substr($time, 0, 5))->all();
        $slots = []; $time = \Carbon\Carbon::createFromFormat('H:i:s', $hours->starts_at); $end = \Carbon\Carbon::createFromFormat('H:i:s', $hours->ends_at);
        while ($time->lt($end)) { if (! in_array($time->format('H:i'), $booked, true)) { $slots[] = $time->format('H:i'); } $time->addMinutes(20); }
        return ApiResponse::success(['date' => $date, 'slots' => $slots]);
    }

    public function patients(Request $request): JsonResponse
    {
        $query = Patient::query()->with('user');
        if ($request->user()->role === 'patient') { $query->where('id', $request->user()->patient?->id); }
        elseif ($term = $request->string('query')->trim()->value()) { $query->where(fn ($q) => $q->where('phone', 'like', "%{$term}%")->orWhere('national_id', 'like', "%{$term}%")->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$term}%"))); }
        return $this->collection($query->get());
    }

    public function patient(Request $request, Patient $patient): JsonResponse { $this->authorize('view', $patient); return $this->item($patient->load('user')); }

    public function storePatient(StorePatientRequest $request): JsonResponse
    {
        $data = $request->validated();
        if (! $request->user()) {
            $request->validate([
                'email' => ['required', 'email', 'unique:users,email'],
                'password' => ['required', 'string', 'min:8'],
            ]);
        }
        $patient = DB::transaction(function () use ($data) {
            $user = User::query()->create(['name' => $data['name'], 'email' => $data['email'] ?? 'patient-'.uniqid().'@local.invalid', 'phone' => $data['phone'], 'password' => $data['password'] ?? 'ChangeMe123!', 'role' => 'patient', 'status' => 'active']);
            return Patient::query()->create(['user_id' => $user->id, 'date_of_birth' => $data['dob'] ?? null, 'gender' => $data['gender'] ?? null, 'national_id' => $data['nationalId'] ?? null, 'phone' => $data['phone'], 'address' => $data['address'] ?? null, 'emergency_contact_name' => $data['emergency'] ?? null, 'blood_type' => $data['blood'] ?? null, 'allergies' => $data['allergies'] ?? null, 'chronic_conditions' => $data['chronic'] ?? null, 'first_visit_at' => today(), 'consent_accepted_at' => now()]);
        });
        if ($request->user()) { $this->clinicService->audit($request->user(), 'create', $patient, 'Created patient account.'); }
        return $this->item($patient->load('user'), 201);
    }

    public function updatePatient(Request $request, Patient $patient): JsonResponse
    {
        $this->authorize('update', $patient); $data = $request->validate(['name' => ['sometimes', 'string'], 'email' => ['sometimes', 'email'], 'dob' => ['sometimes', 'nullable', 'date'], 'gender' => ['sometimes', 'nullable', 'string'], 'nationalId' => ['sometimes', 'nullable', 'string'], 'phone' => ['sometimes', 'string'], 'address' => ['sometimes', 'nullable', 'string'], 'emergency' => ['sometimes', 'nullable', 'string'], 'blood' => ['sometimes', 'nullable', 'string'], 'allergies' => ['sometimes', 'nullable', 'string'], 'chronic' => ['sometimes', 'nullable', 'string']]);
        $patient->user->update(array_filter(['name' => $data['name'] ?? null, 'email' => $data['email'] ?? null, 'phone' => $data['phone'] ?? null], fn ($v) => $v !== null));
        $patient->update(array_filter(['date_of_birth' => $data['dob'] ?? null, 'gender' => $data['gender'] ?? null, 'national_id' => $data['nationalId'] ?? null, 'phone' => $data['phone'] ?? null, 'address' => $data['address'] ?? null, 'emergency_contact_name' => $data['emergency'] ?? null, 'blood_type' => $data['blood'] ?? null, 'allergies' => $data['allergies'] ?? null, 'chronic_conditions' => $data['chronic'] ?? null], fn ($v) => $v !== null));
        return $this->item($patient->fresh()->load('user'));
    }

    public function appointments(Request $request): JsonResponse
    {
        $query = Appointment::query(); $user = $request->user();
        if ($user->role === 'doctor') { $query->where('doctor_id', $user->doctor?->id); } elseif ($user->role === 'patient') { $query->where('patient_id', $user->patient?->id); } else { foreach (['doctorId' => 'doctor_id', 'patientId' => 'patient_id', 'date' => 'appointment_date'] as $input => $column) { if ($request->filled($input)) { $query->where($column, $request->input($input)); } } }
        return $this->collection($query->orderBy('appointment_date')->orderBy('starts_at')->get());
    }

    public function storeAppointment(StoreAppointmentRequest $request): JsonResponse
    {
        $data = $request->validated(); $user = $request->user();
        if ($user->role === 'patient') { abort_unless($user->patient?->id === (int) $data['patientId'], 403); }
        $appointment = $this->clinicService->createAppointment(['patient_id' => $data['patientId'], 'doctor_id' => $data['doctorId'], 'appointment_date' => $data['date'], 'starts_at' => $data['time'], 'duration_minutes' => $data['duration'] ?? 20, 'type' => $data['type'], 'notes' => $data['notes'] ?? null], $user);
        $this->clinicService->audit($user, 'create', $appointment, 'Created appointment.'); return $this->item($appointment, 201);
    }

    public function updateAppointmentStatus(Request $request, Appointment $appointment): JsonResponse
    {
        $data = $request->validate(['status' => ['required', 'in:booked,confirmed,completed,cancelled,no-show'], 'reason' => ['nullable', 'string']]);
        $user = $request->user();
        abort_unless($user->role === 'admin' || $user->role === 'reception' || ($user->role === 'doctor' && $user->doctor?->id === $appointment->doctor_id) || ($user->role === 'patient' && $user->patient?->id === $appointment->patient_id && in_array($data['status'], ['cancelled'], true) && in_array($appointment->status, ['booked', 'confirmed'], true)), 403);
        
        $oldStatus = $appointment->status;
        $appointment->update(['status' => $data['status']]);

        if ($oldStatus !== $data['status']) {
            $appointment->refresh();
            $recipients = collect([
                $appointment->patient?->user,
                $appointment->doctor?->user,
                $appointment->bookedByUser,
            ])->filter()->unique('id')->values();

            foreach ($recipients as $targetUser) {
                \App\Models\Notification::query()->create([
                    'type' => 'appointment_status_updated',
                    'appointment_id' => $appointment->id,
                    'recipient_user_id' => $targetUser->id,
                    'title' => 'تحديث حالة الموعد',
                    'body' => $targetUser->role === 'patient'
                        ? "تم تحديث حالة موعدك مع د. {$appointment->doctor->user->name} إلى {$appointment->status}."
                        : "تم تحديث حالة موعد المريض {$appointment->patient->user->name} إلى {$appointment->status}.",
                    'channel' => 'in_app',
                    'status' => 'sent',
                    'sent_at' => now(),
                ]);
            }
        }
        
        if ($data['status'] === 'cancelled' && $oldStatus !== 'cancelled') {
            \App\Events\AppointmentCancelled::dispatch($appointment->load(['patient', 'doctor.user']), $data['reason'] ?? null);
        }
        
        $this->clinicService->audit($user, 'update', $appointment, 'Updated appointment status.');
        return $this->item($appointment);
    }

    public function medicalRecords(Request $request): JsonResponse
    {
        $this->authorize('viewAny', MedicalRecord::class); $query = MedicalRecord::query()->with('medications'); $user = $request->user();
        if ($user->role === 'doctor') { $query->where('doctor_id', $user->doctor?->id); } elseif ($user->role === 'patient') { $query->where('patient_id', $user->patient?->id); } else { foreach (['patientId' => 'patient_id', 'doctorId' => 'doctor_id', 'appointmentId' => 'appointment_id'] as $input => $column) { if ($request->filled($input)) { $query->where($column, $request->input($input)); } } }
        return $this->collection($query->get());
    }

    public function storeMedicalRecord(StoreMedicalRecordRequest $request): JsonResponse
    {
        $data = $request->validated(); $user = $request->user(); abort_unless($user->role === 'admin' || $user->doctor?->id === (int) $data['doctorId'], 403);
        $record = DB::transaction(function () use ($data) { $record = MedicalRecord::query()->create(['appointment_id' => $data['appointmentId'], 'patient_id' => $data['patientId'], 'doctor_id' => $data['doctorId'], 'record_date' => today(), 'complaint' => $data['complaint'] ?? null, 'exam' => $data['exam'] ?? null, 'diagnosis' => $data['diagnosis'] ?? null, 'notes' => $data['notes'] ?? null, 'labs' => $data['labs'] ?? null]); foreach ($data['medications'] ?? [] as $medication) { $record->medications()->create(['name' => $medication['name'], 'dose' => $medication['dose'] ?? null, 'frequency' => $medication['freq'] ?? null, 'duration' => $medication['duration'] ?? null]); } $record->appointment()->update(['status' => 'completed']); return $record; });
        $this->clinicService->audit($user, 'create', $record, 'Created medical record.'); return $this->item($record->load('medications'), 201);
    }

    public function updateMedicalRecord(Request $request, MedicalRecord $medicalRecord): JsonResponse
    {
        $this->authorize('update', $medicalRecord); $data = $request->validate(['complaint' => ['sometimes', 'nullable', 'string'], 'exam' => ['sometimes', 'nullable', 'string'], 'diagnosis' => ['sometimes', 'nullable', 'string'], 'notes' => ['sometimes', 'nullable', 'string'], 'labs' => ['sometimes', 'nullable', 'string'], 'medications' => ['sometimes', 'array']]);
        DB::transaction(function () use ($data, $medicalRecord) { $medicalRecord->update(collect($data)->except('medications')->all()); if (array_key_exists('medications', $data)) { $medicalRecord->medications()->delete(); foreach ($data['medications'] as $medication) { $medicalRecord->medications()->create(['name' => $medication['name'], 'dose' => $medication['dose'] ?? null, 'frequency' => $medication['freq'] ?? null, 'duration' => $medication['duration'] ?? null]); } } });
        return $this->item($medicalRecord->fresh()->load('medications'));
    }

    public function invoices(Request $request): JsonResponse
    {
        $query = Invoice::query()->with(['items', 'paymentProofs']); $user = $request->user();
        if ($user->role === 'patient') { $query->where('patient_id', $user->patient?->id); } else { if ($request->filled('patientId')) { $query->where('patient_id', $request->input('patientId')); } if ($request->filled('status') && $request->input('status') !== 'all') { $query->where('status', $request->input('status')); } }
        return $this->collection($query->latest('issued_at')->get());
    }

    public function storeInvoice(Request $request): JsonResponse
    {
        abort_unless(in_array($request->user()->role, ['admin', 'reception'], true), 403); $data = $request->validate(['patientId' => ['required', 'exists:patients,id'], 'appointmentId' => ['nullable', 'exists:appointments,id'], 'services' => ['required', 'array', 'min:1'], 'services.*.name' => ['required', 'string'], 'services.*.price' => ['required', 'numeric', 'min:0'], 'method' => ['nullable', 'string']]);
        $invoice = DB::transaction(function () use ($data) { $invoice = Invoice::query()->create(['patient_id' => $data['patientId'], 'appointment_id' => $data['appointmentId'] ?? null, 'total' => collect($data['services'])->sum('price'), 'payment_method' => $data['method'] ?? null, 'issued_at' => now()]); foreach ($data['services'] as $service) { $invoice->items()->create(['name' => $service['name'], 'unit_price' => $service['price']]); } return $invoice; });
        $this->clinicService->audit($request->user(), 'create', $invoice, 'Created invoice.'); return $this->item($invoice->load(['items', 'paymentProofs']), 201);
    }

    public function markInvoicePaid(Request $request, Invoice $invoice): JsonResponse
    {
        abort_unless(in_array($request->user()->role, ['admin', 'reception'], true), 403); abort_if($invoice->status === 'awaiting_verification', 422, 'Use payment proof review.'); $invoice->update(['status' => 'paid']); $this->clinicService->audit($request->user(), 'update', $invoice, 'Marked invoice paid.'); return $this->item($invoice->load(['items', 'paymentProofs']));
    }

    public function uploadPaymentProof(Request $request, Invoice $invoice): JsonResponse
    {
        abort_unless($request->user()->role === 'patient' && $request->user()->patient?->id === $invoice->patient_id, 403); $request->validate(['proof' => ['required', 'image', 'max:5120']]); $path = $request->file('proof')->store('payment-proofs', 'public'); $invoice->paymentProofs()->create(['storage_disk' => 'public', 'path' => $path, 'original_filename' => $request->file('proof')->getClientOriginalName(), 'mime_type' => $request->file('proof')->getMimeType(), 'size_bytes' => $request->file('proof')->getSize(), 'uploaded_by_user_id' => $request->user()->id]); $invoice->update(['status' => 'awaiting_verification', 'payment_method' => 'transfer']); return $this->item($invoice->fresh()->load(['items', 'paymentProofs']));
    }

    public function reviewPaymentProof(Request $request, Invoice $invoice, string $decision): JsonResponse
    {
        abort_unless(in_array($request->user()->role, ['admin', 'reception'], true), 403); abort_unless(in_array($decision, ['confirm', 'reject'], true), 404); $proof = $invoice->paymentProofs()->latest()->firstOrFail(); $proof->update(['reviewed_by_user_id' => $request->user()->id, 'reviewed_at' => now(), 'rejection_reason' => $decision === 'reject' ? $request->input('reason') : null]); $invoice->update(['status' => $decision === 'confirm' ? 'paid' : 'pending']); return $this->item($invoice->fresh()->load(['items', 'paymentProofs']));
    }

    public function services(): JsonResponse { return $this->collection(ServiceCatalogItem::query()->with('specialty')->get()); }
    public function storeService(Request $request): JsonResponse { abort_unless($request->user()->role === 'admin', 403); $data = $request->validate(['name' => ['required', 'string'], 'specialtyKey' => ['nullable', 'exists:specialties,key'], 'price' => ['required', 'numeric', 'min:0']]); $service = ServiceCatalogItem::query()->create(['name' => $data['name'], 'specialty_id' => Specialty::query()->where('key', $data['specialtyKey'] ?? null)->value('id'), 'price' => $data['price']]); return $this->item($service->load('specialty'), 201); }
    public function updateService(Request $request, ServiceCatalogItem $serviceCatalogItem): JsonResponse { abort_unless($request->user()->role === 'admin', 403); $data = $request->validate(['name' => ['sometimes', 'string'], 'specialtyKey' => ['sometimes', 'nullable', 'exists:specialties,key'], 'price' => ['sometimes', 'numeric', 'min:0']]); $serviceCatalogItem->update(array_filter(['name' => $data['name'] ?? null, 'specialty_id' => array_key_exists('specialtyKey', $data) ? Specialty::query()->where('key', $data['specialtyKey'])->value('id') : null, 'price' => $data['price'] ?? null], fn ($v) => $v !== null)); return $this->item($serviceCatalogItem->fresh()->load('specialty')); }
    public function deleteService(Request $request, ServiceCatalogItem $serviceCatalogItem): JsonResponse { abort_unless($request->user()->role === 'admin', 403); $serviceCatalogItem->delete(); return ApiResponse::success(message: 'Service deleted.'); }

    public function users(Request $request): JsonResponse { abort_unless($request->user()->role === 'admin', 403); return $this->collection(User::query()->with('doctor')->whereIn('role', ['admin', 'reception', 'doctor'])->get()); }
    public function storeUser(Request $request): JsonResponse { abort_unless($request->user()->role === 'admin', 403); $data = $request->validate(['name' => ['required', 'string'], 'email' => ['required', 'email', 'unique:users,email'], 'password' => ['required', 'string', 'min:8'], 'role' => ['required', 'in:admin,reception']]); return $this->item(User::query()->create([...$data, 'status' => 'active']), 201); }
    public function updateUser(Request $request, User $user): JsonResponse { abort_unless($request->user()->role === 'admin' || $request->user()->is($user), 403); $data = $request->validate(['name' => ['sometimes', 'string'], 'email' => ['sometimes', 'email', 'unique:users,email,'.$user->id], 'status' => ['sometimes', 'in:active,inactive']]); if ($user->role === 'admin' && ($data['status'] ?? 'active') === 'inactive' && User::query()->where('role', 'admin')->where('status', 'active')->count() <= 1) { abort(422, 'The last admin cannot be deactivated.'); } $user->update($data); return $this->item($user->fresh()->load('doctor')); }
    public function deleteUser(Request $request, User $user): JsonResponse { abort_unless($request->user()->role === 'admin', 403); abort_if($user->role === 'admin' && User::query()->where('role', 'admin')->where('status', 'active')->count() <= 1, 422, 'The last admin cannot be deleted.'); $user->delete(); return ApiResponse::success(message: 'User deleted.'); }

    public function leaves(Request $request): JsonResponse { $query = Leave::query(); if ($request->user()->role === 'doctor') { $query->where('doctor_id', $request->user()->doctor?->id); } elseif ($request->filled('doctorId')) { $query->where('doctor_id', $request->input('doctorId')); } if ($request->filled('status')) { $query->where('status', $request->input('status')); } return $this->collection($query->get()); }
    public function storeLeave(Request $request): JsonResponse { abort_unless($request->user()->role === 'doctor', 403); $data = $request->validate(['from' => ['required', 'date'], 'to' => ['required', 'date', 'after_or_equal:from'], 'reason' => ['nullable', 'string']]); return $this->item(Leave::query()->create(['doctor_id' => $request->user()->doctor->id, 'starts_on' => $data['from'], 'ends_on' => $data['to'], 'reason' => $data['reason'] ?? null, 'status' => 'pending']), 201); }
    public function updateLeave(Request $request, Leave $leave): JsonResponse { abort_unless(in_array($request->user()->role, ['admin', 'reception'], true), 403); $data = $request->validate(['status' => ['required', 'in:approved,rejected']]); $leave->update(['status' => $data['status'], 'reviewed_by_user_id' => $request->user()->id, 'reviewed_at' => now()]); return $this->item($leave); }

    public function exceptions(Request $request): JsonResponse { $query = ScheduleException::query(); if ($request->user()->role === 'doctor') { $query->where('doctor_id', $request->user()->doctor?->id); } elseif ($request->filled('doctorId')) { $query->where('doctor_id', $request->input('doctorId')); } return $this->collection($query->get()); }
    public function storeException(Request $request): JsonResponse { abort_unless($request->user()->role === 'doctor', 403); $data = $request->validate(['date' => ['required', 'date'], 'from' => ['required', 'date_format:H:i'], 'to' => ['required', 'date_format:H:i', 'after:from'], 'note' => ['nullable', 'string']]); $exception = ScheduleException::query()->updateOrCreate(['doctor_id' => $request->user()->doctor->id, 'exception_date' => $data['date']], ['starts_at' => $data['from'], 'ends_at' => $data['to'], 'note' => $data['note'] ?? null]); return $this->item($exception); }
    public function deleteException(Request $request, ScheduleException $scheduleException): JsonResponse { abort_unless($request->user()->role === 'admin' || $request->user()->doctor?->id === $scheduleException->doctor_id, 403); $scheduleException->delete(); return ApiResponse::success(message: 'Schedule exception deleted.'); }

    public function notifications(Request $request): JsonResponse
    {
        $query = Notification::query()->orderByDesc('sent_at');
        $user = $request->user();

        // Admin can see all notifications; others see only their own
        if ($user->role === 'admin') {
            if ($request->filled('recipientId')) {
                $query->where('recipient_user_id', $request->input('recipientId'));
            }
        } else {
            $query->where('recipient_user_id', $user->id);
        }

        return $this->collection($query->get());
    }

    public function readNotification(Request $request, Notification $notification): JsonResponse { abort_unless($request->user()->role === 'admin' || $notification->recipient_user_id === $request->user()->id, 403); $notification->update(['read_at' => now()]); return $this->item($notification); }
    public function readAllNotifications(Request $request): JsonResponse { $query = Notification::query(); if ($request->user()->role !== 'admin') { $query->where('recipient_user_id', $request->user()->id); } $query->update(['read_at' => now()]); return ApiResponse::success(message: 'Notifications marked read.'); }
    public function deleteNotification(Request $request, Notification $notification): JsonResponse { abort_unless($request->user()->role === 'admin' || $notification->recipient_user_id === $request->user()->id, 403); $notification->delete(); return ApiResponse::success(message: 'Notification deleted.'); }
    public function clearNotifications(Request $request): JsonResponse { $query = Notification::query(); if ($request->user()->role !== 'admin') { $query->where('recipient_user_id', $request->user()->id); } $query->delete(); return ApiResponse::success(message: 'Notifications cleared.'); }

    public function auditLog(Request $request): JsonResponse { abort_unless($request->user()->role === 'admin', 403); return $this->collection(AuditLog::query()->with('actorUser')->latest('occurred_at')->get()); }
    public function settings(): JsonResponse { return $this->item(ClinicSetting::query()->firstOrCreate(['id' => 1], ['name' => 'Al Noor Specialized Clinics'])); }
    public function updateSettings(Request $request): JsonResponse { abort_unless($request->user()->role === 'admin', 403); $data = $request->validate(['name' => ['sometimes', 'string'], 'address' => ['sometimes', 'nullable', 'string'], 'phone' => ['sometimes', 'nullable', 'string'], 'whatsapp' => ['sometimes', 'nullable', 'string'], 'paymentNumber' => ['sometimes', 'nullable', 'string'], 'hours' => ['sometimes', 'nullable', 'array']]); $settings = ClinicSetting::query()->firstOrCreate(['id' => 1], ['name' => 'Al Noor Specialized Clinics']); $settings->update(['name' => $data['name'] ?? $settings->name, 'address' => $data['address'] ?? $settings->address, 'phone' => $data['phone'] ?? $settings->phone, 'whatsapp' => $data['whatsapp'] ?? $settings->whatsapp, 'transfer_receiving_number' => $data['paymentNumber'] ?? $settings->transfer_receiving_number, 'hours' => $data['hours'] ?? $settings->hours]); return $this->item($settings); }

    public function dashboard(Request $request): JsonResponse { $user = $request->user(); abort_unless(in_array($user->role, ['admin', 'reception'], true), 403); $invoices = Invoice::query()->where('status', 'paid'); return ApiResponse::success(['appointments' => Appointment::count(), 'patients' => Patient::count(), 'doctors' => Doctor::count(), 'revenue' => (float) $invoices->sum('total'), 'revenueTrend' => $invoices->selectRaw('date(issued_at) as date, sum(total) as total')->groupBy('date')->orderBy('date')->get()->map(fn ($row) => ['date' => $row->date, 'total' => (float) $row->total])]); }

    private function syncWorkingHours(Doctor $doctor, array $schedule): void { $days = ['الأحد' => 0, 'الاثنين' => 1, 'الثلاثاء' => 2, 'الأربعاء' => 3, 'الخميس' => 4, 'الجمعة' => 5, 'السبت' => 6]; $doctor->workingHours()->delete(); foreach ($schedule as $day => $range) { if (isset($days[$day])) { $doctor->workingHours()->create(['weekday' => $days[$day], 'starts_at' => $range[0], 'ends_at' => $range[1]]); } } }
    private function item(mixed $model, int $status = 200): JsonResponse { return ApiResponse::success(new ClinicResource($model), status: $status); }
    private function collection(mixed $models): JsonResponse { return ApiResponse::success(ClinicResource::collection($models)); }
}
