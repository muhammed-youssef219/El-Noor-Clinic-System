<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\DoctorWorkingHour;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\ServiceCatalogItem;
use App\Models\Specialty;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->firstOrCreate(
            ['email' => 'admin@alnoor.test'],
            ['name' => 'مدير عيادات النور', 'phone' => '01000000001', 'password' => 'Password123!', 'role' => 'admin', 'status' => 'active'],
        );

        $reception = User::query()->firstOrCreate(
            ['email' => 'reception@alnoor.test'],
            ['name' => 'سارة أحمد', 'phone' => '01000000002', 'password' => 'Password123!', 'role' => 'reception', 'status' => 'active'],
        );

        $doctorDefinitions = [
            ['email' => 'dr.noura@alnoor.test', 'name' => 'د. نورا خالد', 'phone' => '01000000011', 'specialty' => 'cardiology', 'license' => 'CARD-1024', 'experience' => 12, 'price' => 550],
            ['email' => 'dr.omar@alnoor.test', 'name' => 'د. عمر سامي', 'phone' => '01000000012', 'specialty' => 'dermatology', 'license' => 'DERM-2048', 'experience' => 9, 'price' => 450],
            ['email' => 'dr.laila@alnoor.test', 'name' => 'د. ليلى حسن', 'phone' => '01000000013', 'specialty' => 'pediatrics', 'license' => 'PED-4096', 'experience' => 11, 'price' => 400],
        ];

        $doctors = collect($doctorDefinitions)->map(function (array $definition) {
            $user = User::query()->firstOrCreate(
                ['email' => $definition['email']],
                ['name' => $definition['name'], 'phone' => $definition['phone'], 'password' => 'Password123!', 'role' => 'doctor', 'status' => 'active'],
            );
            $doctor = Doctor::query()->updateOrCreate(
                ['user_id' => $user->id],
                ['specialty_id' => Specialty::query()->where('key', $definition['specialty'])->value('id'), 'license' => $definition['license'], 'experience_years' => $definition['experience'], 'bio' => 'طبيب متخصص ضمن فريق عيادات النور.', 'new_visit_price' => $definition['price'], 'follow_up_price' => $definition['price'] * 0.7, 'rating' => 4.8],
            );
            foreach (range(0, 4) as $weekday) {
                DoctorWorkingHour::query()->updateOrCreate(['doctor_id' => $doctor->id, 'weekday' => $weekday], ['starts_at' => '10:00', 'ends_at' => '18:00']);
            }

            return $doctor;
        })->values();

        $serviceDefinitions = [
            ['name' => 'كشف باطنة جديد', 'specialty' => 'general', 'price' => 250],
            ['name' => 'كشف باطنة متابعة', 'specialty' => 'general', 'price' => 150],
            ['name' => 'كشف جلدية جديد', 'specialty' => 'dermatology', 'price' => 300],
            ['name' => 'جلسة ليزر', 'specialty' => 'dermatology', 'price' => 450],
            ['name' => 'حشو أسنان', 'specialty' => 'dental', 'price' => 350],
            ['name' => 'تنظيف أسنان', 'specialty' => 'dental', 'price' => 200],
            ['name' => 'متابعة حمل', 'specialty' => 'obgyn', 'price' => 200],
            ['name' => 'سونار حمل', 'specialty' => 'obgyn', 'price' => 250],
            ['name' => 'تخطيط قلب', 'specialty' => 'cardiology', 'price' => 120],
            ['name' => 'إيكو قلب', 'specialty' => 'cardiology', 'price' => 400],
        ];

        foreach ($serviceDefinitions as $definition) {
            ServiceCatalogItem::query()->updateOrCreate(
                ['name' => $definition['name']],
                ['specialty_id' => Specialty::query()->where('key', $definition['specialty'])->value('id'), 'price' => $definition['price']],
            );
        }

        $patientDefinitions = [
            ['email' => 'mariam.ali@alnoor.test', 'name' => 'مريم علي', 'phone' => '01000000101', 'nationalId' => '29801011234567', 'gender' => 'أنثى'],
            ['email' => 'ahmed.mahmoud@alnoor.test', 'name' => 'أحمد محمود', 'phone' => '01000000102', 'nationalId' => '29405011234568', 'gender' => 'ذكر'],
            ['email' => 'salma.fathy@alnoor.test', 'name' => 'سلمى فتحي', 'phone' => '01000000103', 'nationalId' => '30007011234569', 'gender' => 'أنثى'],
            ['email' => 'youssef.adel@alnoor.test', 'name' => 'يوسف عادل', 'phone' => '01000000104', 'nationalId' => '29203011234570', 'gender' => 'ذكر'],
        ];

        $patients = collect($patientDefinitions)->map(function (array $definition) {
            $user = User::query()->firstOrCreate(
                ['email' => $definition['email']],
                ['name' => $definition['name'], 'phone' => $definition['phone'], 'password' => 'Password123!', 'role' => 'patient', 'status' => 'active'],
            );

            return Patient::query()->updateOrCreate(
                ['user_id' => $user->id],
                ['date_of_birth' => '1995-01-01', 'gender' => $definition['gender'], 'national_id' => $definition['nationalId'], 'phone' => $definition['phone'], 'address' => 'القاهرة، مصر', 'blood_type' => 'O+', 'allergies' => 'لا يوجد', 'chronic_conditions' => 'لا يوجد', 'first_visit_at' => today()->subMonths(3), 'consent_accepted_at' => now()],
            );
        })->values();

        $appointments = [
            [$patients[0], $doctors[0], today(), '10:00', 'confirmed'],
            [$patients[1], $doctors[1], today(), '11:00', 'booked'],
            [$patients[2], $doctors[2], today()->addDay(), '12:00', 'confirmed'],
            [$patients[3], $doctors[0], today()->addDays(2), '14:00', 'booked'],
        ];

        foreach ($appointments as [$patient, $doctor, $date, $time, $status]) {
            $appointment = Appointment::query()->updateOrCreate(
                ['patient_id' => $patient->id, 'doctor_id' => $doctor->id, 'appointment_date' => $date->toDateString(), 'starts_at' => $time],
                ['duration_minutes' => 20, 'type' => 'كشف جديد', 'status' => $status, 'notes' => 'موعد تجريبي', 'booked_by' => 'reception', 'booked_by_user_id' => $reception->id],
            );
            if ($status === 'confirmed') {
                $invoice = Invoice::query()->updateOrCreate(
                    ['appointment_id' => $appointment->id],
                    ['patient_id' => $patient->id, 'total' => $doctor->new_visit_price, 'payment_method' => 'cash', 'status' => 'paid', 'issued_at' => now()],
                );
                $invoice->items()->updateOrCreate(['name' => 'كشف طبي'], ['unit_price' => $doctor->new_visit_price]);
            }
        }
    }
}
