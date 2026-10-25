<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'company_id',
    'staff_id',
    'month',
    'basic',
    'house_rent',
    'medical',
    'transport',
    'special',
    'bonus',
    'pf_employee',
    'pf_employer',
    'loan_installment',
    'manual_deduction',
    'total_earning',
    'total_deduction',
    'net',
    'status',
    'paid_at',
    'note',
])]
class SalarySheet extends Model
{
    public const STATUS_DRAFT = 'draft';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_PAID = 'paid';

    protected function casts(): array
    {
        return [
            'basic' => 'decimal:2',
            'house_rent' => 'decimal:2',
            'medical' => 'decimal:2',
            'transport' => 'decimal:2',
            'special' => 'decimal:2',
            'bonus' => 'decimal:2',
            'pf_employee' => 'decimal:2',
            'pf_employer' => 'decimal:2',
            'loan_installment' => 'decimal:2',
            'manual_deduction' => 'decimal:2',
            'total_earning' => 'decimal:2',
            'total_deduction' => 'decimal:2',
            'net' => 'decimal:2',
            'paid_at' => 'date',
        ];
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
