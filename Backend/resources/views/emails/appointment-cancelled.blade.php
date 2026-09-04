<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9f9f9;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 30px;
        }
        .content h2 {
            color: #fa709a;
            margin-top: 0;
        }
        .appointment-details {
            background-color: #fff9e6;
            border-right: 4px solid #fa709a;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #ffd699;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-weight: bold;
            color: #555;
            flex: 0 0 120px;
        }
        .detail-value {
            color: #333;
            flex: 1;
        }
        .footer {
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #e0e0e0;
        }
        .warning-box {
            background-color: #ffe6e6;
            border-right: 4px solid #fa709a;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✗ تم إلغاء موعدك الطبي</h1>
        </div>
        <div class="content">
            <h2>مرحباً {{ $patient->name }},</h2>
            <p>نود إبلاغك بأن موعدك الطبي قد تم إلغاؤه.</p>
            
            <div class="appointment-details">
                <div class="detail-row">
                    <span class="detail-label">التاريخ:</span>
                    <span class="detail-value">{{ $appointmentDate }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">الوقت:</span>
                    <span class="detail-value">{{ $appointmentTime }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">الطبيب:</span>
                    <span class="detail-value">{{ $doctor->name }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">نوع الفحص:</span>
                    <span class="detail-value">{{ $appointment->type }}</span>
                </div>
            </div>
            
            @if($reason)
            <div class="warning-box">
                <strong>السبب:</strong>
                <p>{{ $reason }}</p>
            </div>
            @endif
            
            <p>إذا كنت تود حجز موعد آخر أو لديك أي استفسارات، يرجى التواصل معنا مباشرة.</p>
            
            <p><strong>بيانات التواصل:</strong></p>
            <ul>
                <li>الهاتف: 20+ 1234567890</li>
                <li>البريد الإلكتروني: appointments@alnoor-clinic.com</li>
                <li>ساعات العمل: من الأحد للخميس 9 صباحاً إلى 6 مساءً</li>
            </ul>
        </div>
        <div class="footer">
            <p>© 2026 عيادات النور المتخصصة | جميع الحقوق محفوظة</p>
        </div>
    </div>
</body>
</html>
