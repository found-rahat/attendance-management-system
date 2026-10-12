<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function index(): Response
    {
        $company = auth()->user()->company;

        $plan = $company->plan;

        return Inertia::render('Admin/Subscription', [
            'company' => [
                'id' => $company->id,
                'name' => $company->name,
                'office_name' => $company->office_name,
            ],
            'plan' => $plan ? [
                'id' => $plan->id,
                'name' => $plan->name,
                'price' => $plan->price,
                'billing_cycle' => $plan->billing_cycle,
                'staff_limit' => $plan->staff_limit,
                'is_unlimited' => $plan->isUnlimited(),
                'features' => $plan->features ?? [],
            ] : null,
            'subscription' => [
                'status' => $company->subscription_status,
                'starts_at' => $company->subscription_starts_at?->toDateString(),
                'ends_at' => $company->subscription_ends_at?->toDateString(),
                'active' => $company->isSubscriptionActive(),
                'days_left' => $company->subscriptionDaysLeft(),
                'staff_count' => $company->staffCount(),
                'staff_limit' => $company->staffLimit(),
            ],
        ]);
    }
}