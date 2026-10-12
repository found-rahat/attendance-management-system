<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\LandingFaq;
use App\Models\LandingFeature;
use App\Models\SiteContent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SiteController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('SuperAdmin/Site', [
            'site' => SiteContent::allWithDefaults(),
            'features' => LandingFeature::query()->ordered()->get(),
            'faqs' => LandingFaq::query()->ordered()->get(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'brand_name' => ['nullable', 'string', 'max:255'],
            'hero_title' => ['nullable', 'string', 'max:255'],
            'hero_subtitle' => ['nullable', 'string', 'max:1000'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:255'],
            'contact_address' => ['nullable', 'string', 'max:255'],
            'cta_heading' => ['nullable', 'string', 'max:255'],
            'cta_subtext' => ['nullable', 'string', 'max:1000'],
            'footer_text' => ['nullable', 'string', 'max:255'],
        ]);

        $content = SiteContent::current();

        foreach (SiteContent::COLUMNS as $column) {
            $content->{$column} = $data[$column] ?? null;
        }

        $content->save();

        return back()->with('message', 'Website content updated.');
    }
}