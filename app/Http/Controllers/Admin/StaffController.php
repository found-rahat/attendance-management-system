<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;
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
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'created_at']),
            'subscription' => [
                'plan_name' => $company->plan?->name,
                'staff_limit' => $company->staffLimit(),
                'staff_count' => $company->staffCount(),
                'at_limit' => $company->hasReachedStaffLimit(),
            ],
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
        ]);

        User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => User::ROLE_STAFF,
            'company_id' => $company->id,
        ]);

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