<?php

namespace App\Http\Requests\Api;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreAppointmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['admin', 'reception', 'patient'], true);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'patientId' => ['required', 'integer', 'exists:patients,id'], 'doctorId' => ['required', 'integer', 'exists:doctors,id'], 'date' => ['required', 'date'], 'time' => ['required', 'date_format:H:i'],
            'duration' => ['nullable', 'integer', 'min:5', 'max:240'], 'type' => ['required', 'string', 'max:30'], 'notes' => ['nullable', 'string'],
        ];
    }
}
