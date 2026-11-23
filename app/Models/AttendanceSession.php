<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'company_id',
    'check_in_company_name',
    'check_in_at',
    'check_in_latitude',
    'check_in_longitude',
    'check_in_accuracy',
    'check_in_address',
    'check_in_photo',
    'check_in_remarks',
    'check_out_company_name',
    'check_out_at',
    'check_out_latitude',
    'check_out_longitude',
    'check_out_accuracy',
    'check_out_address',
    'check_out_photo',
    'check_out_remarks',
    'status',
])]
class AttendanceSession extends Model
{
    protected function casts(): array
    {
        return [
            'check_in_at' => 'datetime',
            'check_out_at' => 'datetime',
            'check_in_latitude' => 'decimal:7',
            'check_in_longitude' => 'decimal:7',
            'check_out_latitude' => 'decimal:7',
            'check_out_longitude' => 'decimal:7',
            'check_in_accuracy' => 'integer',
            'check_out_accuracy' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
