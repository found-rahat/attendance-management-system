<?php

namespace App\Http\Middleware;

use App\Models\SiteContent;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EnsureCompanyActive
{
    /**
     * Blocks staff and admin users whose company has been disabled or whose
     * subscription is inactive / expired. Super admins are unaffected.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if ($user === null || $user->isSuperAdmin()) {
            return $next($request);
        }

        $company = $user->company;

        if ($company !== null && $company->is_active && $company->isSubscriptionActive()) {
            return $next($request);
        }

        return Inertia::render('AccountSuspended', [
            'reason' => $company !== null && ! $company->is_active
                ? 'company_disabled'
                : 'subscription_inactive',
            'company_name' => $company?->name,
            'is_active' => $company?->is_active ?? false,
            'subscription_status' => $company?->subscription_status,
            'subscription_ends_at' => $company?->subscription_ends_at?->toDateString(),
            'contact_email' => SiteContent::get(
                'contact_email',
                config('site.defaults.contact_email'),
            ),
            'site' => SiteContent::landing(),
        ]);
    }
}