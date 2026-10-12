<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\LandingFeature;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SiteFeatureController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'icon' => ['nullable', 'string', 'max:32'],
            'title' => ['required', 'string', 'max:255'],
            'text' => ['required', 'string', 'max:1000'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        LandingFeature::create([
            'icon' => $data['icon'] ?? '⭐',
            'title' => $data['title'],
            'text' => $data['text'],
            'sort_order' => $data['sort_order']
                ?? (LandingFeature::query()->max('sort_order') + 1),
        ]);

        return back()->with('message', 'Feature added.');
    }

    public function update(Request $request, LandingFeature $feature): RedirectResponse
    {
        $data = $request->validate([
            'icon' => ['nullable', 'string', 'max:32'],
            'title' => ['required', 'string', 'max:255'],
            'text' => ['required', 'string', 'max:1000'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $feature->update([
            'icon' => $data['icon'] ?? $feature->icon,
            'title' => $data['title'],
            'text' => $data['text'],
            'sort_order' => $data['sort_order'] ?? $feature->sort_order,
        ]);

        return back()->with('message', 'Feature updated.');
    }

    public function destroy(LandingFeature $feature): RedirectResponse
    {
        $feature->delete();

        return back()->with('message', 'Feature removed.');
    }
}