<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'company_id',
    'staff_id',
    'provident_fund_type_id',
    'enrolled_at',
])]
class ProvidentFund extends Model
{
    protected function casts(): array
    {
        return [
            'enrolled_at' => 'date',
        ];
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(ProvidentFundType::class, 'provident_fund_type_id');
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
