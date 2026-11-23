<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OfficeSettingsController extends Controller
{
    private function company(Request $request): Company
    {
        $company = $request->user()->company;

        abort_if($company === null, 403, 'No company assigned to this account.');

        return $company;
    }

    public function index(Request $request)
    {
        $company = $this->company($request);

        return Inertia::render('Admin/OfficeSettings', [
            'settings' => $this->payload($company),
        ]);
    }

    public function update(Request $request)
    {
        $company = $this->company($request);

        $data = $request->validate([
            'office_name' => ['required', 'string', 'max:255'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'radius_meters' => ['required', 'integer', 'between:10,10000'],
            'late_after' => ['required', 'date_format:H:i'],
            'exit_time' => ['nullable', 'date_format:H:i'],
            'timezone' => ['required', 'string', 'max:64', 'timezone'],
            'max_accuracy_meters' => ['nullable', 'integer', 'between:10,500'],
        ]);

        $data['exit_time'] = $data['exit_time'] ?? $company->exit_time ?? config('attendance.exit_time', '18:00');

        $company->update($data);

        return back()->with('message', 'Office settings updated successfully.');
    }

    private function payload(Company $company): array
    {
        return [
            'office_name' => $company->office_name,
            'latitude' => $company->latitude,
            'longitude' => $company->longitude,
            'radius_meters' => $company->radius_meters,
            'late_after' => $company->late_after,
            'exit_time' => $company->exit_time,
            'timezone' => $company->timezone,
            'max_accuracy_meters' => $company->max_accuracy_meters,
        ];
    }
}