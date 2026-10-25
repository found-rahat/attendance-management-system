<?php

namespace App\Http\Controllers\Admin\Salary;

use App\Http\Controllers\Controller;
use App\Models\Bonus;
use App\Models\Company;
use App\Models\ProvidentFund;
use App\Models\SalaryDeduction;
use App\Models\SalarySheet;
use App\Models\StaffLoan;
use App\Models\StaffLoanInstallment;
use App\Models\StaffSalary;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SheetController extends Controller
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

        $month = $request->string('month', now()->format('Y-m'))->toString();

        if (! preg_match('/^\d{4}-\d{2}$/', $month)) {
            $month = now()->format('Y-m');
        }

        $sheets = SalarySheet::query()
            ->where('company_id', $company->id)
            ->where('month', $month)
            ->with('staff:id,name,email,designation')
            ->orderBy('staff_id')
            ->get();

        return Inertia::render('Admin/Salary/Sheet', [
            'month' => $month,
            'sheets' => $sheets,
            'staff' => User::query()
                ->where('company_id', $company->id)
                ->where('role', User::ROLE_STAFF)
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'designation']),
            'has_salary_set' => StaffSalary::query()
                ->where('company_id', $company->id)
                ->select('staff_id')
                ->distinct()
                ->pluck('staff_id'),
            'last_generated_month' => SalarySheet::query()
                ->where('company_id', $company->id)
                ->latest('month')
                ->value('month'),
        ]);
    }

    /**
     * Generate (or regenerate) the salary sheet for a given month.
     * Existing sheets for the selected staff are replaced.
     */
    public function generate(Request $request)
    {
        $company = $this->company($request);

        $data = $request->validate([
            'month' => ['required', 'regex:/^\d{4}-\d{2}$/'],
            'staff_ids' => ['nullable', 'array'],
            'staff_ids.*' => ['integer'],
        ]);

        $staffQuery = User::query()
            ->where('company_id', $company->id)
            ->where('role', User::ROLE_STAFF);

        if (! empty($data['staff_ids'])) {
            $staffQuery->whereIn('id', $data['staff_ids']);
        }

        $staffList = $staffQuery->get();

        $generated = 0;
        $skipped = 0;

        DB::transaction(function () use ($company, $staffList, $data, &$generated, &$skipped) {
            $month = $data['month'];
            $staffIds = $staffList->pluck('id')->all();

            SalarySheet::query()
                ->where('company_id', $company->id)
                ->where('month', $month)
                ->whereIn('staff_id', $staffIds)
                ->delete();

            foreach ($staffList as $staff) {
                $salary = StaffSalary::forMonth($staff->id, $month);

                if ($salary === null) {
                    $skipped++;

                    continue;
                }

                $basic = (float) $salary->basic_salary;
                $house = (float) $salary->house_rent;
                $medical = (float) $salary->medical_allowance;
                $transport = (float) $salary->transport_allowance;
                $special = (float) $salary->special_allowance;

                $bonus = (float) Bonus::query()
                    ->where('company_id', $company->id)
                    ->where('staff_id', $staff->id)
                    ->where('month', $month)
                    ->sum('amount');

                $pfType = ProvidentFund::query()
                    ->where('staff_id', $staff->id)
                    ->first()?->type;

                $pfEmployee = $pfType !== null
                    ? round(($basic * (float) $pfType->employee_percent) / 100, 2)
                    : 0.0;
                $pfEmployer = $pfType !== null
                    ? round(($basic * (float) $pfType->employer_percent) / 100, 2)
                    : 0.0;

                $monthEnd = CarbonImmutable::createFromFormat('Y-m', $month)?->endOfMonth();

                $loanInstallment = 0.0;
                $loans = StaffLoan::query()
                    ->where('company_id', $company->id)
                    ->where('staff_id', $staff->id)
                    ->where('status', 'ongoing')
                    ->when($monthEnd !== null, fn ($q) => $q->where('granted_at', '<=', $monthEnd->toDateString()))
                    ->where('remaining', '>', 0)
                    ->get();

                foreach ($loans as $loan) {
                    $existing = StaffLoanInstallment::query()
                        ->where('staff_loan_id', $loan->id)
                        ->where('month', $month)
                        ->first();

                    if ($existing !== null) {
                        $loanInstallment += (float) $existing->amount;

                        continue;
                    }

                    $amount = min((float) $loan->remaining, (float) $loan->installment_amount);

                    StaffLoanInstallment::create([
                        'company_id' => $company->id,
                        'staff_id' => $staff->id,
                        'staff_loan_id' => $loan->id,
                        'month' => $month,
                        'amount' => $amount,
                    ]);

                    $loan->paid_installments += 1;
                    $loan->remaining = round((float) $loan->remaining - $amount, 2);

                    if ((float) $loan->remaining <= 0) {
                        $loan->remaining = 0;
                        $loan->status = 'closed';
                    }

                    $loan->save();
                    $loanInstallment += $amount;
                }

                $manual = (float) SalaryDeduction::query()
                    ->where('company_id', $company->id)
                    ->where('staff_id', $staff->id)
                    ->where('month', $month)
                    ->sum('amount');

                $totalEarning = round($basic + $house + $medical + $transport + $special + $bonus, 2);
                $totalDeduction = round($pfEmployee + $loanInstallment + $manual, 2);

                SalarySheet::create([
                    'company_id' => $company->id,
                    'staff_id' => $staff->id,
                    'month' => $month,
                    'basic' => $basic,
                    'house_rent' => $house,
                    'medical' => $medical,
                    'transport' => $transport,
                    'special' => $special,
                    'bonus' => $bonus,
                    'pf_employee' => $pfEmployee,
                    'pf_employer' => $pfEmployer,
                    'loan_installment' => $loanInstallment,
                    'manual_deduction' => $manual,
                    'total_earning' => $totalEarning,
                    'total_deduction' => $totalDeduction,
                    'net' => round($totalEarning - $totalDeduction, 2),
                    'status' => SalarySheet::STATUS_DRAFT,
                ]);

                $generated++;
            }
        });

        return redirect()
            ->route('admin.salary.sheet', ['month' => $data['month']])
            ->with('message', "Salary sheet generated for {$generated} staff."
                .($skipped > 0 ? " {$skipped} skipped (no salary set)." : ''));
    }

    public function approve(Request $request, SalarySheet $sheet)
    {
        $this->authorizeSheet($request, $sheet);

        if ($sheet->status === SalarySheet::STATUS_PAID) {
            abort(422, 'Amount already paid.');
        }

        $sheet->update(['status' => SalarySheet::STATUS_APPROVED]);

        return back()->with('message', 'Salary approved.');
    }

    public function pay(Request $request, SalarySheet $sheet)
    {
        $this->authorizeSheet($request, $sheet);

        $sheet->update([
            'status' => SalarySheet::STATUS_PAID,
            'paid_at' => now()->toDateString(),
        ]);

        return back()->with('message', 'Salary marked as paid.');
    }

    public function destroy(Request $request, SalarySheet $sheet)
    {
        $this->authorizeSheet($request, $sheet);

        abort_if($sheet->status !== SalarySheet::STATUS_DRAFT, 422, 'Only draft sheets can be deleted.');

        $sheet->delete();

        return back()->with('message', 'Sheet entry removed.');
    }

    private function authorizeSheet(Request $request, SalarySheet $sheet): void
    {
        abort_unless($sheet->company_id === $this->company($request)->id, 403);
    }
}
