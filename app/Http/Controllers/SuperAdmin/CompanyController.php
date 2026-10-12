<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class CompanyController extends Controller
{
    public function index()
    {
        return Inertia::render('SuperAdmin/Companies', [
            'companies' => Company::query()
                ->withCount(['staff', 'admins', 'attendances'])
                ->with([
                    'admins:id,company_id,name,email',
                    'plan:id,name,staff_limit,price',
                ])
                ->orderBy('name')
                ->get(),
            'plans' => SubscriptionPlan::query()
                ->orderBy('sort_order')
                ->get(['id', 'name', 'staff_limit', 'price', 'is_active']),
            'defaults' => [
                'office_name' => config('attendance.office_name'),
                'latitude' => config('attendance.latitude'),
                'longitude' => config('attendance.longitude'),
                'radius_meters' => config('attendance.radius_meters'),
                'late_after' => config('attendance.late_after'),
                'timezone' => config('attendance.timezone'),
                'max_accuracy_meters' => config('attendance.max_accuracy_meters'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'office_name' => ['required', 'string', 'max:255'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'radius_meters' => ['required', 'integer', 'between:10,10000'],
            'late_after' => ['required', 'date_format:H:i'],
            'timezone' => ['required', 'string', 'max:64', 'timezone'],
            'max_accuracy_meters' => ['required', 'integer', 'between:10,500'],
            'subscription_plan_id' => ['nullable', 'integer', Rule::exists('subscription_plans', 'id')],

            'admin_name' => ['required', 'string', 'max:255'],
            'admin_email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'admin_password' => ['required', 'string', Password::min(6)],
        ]);

        DB::transaction(function () use ($data) {
            $company = Company::create([
                'name' => $data['name'],
                'office_name' => $data['office_name'],
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
                'radius_meters' => $data['radius_meters'],
                'late_after' => $data['late_after'],
                'timezone' => $data['timezone'],
                'max_accuracy_meters' => $data['max_accuracy_meters'],
                'is_active' => true,
                'subscription_plan_id' => $data['subscription_plan_id'] ?? null,
                'subscription_status' => 'active',
                'subscription_starts_at' => now()->toDateString(),
            ]);

            User::create([
                'name' => $data['admin_name'],
                'email' => $data['admin_email'],
                'password' => $data['admin_password'],
                'role' => User::ROLE_ADMIN,
                'company_id' => $company->id,
            ]);
        });

        return back()->with('message', 'Company and admin account created.');
    }

    public function updateSubscription(Request $request, Company $company)
    {
        $data = $request->validate([
            'subscription_plan_id' => ['nullable', 'integer', Rule::exists('subscription_plans', 'id')],
            'subscription_status' => ['required', Rule::in(['active', 'trialing', 'expired', 'cancelled'])],
            'subscription_starts_at' => ['nullable', 'date'],
            'subscription_ends_at' => ['nullable', 'date', 'after_or_equal:subscription_starts_at'],
        ]);

        $company->update($data);

        return back()->with('message', 'Subscription updated.');
    }

    public function toggle(Company $company)
    {
        $company->update(['is_active' => ! $company->is_active]);

        return back()->with('message', 'Company status updated.');
    }

    public function destroy(Company $company)
    {
        $company->delete();

        return back()->with('message', 'Company deleted.');
    }
}