<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\ServiceCatalogItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<InvoiceItem> */
class InvoiceItemFactory extends Factory
{
    public function definition(): array
    {
        return ['invoice_id' => Invoice::factory(), 'service_catalog_item_id' => ServiceCatalogItem::factory(), 'name' => fake()->words(2, true), 'unit_price' => fake()->randomFloat(2, 50, 1000)];
    }
}