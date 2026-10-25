<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'company_id',
    'name',
    'employee_percent',
    'employer_percent',
    'is_active',
])]
class ProvidentFundType extends Model
{
    protected function casts(): array
    {
        return [
            'employee_percent' => 'decimal:2',
            'employer_percent' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function funds(): HasMany
    {
        return $this->hasMany(ProvidentFund::class);
    }
}
