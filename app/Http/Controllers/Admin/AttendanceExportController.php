<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\StaffAttendance;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AttendanceExportController extends Controller
{
    private function company(Request $request): Company
    {
        $company = $request->user()->company;

        abort_if($company === null, 403, 'No company assigned to this account.');

        return $company;
    }

    public function __invoke(Request $request)
    {
        $company = $this->company($request);

        $filters = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'staff_id' => ['nullable', 'integer', 'exists:users,id'],
            'status' => ['nullable', 'in:present,late,absent'],
        ]);

        $from = $filters['from']
            ?? StaffAttendance::query()->where('company_id', $company->id)->min('date')
            ?? Carbon::now($company->timezone)->startOfMonth()->toDateString();
        $to = $filters['to'] ?? Carbon::now($company->timezone)->toDateString();

        $rows = StaffAttendance::query()
            ->where('company_id', $company->id)
            ->with('staff:id,name,email')
            ->when($filters['from'] ?? null, fn ($q, $value) => $q->whereDate('date', '>=', $value))
            ->when($filters['to'] ?? null, fn ($q, $value) => $q->whereDate('date', '<=', $value))
            ->when($filters['staff_id'] ?? null, fn ($q, $value) => $q->where('staff_id', $value))
            ->when($filters['status'] ?? null, fn ($q, $value) => $q->where('status', $value))
            ->orderBy('date')
            ->orderBy('check_in_at')
            ->get();

        $pdf = Pdf::loadView('pdf.attendance-report', [
            'company' => $company,
            'rows' => $rows,
            'from' => $from,
            'to' => $to,
            'generatedAt' => Carbon::now($company->timezone),
        ])->setPaper('a4', 'landscape');

        $filename = 'attendance-'.$company->id.'-'.$from.'_'.$to.'.pdf';

        return $pdf->download($filename);
    }
}