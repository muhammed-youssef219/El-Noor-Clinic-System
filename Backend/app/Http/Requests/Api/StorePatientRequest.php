<?php

namespace App\Http\Requests\Api;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePatientRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() === null || in_array($this->user()->role, ['admin', 'reception'], true);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'], 'email' => ['nullable', 'email', 'max:255'], 'password' => ['nullable', 'string', 'min:8'],
            'dob' => ['nullable', 'date'], 'gender' => ['nullable', 'string', 'max:20'], 'nationalId' => ['nullable', 'string', 'max:255'], 'phone' => ['required', 'string', 'max:30'],
            'address' => ['nullable', 'string'], 'emergency' => ['nullable', 'string'], 'blood' => ['nullable', 'string', 'max:10'], 'allergies' => ['nullable', 'string'], 'chronic' => ['nullable', 'string'], 'consent' => ['required', 'accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'اسم المريض بالكامل مطلوب.',
            'phone.required' => 'رقم الهاتف للتأكيد مطلوب.',
            'consent.accepted' => 'يجب الموافقة على الشروط وسياسة الخصوصية.',
            'email.email' => 'صيغة البريد الإلكتروني غير صحيحة.',
            'password.min' => 'كلمة المرور يجب ألا تقل عن 8 أحرف.',
            'dob.date' => 'تاريخ الميلاد غير صالح.',
        ];
    }
}

