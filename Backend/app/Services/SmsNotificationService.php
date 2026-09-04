<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsNotificationService
{
    private string $accountSid;

    private string $authToken;

    private string $fromNumber;

    public function __construct()
    {
        $this->accountSid = (string) config('services.twilio.account_sid', '');
        $this->authToken = (string) config('services.twilio.auth_token', '');
        $this->fromNumber = (string) config('services.twilio.from_number', '');
    }

    /**
     * Send SMS notification to a phone number
     */
    public function send(string $phoneNumber, string $message): bool
    {
        if (! $this->isConfigured()) {
            Log::warning('Twilio SMS is not configured. Skipping SMS to '.$phoneNumber);

            return false;
        }

        try {
            $response = Http::withBasicAuth($this->accountSid, $this->authToken)
                ->post("https://api.twilio.com/2010-04-01/Accounts/{$this->accountSid}/Messages.json", [
                    'From' => $this->fromNumber,
                    'To' => $this->formatPhoneNumber($phoneNumber),
                    'Body' => $message,
                ]);

            if ($response->successful()) {
                Log::info('SMS sent successfully to '.$phoneNumber);

                return true;
            }

            Log::error('SMS failed to send to '.$phoneNumber, ['response' => $response->body()]);

            return false;
        } catch (\Exception $e) {
            Log::error('SMS exception', ['exception' => $e->getMessage(), 'to' => $phoneNumber]);

            return false;
        }
    }

    /**
     * Format phone number to E.164 format
     */
    private function formatPhoneNumber(string $phoneNumber): string
    {
        // Remove non-digit characters
        $cleaned = preg_replace('/\D/', '', $phoneNumber);

        // If it doesn't start with country code, assume Egypt (+20)
        if (! str_starts_with($cleaned, '20')) {
            // If it starts with 0, remove it and add country code
            if (str_starts_with($cleaned, '0')) {
                $cleaned = '20'.substr($cleaned, 1);
            } else {
                $cleaned = '20'.$cleaned;
            }
        }

        return '+'.$cleaned;
    }

    /**
     * Check if Twilio is configured
     */
    private function isConfigured(): bool
    {
        return ! empty($this->accountSid) && ! empty($this->authToken) && ! empty($this->fromNumber);
    }
}
