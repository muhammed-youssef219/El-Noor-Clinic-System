<?php

namespace App\Http\Resources;

use App\Support\ClinicResourceTransformer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClinicResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return app(ClinicResourceTransformer::class)->transform($this->resource);
    }
}
