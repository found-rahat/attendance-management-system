<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name',
    'office_name',
    'latitude',
    'longitude',
    'radius_meters',
    'late_after',
    'exit_time',
    'timezone',
    'max_accuracy_meters',
    'is_active',
    'subscription_plan_id',
    'subscription_status',
    'subscription_starts_at',
    'subscription_ends_at',
    'staff_limit_override',
    'subscription_amount_override',
])]
class Company extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'radius_meters' => 'integer',
            'max_accuracy_meters' => 'integer',
            'is_active' => 'boolean',
            'subscription_starts_at' => 'date',
            'subscription_ends_at' => 'date',
            'staff_limit_override' => 'integer',
            'subscription_amount_override' => 'decimal:2',
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function admins(): HasMany
    {
        return $this->hasMany(User::class)->where('role', 'admin');
    }

    public function staff(): HasMany
    {
        return $this->hasMany(User::class)->where('role', 'staff');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(StaffAttendance::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id');
    }

    public function staffCount(): int
    {
        return $this->staff()->count();
    }

    /**
     * Effective maximum number of staff allowed by the current plan.
     */
    public function staffLimit(): int
    {
        if ($this->staff_limit_override !== null) {
            return max(0, (int) $this->staff_limit_override);
        }

        $limit = $this->plan?->staff_limit;

        if ($limit === null) {
            $limit = (int) config('attendance.default_staff_limit', 5);
        }

        return max(0, (int) $limit);
    }

    public function hasReachedStaffLimit(): bool
    {
        $limit = $this->staffLimit();

        if ($limit <= 0) {
            return false;
        }

        return $this->staffCount() >= $limit;
    }

    /**
     * Whether the subscription currently allows access: status must be
     * active/trialing and the end date (if any) must not be in the past.
     */
    public function isSubscriptionActive(): bool
    {
        if (! in_array($this->subscription_status, ['active', 'trialing'], true)) {
            return false;
        }

        if (
            $this->subscription_ends_at !== null
            && $this->subscription_ends_at->startOfDay()->lt(Carbon::today())
        ) {
            return false;
        }

        return true;
    }

    /**
     * Days remaining on the subscription, null when no end date is set.
     */
    public function subscriptionDaysLeft(): ?int
    {
        if ($this->subscription_ends_at === null) {
            return $this->isSubscriptionActive() ? null : 0;
        }

        if (! $this->isSubscriptionActive()) {
            return 0;
        }

        return (int) max(
            0,
            Carbon::today()->startOfDay()->diffInDays(
                $this->subscription_ends_at->startOfDay(),
            ),
        );
    }

    /**
     * Haversine distance in meters between the office and a point.
     */
    public function distanceFrom(float $latitude, float $longitude): float
    {
        $earthRadius = 6371000;

        $dLat = deg2rad($latitude - $this->latitude);
        $dLng = deg2rad($longitude - $this->longitude);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($this->latitude))
                * cos(deg2rad($latitude))
                * sin($dLng / 2) ** 2;

        return $earthRadius * 2 * atan2(
            sqrt($a),
            sqrt(max(0, 1 - $a))
        );
    }

    /**
     * Office payload shared with the frontend maps.
     *
     * @return array{name:string, latitude:float, longitude:float, radius:int, max_accuracy:int}
     */
    public function office(): array
    {
        return [
            'name' => $this->office_name,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'radius' => $this->radius_meters,
            'max_accuracy' => $this->max_accuracy_meters,
        ];
    }
}
