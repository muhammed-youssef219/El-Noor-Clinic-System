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
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
            color: #f5576c;
            margin-top: 0;
        }
        .appointment-details {
            background-color: #fff3f3;
            border-right: 4px solid #f5576c;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #f0c0c0;
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 تذكير بموعدك الطبي غداً</h1>
        </div>
        <div class="content">
            <h2>مرحباً {{ $patient->name }},</h2>
            <p>هذا تذكير بأن لديك موعداً طبياً غداً في عيادات النور المتخصصة.</p>
            
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
            
            <p><strong>تذكيرات مهمة:</strong></p>
            <ul>
                <li>تأكد من وجود معك جميع الوثائق المطلوبة</li>
                <li>احرص على الحضور في الوقت المحدد</li>
                <li>إذا كان لديك أي استفسارات، لا تتردد في التواصل معنا</li>
            </ul>
        </div>
        <div class="footer">
            <p>© 2026 عيادات النور المتخصصة | جميع الحقوق محفوظة</p>
            <p>البريد الإلكتروني: info@alnoor-clinic.com | الهاتف: 20+ 1234567890</p>
        </div>
    </div>
</body>
</html>
