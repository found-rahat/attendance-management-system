<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\StaffAttendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    private User $staff;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::create([
            'name' => 'Test Co',
            'office_name' => 'Test Office',
            'latitude' => 23.7937,
            'longitude' => 90.4066,
            'radius_meters' => 100,
            'late_after' => '23:59',
            'timezone' => 'Asia/Dhaka',
            'max_accuracy_meters' => 100,
            'is_active' => true,
        ]);

        $this->staff = User::factory()->create([
            'role' => 'staff',
            'name' => 'Rahim',
            'email' => 'rahim@test.test',
            'company_id' => $this->company->id,
        ]);
    }

    private function admin(?Company $company = null): User
    {
        return User::factory()->create([
            'role' => 'admin',
            'company_id' => ($company ?? $this->company)->id,
        ]);
    }

    public function test_check_in_inside_geofence_is_accepted(): void
    {
        $this->actingAs($this->staff)
            ->postJson('/attendance/check-in', [
                'latitude' => 23.7937,
                'longitude' => 90.4066,
                'accuracy' => 12,
            ])
            ->assertOk()
            ->assertJsonFragment(['message' => 'Check In successful.']);

        $this->assertDatabaseHas('staff_attendances', [
            'staff_id' => $this->staff->id,
            'company_id' => $this->company->id,
            'status' => 'present',
            'check_in_distance' => 0,
        ]);
    }

    public function test_check_in_outside_geofence_is_allowed_and_flagged(): void
    {
        $this->actingAs($this->staff)
            ->postJson('/attendance/check-in', [
                'latitude' => 23.8200,
                'longitude' => 90.4200,
                'accuracy' => 12,
            ])
            ->assertOk()
            ->assertJsonFragment(['message' => 'Check In successful.']);

        $this->assertDatabaseHas('staff_attendances', [
            'staff_id' => $this->staff->id,
            'check_in_outside' => true,
        ]);
    }

    public function test_poor_gps_accuracy_is_allowed_and_recorded(): void
    {
        $this->actingAs($this->staff)
            ->postJson('/attendance/check-in', [
                'latitude' => 23.7937,
                'longitude' => 90.4066,
                'accuracy' => 250,
            ])
            ->assertOk()
            ->assertJsonFragment(['message' => 'Check In successful.']);

        $this->assertDatabaseHas('staff_attendances', [
            'staff_id' => $this->staff->id,
            'check_in_accuracy' => 250,
        ]);
    }

    public function test_duplicate_check_in_is_blocked(): void
    {
        StaffAttendance::create([
            'company_id' => $this->company->id,
            'staff_id' => $this->staff->id,
            'date' => now('Asia/Dhaka')->toDateString(),
            'check_in_at' => now('Asia/Dhaka'),
            'check_in_latitude' => 23.7937,
            'check_in_longitude' => 90.4066,
            'check_in_distance' => 0,
        ]);

        $this->actingAs($this->staff)
            ->postJson('/attendance/check-in', [
                'latitude' => 23.7937,
                'longitude' => 90.4066,
                'accuracy' => 10,
            ])
            ->assertUnprocessable()
            ->assertJsonStructure(['errors' => ['attendance']]);
    }

    public function test_check_out_requires_check_in_and_flags_outside_location(): void
    {
        $this->actingAs($this->staff)
            ->postJson('/attendance/check-out', [
                'latitude' => 23.7937,
                'longitude' => 90.4066,
                'accuracy' => 10,
            ])
            ->assertUnprocessable()
            ->assertJsonStructure(['errors' => ['attendance']]);

        $this->actingAs($this->staff)
            ->postJson('/attendance/check-in', [
                'latitude' => 23.7937,
                'longitude' => 90.4066,
                'accuracy' => 10,
            ])
            ->assertOk();

        $this->actingAs($this->staff)
            ->postJson('/attendance/check-out', [
                'latitude' => 23.8200,
                'longitude' => 90.4200,
                'accuracy' => 10,
            ])
            ->assertOk()
            ->assertJsonFragment(['message' => 'Check Out successful.']);

        $record = StaffAttendance::where('staff_id', $this->staff->id)->first();
        $this->assertNotNull($record->check_out_at);
        $this->assertTrue($record->check_out_outside);
    }

    public function test_role_middleware_blocks_staff_from_admin_area(): void
    {
        $this->actingAs($this->staff)
            ->get('/admin/attendance-report')
            ->assertForbidden();

        $this->actingAs($this->staff)
            ->get('/super/dashboard')
            ->assertForbidden();

        $this->actingAs($this->admin())
            ->get('/admin/attendance-report')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/AttendanceReport'));

        $this->actingAs($this->admin())
            ->get('/super/dashboard')
            ->assertForbidden();
    }

    public function test_check_in_after_late_threshold_is_marked_late(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-01-15 20:00:00', 'Asia/Dhaka'));
        $this->company->update(['late_after' => '09:15']);

        $this->actingAs($this->staff)
            ->postJson('/attendance/check-in', [
                'latitude' => 23.7937,
                'longitude' => 90.4066,
                'accuracy' => 12,
            ])
            ->assertOk();

        $this->assertDatabaseHas('staff_attendances', [
            'staff_id' => $this->staff->id,
            'status' => 'late',
        ]);

        Carbon::setTestNow();
    }

    public function test_admin_can_view_and_update_company_office_settings(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)
            ->get('/admin/settings')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/OfficeSettings'));

        $this->actingAs($admin)
            ->put('/admin/settings', [
                'office_name' => 'New Office',
                'latitude' => 23.8103,
                'longitude' => 90.4125,
                'radius_meters' => 250,
                'late_after' => '10:00',
                'timezone' => 'Asia/Dhaka',
                'max_accuracy_meters' => 80,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('companies', [
            'id' => $this->company->id,
            'office_name' => 'New Office',
            'radius_meters' => 250,
        ]);
    }

    public function test_admin_only_sees_their_own_company_records(): void
    {
        $other = Company::create([
            'name' => 'Other Co',
            'office_name' => 'Other Office',
            'latitude' => 1.0,
            'longitude' => 1.0,
            'radius_meters' => 100,
            'late_after' => '09:15',
            'timezone' => 'Asia/Dhaka',
            'max_accuracy_meters' => 100,
        ]);

        $otherStaff = User::factory()->create([
            'role' => 'staff',
            'company_id' => $other->id,
        ]);

        StaffAttendance::create([
            'company_id' => $this->company->id,
            'staff_id' => $this->staff->id,
            'date' => now()->toDateString(),
        ]);

        StaffAttendance::create([
            'company_id' => $other->id,
            'staff_id' => $otherStaff->id,
            'date' => now()->toDateString(),
        ]);

        $this->actingAs($this->admin())
            ->get('/admin/attendance-report')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/AttendanceReport')
                ->has('rows.data', 1)
            );
    }

    public function test_super_admin_can_create_a_company_with_admin(): void
    {
        $super = User::factory()->create(['role' => 'super_admin', 'company_id' => null]);

        $this->actingAs($super)
            ->get('/super/companies')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('SuperAdmin/Companies'));

        $this->actingAs($super)
            ->post('/super/companies', [
                'name' => 'Gamma Ltd',
                'office_name' => 'Gamma HQ',
                'latitude' => 23.75,
                'longitude' => 90.39,
                'radius_meters' => 120,
                'late_after' => '09:00',
                'timezone' => 'Asia/Dhaka',
                'max_accuracy_meters' => 100,
                'admin_name' => 'Gamma Admin',
                'admin_email' => 'admin@gamma.test',
                'admin_password' => 'password',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('companies', ['name' => 'Gamma Ltd']);

        $company = Company::where('name', 'Gamma Ltd')->first();
        $this->assertDatabaseHas('users', [
            'email' => 'admin@gamma.test',
            'role' => 'admin',
            'company_id' => $company->id,
        ]);
    }

    public function test_staff_without_company_cannot_check_in(): void
    {
        $orphan = User::factory()->create([
            'role' => 'staff',
            'company_id' => null,
        ]);

        $this->actingAs($orphan)
            ->get('/attendance')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('AccountSuspended'));

        $this->actingAs($orphan)
            ->postJson('/attendance/check-in', [
                'latitude' => 23.7937,
                'longitude' => 90.4066,
                'accuracy' => 10,
            ])
            ->assertOk()
            ->assertHeader('content-type', 'text/html; charset=UTF-8');
    }

    public function test_history_page_returns_paginated_records(): void
    {
        StaffAttendance::create([
            'company_id' => $this->company->id,
            'staff_id' => $this->staff->id,
            'date' => now('Asia/Dhaka')->subDay()->toDateString(),
            'check_in_at' => now('Asia/Dhaka')->subDay(),
        ]);

        $this->actingAs($this->staff)
            ->get('/attendance/history')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Staff/History'));
    }
}
