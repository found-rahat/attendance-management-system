<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name',
    'slug',
    'price',
    'billing_cycle',
    'staff_limit',
    'features',
    'is_featured',
    'is_active',
    'sort_order',
])]
class SubscriptionPlan extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'staff_limit' => 'integer',
            'features' => 'array',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function companies(): HasMany
    {
        return $this->hasMany(Company::class);
    }

    /**
     * The date a billing period starting at the given date ends, based on
     * the plan's billing cycle.
     */
    public function periodEnd(Carbon $start): Carbon
    {
        return $this->billing_cycle === 'yearly'
            ? $start->copy()->addYear()
            : $start->copy()->addMonth();
    }

    public function isUnlimited(): bool
    {
        return $this->staff_limit <= 0;
    }

    public function staffLimitLabel(): string
    {
        return $this->isUnlimited()
            ? 'Unlimited staff'
            : 'Up to '.number_format($this->staff_limit).' staff';
    }
}