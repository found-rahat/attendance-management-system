<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\StaffAttendance;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    private function company(Request $request): Company
    {
        $company = $request->user()->company;

        abort_if($company === null, 403, 'No company assigned to this account.');
        abort_unless($company->is_active, 403, 'This company is inactive.');

        return $company;
    }

    private function today(Company $company): string
    {
        return Carbon::now($company->timezone)->toDateString();
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
        ];
    }

    public function index(Request $request)
    {
        $company = $this->company($request);

        $attendance = StaffAttendance::query()
            ->where('staff_id', $request->user()->id)
            ->whereDate('date', $this->today($company))
            ->first();

        return Inertia::render('Staff/Attendance', [
            'attendance' => $attendance,
            'office' => $company->office(),
        ]);
    }

    public function checkIn(Request $request)
    {
        $company = $this->company($request);
        $location = $this->validatedLocation($request, $company);

        try {
            $attendance = DB::transaction(function () use ($location, $company, $request) {
                $now = Carbon::now();
                $date = $this->today($company);

                $row = StaffAttendance::query()
                    ->where('staff_id', $request->user()->id)
                    ->whereDate('date', $date)
                    ->lockForUpdate()
                    ->first();

                if ($row && $row->check_in_at) {
                    throw ValidationException::withMessages([
                        'attendance' => 'আজকের Check In ইতিমধ্যে সম্পন্ন হয়েছে।',
                    ]);
                }

                $lateAfter = Carbon::parse(
                    $date.' '.$company->late_after,
                    $company->timezone,
                );

                $values = [
                    'check_in_at' => $now,
                    'check_in_latitude' => $location['latitude'],
                    'check_in_longitude' => $location['longitude'],
                    'check_in_accuracy' => (int) ceil($location['accuracy']),
                    'check_in_distance' => $location['distance'],
                    'check_in_outside' => $location['outside'],
                    'status' => $now->greaterThan($lateAfter) ? 'late' : 'present',
                ];

                if ($row) {
                    $row->update($values);

                    return $row->fresh();
                }

                return StaffAttendance::create(array_merge($values, [
                    'company_id' => $company->id,
                    'staff_id' => $request->user()->id,
                    'date' => $date,
                ]));
            });
        } catch (QueryException $e) {
            if ($e->getCode() === '23000') {
                throw ValidationException::withMessages([
                    'attendance' => 'আজকের Check In ইতিমধ্যে সম্পন্ন হয়েছে।',
                ]);
            }

            throw $e;
        }

        return response()->json([
            'message' => 'Check In successful.',
            'attendance' => $attendance,
        ]);
    }

    public function checkOut(Request $request)
    {
        $company = $this->company($request);
        $location = $this->validatedLocation($request, $company);

        $attendance = DB::transaction(function () use ($location, $company, $request) {
            $row = StaffAttendance::query()
                ->where('staff_id', $request->user()->id)
                ->whereDate('date', $this->today($company))
                ->lockForUpdate()
                ->first();

            if (! $row || ! $row->check_in_at) {
                throw ValidationException::withMessages([
                    'attendance' => 'আগে Check In করতে হবে।',
                ]);
            }

            if ($row->check_out_at) {
                throw ValidationException::withMessages([
                    'attendance' => 'আজকের Check Out ইতিমধ্যে সম্পন্ন হয়েছে।',
                ]);
            }

            $now = Carbon::now();

            if ($now->lessThan($row->check_in_at)) {
                throw ValidationException::withMessages([
                    'attendance' => 'Check Out time সঠিক নয়।',
                ]);
            }

            $lateAfter = Carbon::parse(
                $this->today($company).' '.$company->late_after,
                $company->timezone,
            );

            $status = $row->check_in_at->greaterThan($lateAfter) ? 'late' : 'present';

            if ($company->exit_time) {
                $exitAt = Carbon::parse(
                    $this->today($company).' '.$company->exit_time,
                    $company->timezone,
                );

                if ($now->lessThan($exitAt)) {
                    $status = 'early_leave';
                }
            }

            $row->update([
                'check_out_at' => $now,
                'check_out_latitude' => $location['latitude'],
                'check_out_longitude' => $location['longitude'],
                'check_out_accuracy' => (int) ceil($location['accuracy']),
                'check_out_distance' => $location['distance'],
                'check_out_outside' => $location['outside'],
                'status' => $status,
            ]);

            return $row->fresh();
        });

        return response()->json([
            'message' => 'Check Out successful.',
            'attendance' => $attendance,
        ]);
    }

    public function history(Request $request)
    {
        $company = $this->company($request);

        $data = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        return Inertia::render('Staff/History', [
            'office' => $company->office(),
            'records' => StaffAttendance::query()
                ->where('staff_id', $request->user()->id)
                ->when($data['from'] ?? null, fn ($q, $from) =>
                    $q->whereDate('date', '>=', $from))
                ->when($data['to'] ?? null, fn ($q, $to) =>
                    $q->whereDate('date', '<=', $to))
                ->orderByDesc('date')
                ->paginate(20)
                ->withQueryString(),
            'filters' => [
                'from' => $data['from'] ?? null,
                'to' => $data['to'] ?? null,
            ],
        ]);
    }
}
