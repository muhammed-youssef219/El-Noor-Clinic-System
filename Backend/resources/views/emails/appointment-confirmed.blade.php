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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
            color: #667eea;
            margin-top: 0;
        }
        .appointment-details {
            background-color: #f5f5f5;
            border-right: 4px solid #667eea;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
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
        .button {
            display: inline-block;
            background-color: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✓ تم تأكيد موعدك الطبي</h1>
        </div>
        <div class="content">
            <h2>مرحباً {{ $patient->name }},</h2>
            <p>تم تأكيد موعدك الطبي بنجاح في عيادات النور المتخصصة.</p>
            
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
            
            <p><strong>نصائح مهمة:</strong></p>
            <ul>
                <li>يرجى الحضور قبل الموعد بـ 10 دقائق</li>
                <li>أحضر معك بطاقتك الشخصية والتأمين إن وجد</li>
                <li>في حالة الحاجة لإلغاء أو تأجيل، تواصل معنا في أقرب وقت</li>
            </ul>
            
            <p>شكراً لاختيارك عيادات النور المتخصصة.</p>
        </div>
        <div class="footer">
            <p>© 2026 عيادات النور المتخصصة | جميع الحقوق محفوظة</p>
            <p>البريد الإلكتروني: info@alnoor-clinic.com | الهاتف: 20+ 1234567890</p>
        </div>
    </div>
</body>
</html>
