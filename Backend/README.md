# Al Noor Clinic System — Backend API

نظام إدارة عيادات النور — الخادم الخلفي مبني بـ Laravel 13 مع دعم كامل للنشر على Render.

---

## Requirements

### البيئة المحلية
| المكتبة        | الإصدار المطلوب |
|----------------|----------------|
| PHP            | >= 8.3         |
| Composer       | >= 2.x         |
| SQLite         | مدمج مع PHP    |
| Node.js        | >= 18.x        |

### على Render (Production)
| المكتبة    | الإصدار                          |
|------------|----------------------------------|
| PHP        | 8.3 (Docker: php:8.3-cli)        |
| PostgreSQL | 15+ (Render managed DB)          |
| Composer   | 2.x (مثبّت تلقائياً عبر Docker)  |

---

## مكتبات PHP (Composer Dependencies)

### Production
```
laravel/framework   ^13.17   (إطار العمل الأساسي)
laravel/sanctum     ^4.0     (المصادقة عبر API tokens)
laravel/tinker      ^3.0     (CLI للتفاعل مع DB)
```

### Development فقط - لا تُرفع على Render
```
fakerphp/faker          ^1.23   (توليد بيانات وهمية)
laravel/pint            ^1.27   (تنسيق الكود)
phpunit/phpunit         ^12.5   (اختبارات الوحدة)
mockery/mockery         ^1.6    (Mock objects)
nunomaduro/collision    ^8.6    (عرض أخطاء CLI)
```

---

## Docker PHP Extensions المثبّتة

```
pdo_pgsql   الاتصال بقاعدة بيانات PostgreSQL
zip         فك ضغط مكتبات Composer
```

---

## خطوات النشر على Render

### الخطوة 1 - إنشاء قاعدة البيانات PostgreSQL
1. اذهب إلى render.com -> New -> PostgreSQL
2. اختر اسم مثل el-noor-db
3. احفظ: Host, Port (5432), Database, Username, Password

### الخطوة 2 - إنشاء Web Service
1. New -> Web Service -> اربطه بـ GitHub repo
2. الإعدادات:
   - Root Directory: Backend
   - Runtime: Docker
   - Plan: Free
   - Health Check Path: /up

### الخطوة 3 - متغيرات البيئة على Render

```
APP_NAME=Al Noor Specialized Clinics
APP_ENV=production
APP_DEBUG=false
APP_KEY=                    (شغّل: php artisan key:generate --show)
APP_URL=https://your-app.onrender.com
APP_TIMEZONE=Africa/Cairo

LOG_CHANNEL=stderr

DB_CONNECTION=pgsql
DB_HOST=                    (من Render PostgreSQL)
DB_PORT=5432
DB_DATABASE=                (من Render PostgreSQL)
DB_USERNAME=                (من Render PostgreSQL)
DB_PASSWORD=                (من Render PostgreSQL)
DB_SSLMODE=require

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_SECURE_COOKIE=true

CACHE_STORE=database
QUEUE_CONNECTION=database

SANCTUM_EXPIRATION=120
SANCTUM_STATEFUL_DOMAINS=your-frontend.vercel.app
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### الخطوة 4 - توليد APP_KEY
```bash
php artisan key:generate --show
```
انسخ القيمة وضعها في APP_KEY على Render.

### الخطوة 5 - Deploy
Render سيبني Docker image تلقائياً وينفّذ:
```bash
php artisan migrate --force
php artisan db:seed --force
php artisan serve --host=0.0.0.0 --port=10000
```

---

## قاعدة البيانات

### محلياً (SQLite)
```
DB_CONNECTION=sqlite
# الملف: database/database.sqlite
```

### على Render (PostgreSQL)
```
DB_CONNECTION=pgsql
DB_SSLMODE=require
```

---

## الـ Migrations

```bash
php artisan migrate
php artisan migrate:fresh --seed   (محلياً فقط)
```

---

## البيانات التجريبية (Seeders)

```bash
php artisan db:seed
php artisan db:seed --class=DemoDataSeeder
```

### الحسابات بعد الـ Seed

| الدور     | الإيميل                   | الباسورد     |
|-----------|--------------------------|--------------|
| Admin     | admin@alnoor.test        | Password123! |
| Reception | reception@alnoor.test    | Password123! |
| Doctor    | dr.noura@alnoor.test     | Password123! |
| Doctor    | dr.omar@alnoor.test      | Password123! |
| Doctor    | dr.laila@alnoor.test     | Password123! |

---

## API Endpoints - المصادقة

| Endpoint     | Method | الوظيفة          |
|--------------|--------|-----------------|
| /api/login   | POST   | تسجيل الدخول    |
| /api/logout  | POST   | تسجيل الخروج    |
| /api/user    | GET    | المستخدم الحالي |
| /up          | GET    | Health Check    |

---

## أوامر مفيدة

```bash
php artisan serve --port=8000
php artisan route:list
php artisan optimize:clear
php artisan db:seed --class=DemoDataSeeder
```

---

## استكشاف الأخطاء على Render

| المشكلة              | الحل                                           |
|----------------------|------------------------------------------------|
| APP_KEY غير موجود   | php artisan key:generate --show                |
| خطأ في DB           | تحقق من DB_* وأن DB_SSLMODE=require            |
| CORS error          | أضف Frontend URL في CORS_ALLOWED_ORIGINS        |
| Build يفشل          | راجع Docker logs في Render dashboard           |

---

## روابط مفيدة

- Laravel 13 Docs: https://laravel.com/docs/13.x
- Laravel Sanctum: https://laravel.com/docs/13.x/sanctum
- Render Docker Deploy: https://render.com/docs/deploy-an-image
- Render PostgreSQL: https://render.com/docs/databases
