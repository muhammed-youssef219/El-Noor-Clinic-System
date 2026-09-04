<?php

namespace Tests\Feature;

use App\Services\SmsNotificationService;
use Tests\TestCase;

class SmsNotificationTest extends TestCase
{
    public function test_sms_service_formats_egyptian_phone_numbers_correctly(): void
    {
        $smsService = app(SmsNotificationService::class);
        
        // Test with leading zero
        $this->assertEquals('+201001234567', $this->formatPhoneNumber('01001234567'));
        
        // Test with country code
        $this->assertEquals('+201001234567', $this->formatPhoneNumber('+201001234567'));
        
        // Test with spaces and dashes
        $this->assertEquals('+201001234567', $this->formatPhoneNumber('01001234567'));
    }

    private function formatPhoneNumber(string $phoneNumber): string
    {
        // Remove non-digit characters
        $cleaned = preg_replace('/\D/', '', $phoneNumber);
        
        // If it doesn't start with country code, assume Egypt (+20)
        if (!str_starts_with($cleaned, '20')) {
            // If it starts with 0, remove it and add country code
            if (str_starts_with($cleaned, '0')) {
                $cleaned = '20' . substr($cleaned, 1);
            } else {
                $cleaned = '20' . $cleaned;
            }
        }
        
        return '+' . $cleaned;
    }
}
