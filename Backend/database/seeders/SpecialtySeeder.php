<?php

namespace Database\Seeders;

use App\Models\Specialty;
use Illuminate\Database\Seeder;

class SpecialtySeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            'cardiology' => 'Cardiology',
            'dermatology' => 'Dermatology',
            'general' => 'General Medicine',
            'dental' => 'Dental',
            'obgyn' => 'Obstetrics and Gynecology',
            'orthopedics' => 'Orthopedics',
            'pediatrics' => 'Pediatrics',
            'ophthalmology' => 'Ophthalmology',
        ] as $key => $name) {
            Specialty::query()->updateOrCreate(['key' => $key], ['name' => $name]);
        }
    }
}
