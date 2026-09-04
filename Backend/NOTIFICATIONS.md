# Email & SMS Notifications System

نظام الإشعارات الشامل لمواعيد العيادة - بريد إلكتروني و SMS

## المميزات

✅ **إشعارات البريد الإلكتروني**
- تأكيد الموعد الطبي
- تذكير بالموعد (يوم واحد قبل)
- إلغاء الموعد مع السبب

✅ **إشعارات SMS (Twilio)**
- تأكيد الموعد عبر رسالة نصية
- إشعار بإلغاء الموعد

✅ **نظام الأحداث والـ Listeners**
- AppointmentCreated → يُرسل بريد وSMS للمريض والطبيب
- AppointmentCancelled → يُرسل بريد وSMS بسبب الإلغاء
- AppointmentReminderNeeded → تذكير يوم واحد قبل الموعد

## الإعدادات المطلوبة

### البريد الإلكتروني

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_FROM_ADDRESS=noreply@alnoor-clinic.com
MAIL_FROM_NAME="عيادات النور"
```

### SMS (Twilio - اختياري)

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+201234567890
```

## هيكل النظام

### Events (الأحداث)
- `App\Events\AppointmentCreated` - عند إنشاء موعد
- `App\Events\AppointmentCancelled` - عند إلغاء موعد
- `App\Events\AppointmentReminderNeeded` - للتذكيرات

### Listeners (المستمعون)
- `SendAppointmentConfirmationEmail` - بريد التأكيد
- `SendAppointmentCancellationEmail` - بريد الإلغاء
- `SendAppointmentConfirmationSms` - SMS التأكيد
- `SendAppointmentCancellationSms` - SMS الإلغاء

### Email Templates
- `resources/views/emails/appointment-confirmed.blade.php`
- `resources/views/emails/appointment-reminder.blade.php`
- `resources/views/emails/appointment-cancelled.blade.php`

### Services
- `App\Services\SmsNotificationService` - خدمة إرسال SMS

## كيفية الاستخدام

### تفعيل الإشعارات

عند إنشاء موعد:
```php
$appointment = $this->clinicService->createAppointment([
    'patient_id' => $data['patientId'],
    'doctor_id' => $data['doctorId'],
    'appointment_date' => $data['date'],
    'starts_at' => $data['time'],
    'type' => $data['type'],
], $user);
// تُرسل الإشعارات تلقائياً عند الإنشاء
```

عند إلغاء موعد:
```php
$appointment->update(['status' => 'cancelled']);
AppointmentCancelled::dispatch($appointment, 'Doctor unavailable');
// تُرسل الإشعارات تلقائياً
```

## قائمة الانتظار (Jobs)

يتم إرسال الإشعارات عبر قائمة الانتظار لتجنب تأخير الطلب:

```php
Mail::queue(new AppointmentConfirmed($appointment));
```

لتشغيل قائمة الانتظار:
```bash
php artisan queue:work database
```

## الاختبارات

تم إنشاء اختبارات شاملة في:
- `tests/Feature/NotificationTest.php` - اختبارات البريد والأحداث
- `tests/Feature/SmsNotificationTest.php` - اختبارات SMS

تشغيل الاختبارات:
```bash
php artisan test tests/Feature/NotificationTest.php
php artisan test tests/Feature/SmsNotificationTest.php
```

## معالجة الأخطاء

- إذا لم تكن بيانات Twilio موجودة، يتم تخطي SMS بهدوء (Log فقط)
- البريد الإلكتروني محفوظ في قائمة الانتظار للضمان
- جميع الأخطاء يتم تسجيلها في `storage/logs/`

## ملاحظات مهمة

✓ البريد والـ SMS يتم إرسالهما للمريض والطبيب
✓ يتم تنسيق أرقام الهاتف المصرية تلقائياً إلى صيغة Twilio (+20)
✓ جميع الرسائل بالعربية
✓ النظام يدعم إعادة المحاولة في حالة الفشل

## التكامل مع الـ API

عند تحديث حالة الموعد:
```bash
PATCH /api/v1/appointments/{id}/status
{
    "status": "cancelled",
    "reason": "Doctor unavailable"  # اختياري
}
```

سيؤدي هذا إلى:
1. تحديث حالة الموعد في قاعدة البيانات
2. إطلاق حدث `AppointmentCancelled`
3. إرسال بريد إلكتروني للمريض والطبيب
4. إرسال رسالة SMS (إذا تم تكوينها)
