<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['appointment_id', 'patient_id', 'doctor_id', 'record_date', 'complaint', 'exam', 'diagnosis', 'notes', 'labs'])]
class MedicalRecord extends Model
{
    use HasFactory;

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function medications(): HasMany
    {
        return $this->hasMany(MedicalRecordMedication::class);
    }

    protected function casts(): array
    {
        return [
            'record_date' => 'date',
        ];
    }
}