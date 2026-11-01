<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Carbon\Carbon;
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
            'max_accuracy_meters' => ['nullable', 'integer', 'between:10,500'],
            'subscription_plan_id' => ['nullable', 'integer', Rule::exists('subscription_plans', 'id')],
            'staff_limit_override' => ['nullable', 'integer', 'min:0'],
            'subscription_amount_override' => ['nullable', 'numeric', 'min:0'],

            'admin_name' => ['required', 'string', 'max:255'],
            'admin_email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'admin_password' => ['required', 'string', Password::min(6)],
        ]);

        $plan = isset($data['subscription_plan_id'])
            ? SubscriptionPlan::find($data['subscription_plan_id'])
            : null;
        $startsAt = now()->startOfDay();

        DB::transaction(function () use ($data, $plan, $startsAt) {
            $company = Company::create([
                'name' => $data['name'],
                'office_name' => $data['office_name'],
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
                'radius_meters' => $data['radius_meters'],
                'late_after' => $data['late_after'],
                'timezone' => $data['timezone'],
                'max_accuracy_meters' => $data['max_accuracy_meters'] ?? null,
                'is_active' => true,
                'subscription_plan_id' => $data['subscription_plan_id'] ?? null,
                'subscription_status' => 'active',
                'subscription_starts_at' => $startsAt->toDateString(),
                'subscription_ends_at' => $plan?->periodEnd($startsAt)->toDateString(),
                'staff_limit_override' => $data['staff_limit_override'] ?? null,
                'subscription_amount_override' => $data['subscription_amount_override'] ?? null,
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
            'staff_limit_override' => ['nullable', 'integer', 'min:0'],
            'subscription_amount_override' => ['nullable', 'numeric', 'min:0'],
        ]);

        // Assigning a plan starts a fresh billing period: unless an explicit
        // end date is supplied, derive it from the plan's billing cycle so a
        // monthly plan automatically expires after one month.
        if (! empty($data['subscription_plan_id']) && empty($data['subscription_ends_at'])) {
            $plan = SubscriptionPlan::find($data['subscription_plan_id']);
            $startsAt = ! empty($data['subscription_starts_at'])
                ? Carbon::parse($data['subscription_starts_at'])->startOfDay()
                : now()->startOfDay();

            $data['subscription_starts_at'] = $startsAt->toDateString();
            $data['subscription_ends_at'] = $plan?->periodEnd($startsAt)->toDateString();
        }

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