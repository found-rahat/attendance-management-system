<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Designation;
use App\Models\StaffSalary;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaffManagementTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    private User $admin;

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

        $this->admin = User::factory()->create([
            'role' => 'admin',
            'company_id' => $this->company->id,
        ]);
    }

    public function test_staff_is_created_with_designation_office_id_and_salary(): void
    {
        $designation = Designation::create([
            'company_id' => $this->company->id,
            'name' => 'Senior Teacher',
        ]);

        $this->actingAs($this->admin)
            ->post('/admin/staff', [
                'name' => 'Karim',
                'email' => 'karim@test.test',
                'password' => 'secret123',
                'designation_id' => $designation->id,
                'office_id' => 'EMP-001',
                'effective_from' => '2026-10-01',
                'basic_salary' => 20000,
                'house_rent' => 8000,
                'medical_allowance' => 2000,
                'transport_allowance' => 1000,
                'special_allowance' => 0,
            ])
            ->assertRedirect();

        $staff = User::where('email', 'karim@test.test')->firstOrFail();
        $this->assertSame('Senior Teacher', $staff->designation);
        $this->assertSame($designation->id, $staff->designation_id);
        $this->assertSame('EMP-001', $staff->office_id);
        $this->assertTrue($staff->isStaff());
        $this->assertSame($this->company->id, $staff->company_id);

        $salary = StaffSalary::where('staff_id', $staff->id)->firstOrFail();
        $this->assertEquals(31000, $salary->gross());
    }

    public function test_staff_created_without_salary_has_no_salary_record(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/staff', [
                'name' => 'Rafiq',
                'email' => 'rafiq@test.test',
                'password' => 'secret123',
                'office_id' => 'EMP-002',
            ])
            ->assertRedirect();

        $staff = User::where('email', 'rafiq@test.test')->firstOrFail();
        $this->assertSame(0, StaffSalary::where('staff_id', $staff->id)->count());
    }

    public function test_office_id_must_be_unique_within_company(): void
    {
        User::factory()->create([
            'role' => 'staff',
            'company_id' => $this->company->id,
            'office_id' => 'EMP-001',
        ]);

        $this->actingAs($this->admin)
            ->post('/admin/staff', [
                'name' => 'Duplicate',
                'email' => 'dup@test.test',
                'password' => 'secret123',
                'office_id' => 'EMP-001',
            ])
            ->assertSessionHasErrors('office_id');

        $this->assertDatabaseMissing('users', ['email' => 'dup@test.test']);
    }

    public function test_staff_list_shows_designation_office_id_and_salary(): void
    {
        $staff = User::factory()->create([
            'role' => 'staff',
            'name' => 'Halim',
            'company_id' => $this->company->id,
            'designation' => 'Accountant',
            'office_id' => 'EMP-010',
        ]);

        StaffSalary::create([
            'company_id' => $this->company->id,
            'staff_id' => $staff->id,
            'basic_salary' => 15000,
            'effective_from' => '2026-10-01',
        ]);

        $this->actingAs($this->admin)
            ->get('/admin/staff')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Staff')
                ->where('staff.0.office_id', 'EMP-010')
                ->where('staff.0.designation', 'Accountant')
                ->where('staff.0.latest_salary.basic_salary', '15000.00'));
    }
}
