<?php

namespace App\Http\Controllers\Admin\Salary;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\SalaryDeduction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DeductionController extends Controller
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

        return Inertia::render('Admin/Salary/Deduction', [
            'deductions' => SalaryDeduction::query()
                ->where('company_id', $company->id)
                ->with('staff:id,name,email')
                ->latest()
                ->limit(75)
                ->get(),
            'staff' => User::query()
                ->where('company_id', $company->id)
                ->where('role', User::ROLE_STAFF)
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
            'today' => now()->format('Y-m'),
        ]);
    }

    public function store(Request $request)
    {
        $company = $this->company($request);

        $data = $request->validate([
            'staff_id' => ['required', 'integer', Rule::exists('users', 'id')->where('company_id', $company->id)],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'reason' => ['required', 'string', 'max:255'],
            'month' => ['nullable', 'regex:/^\d{4}-\d{2}$/'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $staff = User::findOrFail($data['staff_id']);
        abort_unless($staff->isStaff() && $staff->company_id === $company->id, 403);

        SalaryDeduction::create([
            'company_id' => $company->id,
            'staff_id' => $staff->id,
            'amount' => $data['amount'],
            'reason' => $data['reason'],
            'month' => $data['month'],
            'note' => $data['note'] ?? null,
        ]);

        return back()->with('message', 'Deduction added.');
    }

    public function destroy(Request $request, SalaryDeduction $deduction)
    {
        $company = $this->company($request);
        abort_unless($deduction->company_id === $company->id, 403);

        $deduction->delete();

        return back()->with('message', 'Deduction removed.');
    }
}
