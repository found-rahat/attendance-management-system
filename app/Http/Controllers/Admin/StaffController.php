<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Designation;
use App\Models\StaffSalary;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class StaffController extends Controller
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

        return Inertia::render('Admin/Staff', [
            'staff' => User::query()
                ->where('company_id', $company->id)
                ->where('role', User::ROLE_STAFF)
                ->withCount('attendances')
                ->with('latestSalary')
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'designation', 'office_id', 'created_at']),
            'designations' => Designation::query()
                ->where('company_id', $company->id)
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']),
            'subscription' => [
                'plan_name' => $company->plan?->name,
                'staff_limit' => $company->staffLimit(),
                'staff_count' => $company->staffCount(),
                'at_limit' => $company->hasReachedStaffLimit(),
            ],
            'today' => Carbon::today()->toDateString(),
        ]);
    }

    public function store(Request $request)
    {
        $company = $this->company($request);

        if ($company->hasReachedStaffLimit()) {
            throw ValidationException::withMessages([
                'name' => 'আপনার plan-এর staff limit ('.$company->staffLimit().') শেষ। আরও staff যোগ করতে plan upgrade করুন।',
            ]);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'string', Password::min(6)],
            'designation_id' => [
                'nullable', 'integer',
                Rule::exists('designations', 'id')->where('company_id', $company->id),
            ],
            'office_id' => [
                'nullable', 'string', 'max:255',
                Rule::unique('users', 'office_id')->where(fn ($q) => $q->where('company_id', $company->id)),
            ],
            'effective_from' => ['nullable', 'date'],
            'basic_salary' => ['nullable', 'numeric', 'min:0'],
            'house_rent' => ['nullable', 'numeric', 'min:0'],
            'medical_allowance' => ['nullable', 'numeric', 'min:0'],
            'transport_allowance' => ['nullable', 'numeric', 'min:0'],
            'special_allowance' => ['nullable', 'numeric', 'min:0'],
        ]);

        DB::transaction(function () use ($data, $company) {
            $designation = ! empty($data['designation_id'])
                ? Designation::query()
                    ->where('company_id', $company->id)
                    ->find($data['designation_id'])
                : null;

            $staff = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => User::ROLE_STAFF,
                'designation' => $designation?->name,
                'designation_id' => $designation?->id,
                'office_id' => $data['office_id'] ?? null,
                'company_id' => $company->id,
            ]);

            if (! empty($data['basic_salary'])) {
                StaffSalary::create([
                    'company_id' => $company->id,
                    'staff_id' => $staff->id,
                    'basic_salary' => $data['basic_salary'],
                    'house_rent' => $data['house_rent'] ?? 0,
                    'medical_allowance' => $data['medical_allowance'] ?? 0,
                    'transport_allowance' => $data['transport_allowance'] ?? 0,
                    'special_allowance' => $data['special_allowance'] ?? 0,
                    'effective_from' => $data['effective_from'] ?? now()->toDateString(),
                    'note' => 'Initial salary (staff creation)',
                ]);
            }
        });

        return back()->with('message', 'Staff member added successfully.');
    }

    public function destroy(Request $request, User $staff)
    {
        $company = $this->company($request);

        abort_unless(
            $staff->company_id === $company->id && $staff->isStaff(),
            403,
        );

        $staff->delete();

        return back()->with('message', 'Staff member removed.');
    }
}
