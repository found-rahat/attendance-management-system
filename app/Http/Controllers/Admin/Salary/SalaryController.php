<?php

namespace App\Http\Controllers\Admin\Salary;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Designation;
use App\Models\StaffPromotion;
use App\Models\StaffSalary;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class SalaryController extends Controller
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

        $salaries = StaffSalary::query()
            ->where('company_id', $company->id)
            ->with('staff:id,name,email,designation')
            ->orderByDesc('effective_from')
            ->get()
            ->groupBy('staff_id');

        $promotions = StaffPromotion::query()
            ->where('company_id', $company->id)
            ->with('staff:id,name,email,designation')
            ->orderByDesc('effective_from')
            ->limit(50)
            ->get();

        return Inertia::render('Admin/Salary/Index', [
            'staff' => User::query()
                ->where('company_id', $company->id)
                ->where('role', User::ROLE_STAFF)
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'designation']),
            'designations' => Designation::query()
                ->where('company_id', $company->id)
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']),
            'salaries' => $salaries,
            'promotions' => $promotions,
            'today' => Carbon::today()->toDateString(),
        ]);
    }

    public function store(Request $request)
    {
        $company = $this->company($request);

        $data = $request->validate([
            'staff_id' => ['required', 'integer', Rule::exists('users', 'id')->where('company_id', $company->id)],
            'basic_salary' => ['required', 'numeric', 'min:0'],
            'house_rent' => ['nullable', 'numeric', 'min:0'],
            'medical_allowance' => ['nullable', 'numeric', 'min:0'],
            'transport_allowance' => ['nullable', 'numeric', 'min:0'],
            'special_allowance' => ['nullable', 'numeric', 'min:0'],
            'effective_from' => ['required', 'date'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $staff = User::findOrFail($data['staff_id']);
        abort_unless($staff->isStaff() && $staff->company_id === $company->id, 403);

        StaffSalary::create([
            'company_id' => $company->id,
            'staff_id' => $staff->id,
            'basic_salary' => $data['basic_salary'],
            'house_rent' => $data['house_rent'] ?? 0,
            'medical_allowance' => $data['medical_allowance'] ?? 0,
            'transport_allowance' => $data['transport_allowance'] ?? 0,
            'special_allowance' => $data['special_allowance'] ?? 0,
            'effective_from' => $data['effective_from'],
            'note' => $data['note'] ?? null,
        ]);

        return back()->with('message', 'Salary set successfully.');
    }

    public function increment(Request $request)
    {
        $company = $this->company($request);

        $data = $request->validate([
            'staff_id' => ['required', 'integer', Rule::exists('users', 'id')->where('company_id', $company->id)],
            'type' => ['required', 'in:amount,percent'],
            'value' => ['required', 'numeric', 'min:0.01'],
            'effective_from' => ['required', 'date'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $staff = User::findOrFail($data['staff_id']);
        abort_unless($staff->isStaff() && $staff->company_id === $company->id, 403);

        $current = StaffSalary::query()
            ->where('staff_id', $staff->id)
            ->orderByDesc('effective_from')
            ->first();

        if ($current === null) {
            throw ValidationException::withMessages([
                'staff_id' => 'আগে staff-এর salary set করুন তারপর increment করুন।',
            ]);
        }

        $extra = $data['type'] === 'percent'
            ? ((float) $current->basic_salary * (float) $data['value']) / 100
            : (float) $data['value'];

        StaffSalary::create([
            'company_id' => $company->id,
            'staff_id' => $staff->id,
            'basic_salary' => round(((float) $current->basic_salary + $extra), 2),
            'house_rent' => $current->house_rent,
            'medical_allowance' => $current->medical_allowance,
            'transport_allowance' => $current->transport_allowance,
            'special_allowance' => $current->special_allowance,
            'effective_from' => $data['effective_from'],
            'note' => $data['note'] ?? null,
        ]);

        return back()->with('message', 'Salary increment applied.');
    }

    public function promote(Request $request)
    {
        $company = $this->company($request);

        $data = $request->validate([
            'staff_id' => ['required', 'integer', Rule::exists('users', 'id')->where('company_id', $company->id)],
            'designation_id' => ['required', 'integer', Rule::exists('designations', 'id')->where('company_id', $company->id)],
            'new_salary' => ['required', 'numeric', 'min:0'],
            'effective_from' => ['required', 'date'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $staff = User::findOrFail($data['staff_id']);
        abort_unless($staff->isStaff() && $staff->company_id === $company->id, 403);

        $designation = Designation::findOrFail($data['designation_id']);

        $previous = StaffSalary::query()
            ->where('staff_id', $staff->id)
            ->orderByDesc('effective_from')
            ->first();

        $previousSalary = $previous?->gross();
        $previousDesignation = $staff->designation;

        $staff->update([
            'designation' => $designation->name,
            'designation_id' => $designation->id,
        ]);

        StaffSalary::create([
            'company_id' => $company->id,
            'staff_id' => $staff->id,
            'basic_salary' => $data['new_salary'],
            'house_rent' => 0,
            'medical_allowance' => 0,
            'transport_allowance' => 0,
            'special_allowance' => 0,
            'effective_from' => $data['effective_from'],
            'note' => $data['note'] ?? null,
        ]);

        StaffPromotion::create([
            'company_id' => $company->id,
            'staff_id' => $staff->id,
            'old_designation' => $previousDesignation,
            'new_designation' => $designation->name,
            'old_salary' => $previousSalary,
            'new_salary' => $data['new_salary'],
            'effective_from' => $data['effective_from'],
            'note' => $data['note'] ?? null,
        ]);

        return back()->with('message', 'Promotion applied.');
    }
}
