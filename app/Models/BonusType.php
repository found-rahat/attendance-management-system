<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'company_id',
    'name',
    'amount_type',
    'fixed_amount',
    'percentage',
    'description',
    'is_active',
])]
class BonusType extends Model
{
    protected function casts(): array
    {
        return [
            'amount_type' => 'string',
            'fixed_amount' => 'decimal:2',
            'percentage' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function bonuses(): HasMany
    {
        return $this->hasMany(Bonus::class);
    }

    /**
     * Compute the bonus amount for a staff member for a given month.
     */
    public function amountFor(int $staffId, string $month): float
    {
        if ($this->amount_type === 'percent') {
            $basic = StaffSalary::forMonth($staffId, $month)?->basic_salary ?? 0;

            return round(((float) $basic * (float) $this->percentage) / 100, 2);
        }

        return (float) $this->fixed_amount;
    }
}
