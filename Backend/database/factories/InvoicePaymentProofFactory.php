<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\InvoicePaymentProof;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<InvoicePaymentProof> */
class InvoicePaymentProofFactory extends Factory
{
    public function definition(): array
    {
        return ['invoice_id' => Invoice::factory(), 'storage_disk' => 'local', 'path' => 'payment-proofs/'.fake()->uuid().'.jpg', 'original_filename' => 'proof.jpg', 'mime_type' => 'image/jpeg', 'size_bytes' => 1024, 'uploaded_by_user_id' => User::factory()];
    }
}