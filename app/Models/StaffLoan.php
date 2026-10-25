<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'company_id',
    'staff_id',
    'loan_category_id',
    'amount',
    'interest_rate',
    'installment_amount',
    'total_installments',
    'paid_installments',
    'remaining',
    'granted_at',
    'status',
    'note',
])]
class StaffLoan extends Model
{
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'interest_rate' => 'decimal:2',
            'installment_amount' => 'decimal:2',
            'remaining' => 'decimal:2',
            'granted_at' => 'date',
        ];
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(LoanCategory::class, 'loan_category_id');
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function installments(): HasMany
    {
        return $this->hasMany(StaffLoanInstallment::class);
    }

    public function isAdvance(): bool
    {
        return $this->category?->name === LoanCategory::ADVANCE;
    }
}
