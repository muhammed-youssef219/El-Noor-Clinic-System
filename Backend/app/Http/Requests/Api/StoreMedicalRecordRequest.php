<?php

namespace App\Http\Requests\Api;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreMedicalRecordRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['admin', 'doctor'], true);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'appointmentId' => ['required', 'integer', 'exists:appointments,id'], 'patientId' => ['required', 'integer', 'exists:patients,id'], 'doctorId' => ['required', 'integer', 'exists:doctors,id'],
            'complaint' => ['nullable', 'string'], 'exam' => ['nullable', 'string'], 'diagnosis' => ['nullable', 'string'], 'notes' => ['nullable', 'string'], 'labs' => ['nullable', 'string'],
            'medications' => ['nullable', 'array'], 'medications.*.name' => ['required_with:medications', 'string'], 'medications.*.dose' => ['nullable', 'string'], 'medications.*.freq' => ['nullable', 'string'], 'medications.*.duration' => ['nullable', 'string'],
        ];
    }
}
