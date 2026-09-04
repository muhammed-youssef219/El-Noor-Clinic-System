<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['key', 'name'])]
class Specialty extends Model
{
    use HasFactory;

    public function doctors(): HasMany
    {
        return $this->hasMany(Doctor::class);
    }

    public function serviceCatalogItems(): HasMany
    {
        return $this->hasMany(ServiceCatalogItem::class);
    }
}