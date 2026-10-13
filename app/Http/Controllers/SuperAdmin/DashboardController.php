<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\StaffAttendance;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $trend = collect(range(6, 0))->map(function (int $daysAgo) {
            $date = Carbon::today()->subDays($daysAgo);

            return [
                'label' => $date->format('j M'),
                'value' => StaffAttendance::query()->whereDate('date', $date->toDateString())->count(),
            ];
        });

        return Inertia::render('SuperAdmin/Dashboard', [
            'stats' => [
                'companies' => Company::query()->count(),
                'active_companies' => Company::query()->where('is_active', true)->count(),
                'admins' => User::query()->where('role', User::ROLE_ADMIN)->count(),
                'staff' => User::query()->where('role', User::ROLE_STAFF)->count(),
                'attendance_today' => StaffAttendance::query()
                    ->whereDate('date', now()->toDateString())
                    ->count(),
            ],
            'trend' => $trend,
            'companies' => Company::query()
                ->withCount(['staff', 'admins'])
                ->orderByDesc('created_at')
                ->limit(8)
                ->get(['id', 'name', 'office_name', 'is_active', 'created_at']),
        ]);
    }
}