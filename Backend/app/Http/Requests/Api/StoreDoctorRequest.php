<?php

namespace App\Http\Requests\Api;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreDoctorRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'], 'email' => ['required', 'email', 'max:255'], 'password' => ['nullable', 'string', 'min:8'],
            'specialtyKey' => ['nullable', 'string', 'exists:specialties,key'], 'license' => ['required', 'string', 'max:255'], 'exp' => ['nullable', 'integer', 'min:0'],
            'price' => ['nullable', 'numeric', 'min:0'], 'followUp' => ['nullable', 'numeric', 'min:0'], 'bio' => ['nullable', 'string'],
            'schedule' => ['required', 'array', 'min:1'], 'schedule.*' => ['array:0,1'], 'schedule.*.0' => ['date_format:H:i'], 'schedule.*.1' => ['date_format:H:i'],
        ];
    }
}
