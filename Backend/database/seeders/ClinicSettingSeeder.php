<?php

namespace Database\Seeders;

use App\Models\ClinicSetting;
use Illuminate\Database\Seeder;

class ClinicSettingSeeder extends Seeder
{
    public function run(): void
    {
        ClinicSetting::query()->firstOrCreate(['id' => 1], [
            'name' => 'Al Noor Specialized Clinics',
        ]);
    }
}