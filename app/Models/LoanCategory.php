<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'company_id',
    'name',
    'description',
])]
class LoanCategory extends Model
{
    public const ADVANCE = 'Advance Salary';

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function loans(): HasMany
    {
        return $this->hasMany(StaffLoan::class);
    }

    public static function advanceFor(int $companyId): self
    {
        return self::query()->firstOrCreate(
            ['company_id' => $companyId, 'name' => self::ADVANCE],
            ['description' => 'Salary advance taken by the staff member.'],
        );
    }
}
