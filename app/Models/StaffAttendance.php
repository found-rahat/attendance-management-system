<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'company_id',
    'staff_id',
    'date',
    'check_in_at',
    'check_in_latitude',
    'check_in_longitude',
    'check_in_accuracy',
    'check_in_distance',
    'check_in_outside',
    'check_out_at',
    'check_out_latitude',
    'check_out_longitude',
    'check_out_accuracy',
    'check_out_distance',
    'check_out_outside',
    'status',
])]
class StaffAttendance extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'check_in_at' => 'datetime',
            'check_out_at' => 'datetime',
            'check_in_latitude' => 'float',
            'check_in_longitude' => 'float',
            'check_in_outside' => 'boolean',
            'check_out_latitude' => 'float',
            'check_out_longitude' => 'float',
            'check_out_outside' => 'boolean',
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