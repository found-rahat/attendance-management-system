<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\AttendanceSession;
use App\Models\Company;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AttendanceSessionController extends Controller
{
    private function company(Request $request): Company
    {
        $company = $request->user()->company;

        abort_if($company === null, 403, 'No company assigned to this account.');
        abort_unless($company->is_active, 403, 'This company is inactive.');

        return $company;
    }

    private function validatedLocation(Request $request, Company $company): array
    {
        $data = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'accuracy' => ['required', 'numeric', 'min:0'],
        ]);

        $latitude = (float) $data['latitude'];
        $longitude = (float) $data['longitude'];
        $distance = $company->distanceFrom($latitude, $longitude);

        return [
            'latitude' => $latitude,
            'longitude' => $longitude,
            'accuracy' => (float) $data['accuracy'],
            'distance' => round($distance, 2),
            'outside' => $distance > $company->radius_meters,
            'address' => $this->reverseGeocode($latitude, $longitude),
        ];
    }

    private function reverseGeocode(float $lat, float $lng): ?string
    {
        try {
            $response = Http::withHeaders(['User-Agent' => 'AttendanceApp/1.0'])
                ->timeout(5)
                ->get('https://nominatim.openstreetmap.org/reverse', [
                    'format' => 'json',
                    'lat' => $lat,
                    'lon' => $lng,
                ]);

            if ($response->successful()) {
                return $response->json('display_name');
            }
        } catch (\Throwable $e) {
            // ignore
        }

        return null;
    }

    public function index(Request $request)
    {
        $company = $this->company($request);

        $pending = AttendanceSession::query()
            ->where('user_id', $request->user()->id)
            ->where('status', 'pending')
            ->orderByDesc('check_in_at')
            ->get();

        $history = AttendanceSession::query()
            ->where('user_id', $request->user()->id)
            ->where('status', 'completed')
            ->orderByDesc('check_out_at')
            ->limit(50)
            ->get();

        return Inertia::render('Staff/CheckInOut', [
            'office' => $company->office(),
            'pending' => $pending,
            'history' => $history,
        ]);
    }

    public function checkIn(Request $request)
    {
        $company = $this->company($request);

        abort_unless(
            ! AttendanceSession::query()
                ->where('user_id', $request->user()->id)
                ->where('status', 'pending')
                ->exists(),
            422,
            'You already have a pending check-in. Please check out first.',
        );

        $data = $request->validate([
            'check_in_company_name' => ['nullable', 'string', 'max:255'],
            'remarks' => ['nullable', 'string'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'accuracy' => ['required', 'numeric', 'min:0'],
            'photo' => ['nullable', 'image', 'max:5120'],
        ]);

        $location = $this->validatedLocation($request, $company);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('attendance/check-in', 'public');
        }

        $session = AttendanceSession::create([
            'user_id' => $request->user()->id,
            'company_id' => $company->id,
            'check_in_company_name' => $data['check_in_company_name'] ?? null,
            'check_in_at' => Carbon::now(),
            'check_in_latitude' => $location['latitude'],
            'check_in_longitude' => $location['longitude'],
            'check_in_accuracy' => (int) ceil($location['accuracy']),
            'check_in_address' => $location['address'],
            'check_in_photo' => $photoPath,
            'check_in_remarks' => $data['remarks'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Check In successful.',
            'session' => $session,
        ]);
    }

    public function checkOut(Request $request, AttendanceSession $session)
    {
        $company = $this->company($request);

        abort_unless($session->user_id === $request->user()->id, 403);
        abort_unless($session->status === 'pending', 422, 'Session already completed.');

        $data = $request->validate([
            'check_out_company_name' => ['nullable', 'string', 'max:255'],
            'remarks' => ['nullable', 'string'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'accuracy' => ['required', 'numeric', 'min:0'],
            'photo' => ['nullable', 'image', 'max:5120'],
        ]);

        $location = $this->validatedLocation($request, $company);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('attendance/check-out', 'public');
        }

        $session->update([
            'check_out_company_name' => $data['check_out_company_name'] ?? null,
            'check_out_at' => Carbon::now(),
            'check_out_latitude' => $location['latitude'],
            'check_out_longitude' => $location['longitude'],
            'check_out_accuracy' => (int) ceil($location['accuracy']),
            'check_out_address' => $location['address'],
            'check_out_photo' => $photoPath,
            'check_out_remarks' => $data['remarks'] ?? null,
            'status' => 'completed',
        ]);

        return response()->json([
            'message' => 'Check Out successful.',
            'session' => $session->fresh(),
        ]);
    }
}
