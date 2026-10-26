<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\LandingFaq;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SiteFaqController extends Controller
{
    public function index()
    {
        return LandingFaq::query()->ordered()->get();
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'question' => ['required', 'string', 'max:255'],
            'answer' => ['required', 'string', 'max:2000'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        LandingFaq::create([
            'question' => $data['question'],
            'answer' => $data['answer'],
            'sort_order' => $data['sort_order']
                ?? (LandingFaq::query()->max('sort_order') + 1),
        ]);

        return back()->with('message', 'FAQ added.');
    }

    public function update(Request $request, LandingFaq $faq): RedirectResponse
    {
        $data = $request->validate([
            'question' => ['required', 'string', 'max:255'],
            'answer' => ['required', 'string', 'max:2000'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $faq->update([
            'question' => $data['question'],
            'answer' => $data['answer'],
            'sort_order' => $data['sort_order'] ?? $faq->sort_order,
        ]);

        return back()->with('message', 'FAQ updated.');
    }

    public function destroy(LandingFaq $faq): RedirectResponse
    {
        $faq->delete();

        return back()->with('message', 'FAQ removed.');
    }
}