<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\StaffAttendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AttendanceReportController extends Controller
{
    private function company(Request $request): Company
    {
        $company = $request->user()->company;

        abort_if($company === null, 403, 'No company assigned to this account.');

        return $company;
    }

    public function index(Request $request)
    {
        $company = $this->company($request);

        $filters = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'staff_id' => ['nullable', 'integer', 'exists:users,id'],
            'status' => ['nullable', 'in:present,late,absent'],
        ]);

        $base = StaffAttendance::query()
            ->where('company_id', $company->id)
            ->with('staff:id,name,email,role')
            ->when($filters['from'] ?? null, fn ($q, $from) =>
                $q->whereDate('date', '>=', $from))
            ->when($filters['to'] ?? null, fn ($q, $to) =>
                $q->whereDate('date', '<=', $to))
            ->when($filters['staff_id'] ?? null, fn ($q, $id) =>
                $q->where('staff_id', $id));

        $includeStatus = ($filters['status'] ?? null) === 'absent'
            ? null
            : ($filters['status'] ?? null);

        $rows = (clone $base)
            ->when($includeStatus, fn ($q, $status) =>
                $q->where('status', $status))
            ->orderByDesc('date')
            ->orderByDesc('check_in_at')
            ->paginate(25)
            ->withQueryString();

        $all = clone $base;
        $countTotal = (clone $all)->count();

        $staffCount = User::query()
            ->where('company_id', $company->id)
            ->where('role', 'staff')
            ->count();

        $from = $filters['from']
            ?? (clone $all)->min('date')
            ?? Carbon::now($company->timezone)->startOfMonth()->toDateString();
        $to = $filters['to'] ?? Carbon::now($company->timezone)->toDateString();

        if (Carbon::parse($to)->lt(Carbon::parse($from))) {
            $to = $from;
        }

        $days = max(1, Carbon::parse($from)->diffInDays(Carbon::parse($to)) + 1);

        return Inertia::render('Admin/AttendanceReport', [
            'rows' => $rows,
            'summary' => [
                'records' => $countTotal,
                'present' => (clone $all)->where('status', 'present')->count(),
                'late' => (clone $all)->where('status', 'late')->count(),
                'checked_out' => (clone $all)->whereNotNull('check_out_at')->count(),
                'outside' => (clone $all)->where('check_in_outside', true)->count(),
                'absent_estimate' => max(0, $staffCount * $days - $countTotal),
            ],
            'filters' => $filters,
            'staff' => User::query()
                ->where('company_id', $company->id)
                ->where('role', 'staff')
                ->select('id', 'name')
                ->orderBy('name')
                ->get(),
            'office' => $company->office(),
        ]);
    }

    public function update(Request $request, StaffAttendance $attendance)
    {
        $company = $this->company($request);

        abort_unless($attendance->company_id === $company->id, 403);

        $data = $request->validate([
            'check_in_at' => ['nullable', 'date_format:Y-m-d\TH:i'],
            'check_out_at' => ['nullable', 'date_format:Y-m-d\TH:i'],
            'status' => ['required', 'in:present,late'],
        ]);

        $checkIn = $data['check_in_at']
            ? Carbon::parse($data['check_in_at'], $company->timezone)->setTimezone('UTC')
            : null;
        $checkOut = $data['check_out_at']
            ? Carbon::parse($data['check_out_at'], $company->timezone)->setTimezone('UTC')
            : null;

        if ($checkIn && $checkOut && $checkOut->lt($checkIn)) {
            throw ValidationException::withMessages([
                'check_out_at' => 'Check out সময় check in-এর পরে হতে হবে।',
            ]);
        }

        $attendance->update([
            'check_in_at' => $checkIn,
            'check_out_at' => $checkOut,
            'status' => $data['status'],
        ]);

        return back()->with('message', 'Attendance updated.');
    }

    public function map(Request $request)
    {
        $company = $this->company($request);

        $filters = $request->validate([
            'date' => ['nullable', 'date'],
        ]);

        $date = $filters['date'] ?? Carbon::now($company->timezone)->toDateString();

        $rows = StaffAttendance::query()
            ->where('company_id', $company->id)
            ->with('staff:id,name,role')
            ->whereDate('date', $date)
            ->whereNotNull('check_in_latitude')
            ->whereNotNull('check_in_longitude')
            ->get([
                'id',
                'staff_id',
                'date',
                'check_in_at',
                'check_in_latitude',
                'check_in_longitude',
                'check_out_at',
                'check_out_latitude',
                'check_out_longitude',
                'status',
            ]);

        return Inertia::render('Admin/AttendanceMap', [
            'date' => $date,
            'rows' => $rows,
            'office' => $company->office(),
        ]);
    }
}