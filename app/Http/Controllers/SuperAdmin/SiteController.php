<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\LandingFaq;
use App\Models\LandingFeature;
use App\Models\SiteContent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
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
            if (in_array($column, SiteContent::LOGO_COLUMNS, true)) {
                continue;
            }

            if ($request->has($column)) {
                $content->{$column} = $data[$column] ?? null;
            }
        }

        $content->save();

        return back()->with('message', 'Website content updated.');
    }

    public function updateLogos(Request $request): RedirectResponse
    {
        $request->validate([
            'logo_dark' => ['nullable', 'file', 'mimes:png,jpg,jpeg,svg,webp', 'max:2048'],
            'logo_light' => ['nullable', 'file', 'mimes:png,jpg,jpeg,svg,webp', 'max:2048'],
            'favicon' => ['nullable', 'file', 'mimes:ico,png,jpg,jpeg,svg,webp', 'max:2048'],
        ]);

        $content = SiteContent::current();

        foreach (SiteContent::LOGO_COLUMNS as $field) {
            if ($request->boolean('remove_'.$field)) {
                $this->deleteLogo($content->{$field});
                $content->{$field} = null;
            }

            if ($request->hasFile($field)) {
                $this->deleteLogo($content->{$field});
                $content->{$field} = $this->storeLogo($request->file($field));
            }
        }

        $content->save();

        return back()->with('message', 'Logo updated.');
    }

    private function storeLogo(UploadedFile $file): string
    {
        $directory = public_path('uploads/logos');

        if (! is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        $filename = Str::random(24).'.'.strtolower($file->getClientOriginalExtension());
        $file->move($directory, $filename);

        return '/uploads/logos/'.$filename;
    }

    private function deleteLogo(?string $path): void
    {
        if (! $path || ! str_starts_with($path, '/uploads/logos/')) {
            return;
        }

        $full = public_path(ltrim($path, '/'));

        if (is_file($full)) {
            @unlink($full);
        }
    }
}