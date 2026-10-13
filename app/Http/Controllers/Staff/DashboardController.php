<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\StaffAttendance;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    private function company(Request $request): Company
    {
        $company = $request->user()->company;

        abort_if($company === null, 403, 'No company assigned to this account.');
        abort_unless($company->is_active, 403, 'This company is inactive.');

        return $company;
    }

    public function index(Request $request)
    {
        $company = $this->company($request);
        $today = Carbon::now($company->timezone);

        $base = StaffAttendance::query()->where('staff_id', $request->user()->id);

        $todayAttendance = (clone $base)
            ->whereDate('date', $today->toDateString())
            ->first();

        $monthQuery = fn () => (clone $base)->whereBetween('date', [
            $today->copy()->startOfMonth()->toDateString(),
            $today->copy()->endOfMonth()->toDateString(),
        ]);

        $recent = (clone $base)
            ->orderByDesc('date')
            ->limit(5)
            ->get(['id', 'date', 'check_in_at', 'check_out_at', 'check_in_distance', 'check_in_outside', 'status']);

        return Inertia::render('Staff/Dashboard', [
            'today' => $todayAttendance,
            'todayDate' => $today->toDateString(),
            'monthLabel' => $today->format('F Y'),
            'stats' => [
                'present' => $monthQuery()->where('status', 'present')->count(),
                'late' => $monthQuery()->where('status', 'late')->count(),
                'total' => $monthQuery()->count(),
                'outside' => $monthQuery()->where('check_in_outside', true)->count(),
            ],
            'recent' => $recent,
            'office' => $company->office(),
        ]);
    }
}
