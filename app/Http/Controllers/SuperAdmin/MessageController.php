<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MessageController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('SuperAdmin/Messages', [
            'messages' => ContactMessage::query()
                ->orderByRaw('read_at is null desc, created_at desc')
                ->get(),
            'unread_count' => ContactMessage::query()->whereNull('read_at')->count(),
        ]);
    }

    public function markRead(ContactMessage $message): RedirectResponse
    {
        if ($message->read_at === null) {
            $message->update(['read_at' => now()]);
        }

        return back();
    }

    public function destroy(ContactMessage $message): RedirectResponse
    {
        $message->delete();

        return back()->with('message', 'Message deleted.');
    }
}