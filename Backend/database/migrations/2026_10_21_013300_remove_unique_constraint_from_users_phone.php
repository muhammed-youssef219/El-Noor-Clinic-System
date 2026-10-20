<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        try {
            DB::statement('DROP INDEX IF EXISTS users_phone_unique');
        } catch (\Throwable $e) {}

        try {
            DB::statement('CREATE INDEX IF NOT EXISTS users_phone_index ON users(phone)');
        } catch (\Throwable $e) {}
    }

    public function down(): void
    {
        try {
            DB::statement('DROP INDEX IF EXISTS users_phone_index');
            DB::statement('CREATE UNIQUE INDEX IF NOT EXISTS users_phone_unique ON users(phone)');
        } catch (\Throwable $e) {}
    }
};
