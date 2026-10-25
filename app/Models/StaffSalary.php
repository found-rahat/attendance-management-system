<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'company_id',
    'staff_id',
    'basic_salary',
    'house_rent',
    'medical_allowance',
    'transport_allowance',
    'special_allowance',
    'effective_from',
    'note',
])]
class StaffSalary extends Model
{
    protected function casts(): array
    {
        return [
            'basic_salary' => 'decimal:2',
            'house_rent' => 'decimal:2',
            'medical_allowance' => 'decimal:2',
            'transport_allowance' => 'decimal:2',
            'special_allowance' => 'decimal:2',
            'effective_from' => 'date',
        ];
    }

    public function gross(): float
    {
        return (float) $this->basic_salary
            + (float) $this->house_rent
            + (float) $this->medical_allowance
            + (float) $this->transport_allowance
            + (float) $this->special_allowance;
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * The effective salary record for a month (latest record effective at/before it).
     */
    public static function forMonth(int $staffId, string $month): ?self
    {
        $end = CarbonImmutable::createFromFormat('Y-m', $month)?->endOfMonth();

        return self::query()->where('staff_id', $staffId)
            ->when($end !== null, fn ($q) => $q->where('effective_from', '<=', $end->toDateString()))
            ->orderByDesc('effective_from')
            ->first();
    }
}
