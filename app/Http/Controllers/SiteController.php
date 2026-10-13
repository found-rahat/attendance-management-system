<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\SiteContent;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class SiteController extends Controller
{
    public function home(): Response
    {
        return Inertia::render('Landing', [
            'plans' => $this->plans(),
            'site' => SiteContent::landing(),
        ]);
    }

    public function pricing(): Response
    {
        return Inertia::render('Pricing', [
            'plans' => $this->plans(),
            'site' => SiteContent::landing(),
            'stats' => [
                'companies' => Company::query()->count(),
                'staff' => User::query()->where('role', User::ROLE_STAFF)->count(),
            ],
        ]);
    }

    /**
     * @return Collection<int, SubscriptionPlan>
     */
    private function plans(): Collection
    {
        return SubscriptionPlan::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('price')
            ->get();
    }
}