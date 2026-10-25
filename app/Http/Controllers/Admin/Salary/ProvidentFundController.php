<?php

namespace App\Http\Controllers\Admin\Salary;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\ProvidentFund;
use App\Models\ProvidentFundType;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProvidentFundController extends Controller
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

        return Inertia::render('Admin/Salary/ProvidentFund', [
            'types' => ProvidentFundType::query()
                ->where('company_id', $company->id)
                ->orderByDesc('is_active')
                ->orderBy('name')
                ->get(),
            'funds' => ProvidentFund::query()
                ->where('company_id', $company->id)
                ->with(['staff:id,name,email', 'type:id,name,employee_percent,employer_percent'])
                ->get(),
            'staff' => User::query()
                ->where('company_id', $company->id)
                ->where('role', User::ROLE_STAFF)
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
            'today' => now()->format('Y-m-d'),
        ]);
    }

    public function storeType(Request $request)
    {
        $company = $this->company($request);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'employee_percent' => ['required', 'numeric', 'min:0', 'max:100'],
            'employer_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        ProvidentFundType::create([
            'company_id' => $company->id,
            'name' => $data['name'],
            'employee_percent' => $data['employee_percent'],
            'employer_percent' => $data['employer_percent'] ?? 0,
        ]);

        return back()->with('message', 'Provident fund type added.');
    }

    public function updateType(Request $request, ProvidentFundType $type)
    {
        $company = $this->company($request);
        abort_unless($type->company_id === $company->id, 403);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'employee_percent' => ['required', 'numeric', 'min:0', 'max:100'],
            'employer_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'is_active' => ['required', 'boolean'],
        ]);

        $type->update([
            'name' => $data['name'],
            'employee_percent' => $data['employee_percent'],
            'employer_percent' => $data['employer_percent'] ?? 0,
            'is_active' => $data['is_active'],
        ]);

        return back()->with('message', 'Provident fund type updated.');
    }

    public function destroyType(Request $request, ProvidentFundType $type)
    {
        $company = $this->company($request);
        abort_unless($type->company_id === $company->id, 403);

        if ($type->funds()->exists()) {
            abort(422, 'এই type-এ staff enrolled আছেন। আগে তাদের সরান।');
        }

        $type->delete();

        return back()->with('message', 'Provident fund type removed.');
    }

    public function store(Request $request)
    {
        $company = $this->company($request);

        $data = $request->validate([
            'staff_id' => ['required', 'integer', Rule::exists('users', 'id')->where('company_id', $company->id)],
            'provident_fund_type_id' => ['required', 'integer', Rule::exists('provident_fund_types', 'id')->where('company_id', $company->id)],
            'enrolled_at' => ['nullable', 'date'],
        ]);

        $staff = User::findOrFail($data['staff_id']);
        abort_unless($staff->isStaff() && $staff->company_id === $company->id, 403);

        ProvidentFund::updateOrCreate(
            ['company_id' => $company->id, 'staff_id' => $staff->id],
            [
                'provident_fund_type_id' => $data['provident_fund_type_id'],
                'enrolled_at' => $data['enrolled_at'] ?? now()->toDateString(),
            ],
        );

        return back()->with('message', 'Staff enrolled in provident fund.');
    }

    public function update(Request $request, ProvidentFund $fund)
    {
        $company = $this->company($request);
        abort_unless($fund->company_id === $company->id, 403);

        $data = $request->validate([
            'provident_fund_type_id' => ['required', 'integer', Rule::exists('provident_fund_types', 'id')->where('company_id', $company->id)],
            'enrolled_at' => ['nullable', 'date'],
        ]);

        $fund->update([
            'provident_fund_type_id' => $data['provident_fund_type_id'],
            'enrolled_at' => $data['enrolled_at'] ?? $fund->enrolled_at,
        ]);

        return back()->with('message', 'Provident fund updated.');
    }
}
