<?php

namespace Tests\Feature;

use App\Models\Bonus;
use App\Models\BonusType;
use App\Models\Company;
use App\Models\Designation;
use App\Models\LoanCategory;
use App\Models\ProvidentFund;
use App\Models\ProvidentFundType;
use App\Models\SalaryDeduction;
use App\Models\SalarySheet;
use App\Models\StaffLoan;
use App\Models\StaffSalary;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SalaryTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    private User $admin;

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

        $this->admin = User::factory()->create([
            'role' => 'admin',
            'company_id' => $this->company->id,
        ]);

        $this->staff = User::factory()->create([
            'role' => 'staff',
            'name' => 'Rahim',
            'email' => 'rahim@test.test',
            'company_id' => $this->company->id,
            'designation' => 'Teacher',
        ]);
    }

    public function test_admin_can_set_staff_salary(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/salary', [
                'staff_id' => $this->staff->id,
                'basic_salary' => 20000,
                'house_rent' => 8000,
                'medical_allowance' => 2000,
                'transport_allowance' => 1000,
                'special_allowance' => 0,
                'effective_from' => '2026-09-01',
            ])
            ->assertRedirect();

        $this->assertEquals(1, StaffSalary::count());

        $salary = StaffSalary::firstOrFail();
        $this->assertEquals(31000, $salary->gross());
    }

    public function test_admin_can_promote_staff(): void
    {
        StaffSalary::create([
            'company_id' => $this->company->id,
            'staff_id' => $this->staff->id,
            'basic_salary' => 20000,
            'effective_from' => '2026-09-01',
        ]);

        $this->actingAs($this->admin)
            ->post('/admin/salary/promote', [
                'staff_id' => $this->staff->id,
                'designation_id' => Designation::create([
                    'company_id' => $this->company->id,
                    'name' => 'Senior Teacher',
                ])->id,
                'new_salary' => 25000,
                'effective_from' => '2026-10-01',
            ])
            ->assertRedirect();

        $this->assertEquals('Senior Teacher', $this->staff->fresh()->designation);
        $this->assertEquals(1, $this->staff->fresh()->promotions()->count());
    }

    public function test_generating_sheet_includes_earnings_and_deductions(): void
    {
        StaffSalary::create([
            'company_id' => $this->company->id,
            'staff_id' => $this->staff->id,
            'basic_salary' => 20000,
            'house_rent' => 8000,
            'medical_allowance' => 2000,
            'transport_allowance' => 1000,
            'effective_from' => '2026-09-01',
        ]);

        $pfType = ProvidentFundType::create([
            'company_id' => $this->company->id,
            'name' => 'General PF',
            'employee_percent' => 5,
            'employer_percent' => 5,
        ]);
        ProvidentFund::create([
            'company_id' => $this->company->id,
            'staff_id' => $this->staff->id,
            'provident_fund_type_id' => $pfType->id,
            'enrolled_at' => '2026-09-01',
        ]);

        $bonusType = BonusType::create([
            'company_id' => $this->company->id,
            'name' => 'Eid Bonus',
            'amount_type' => 'fixed',
            'fixed_amount' => 3000,
        ]);
        Bonus::create([
            'company_id' => $this->company->id,
            'staff_id' => $this->staff->id,
            'bonus_type_id' => $bonusType->id,
            'amount' => 3000,
            'month' => '2026-10',
        ]);

        SalaryDeduction::create([
            'company_id' => $this->company->id,
            'staff_id' => $this->staff->id,
            'amount' => 500,
            'reason' => 'Absent fine',
            'month' => '2026-10',
        ]);

        $this->actingAs($this->admin)
            ->post('/admin/salary/sheet/generate', ['month' => '2026-10'])
            ->assertRedirect()
            ->assertSessionHas('message');

        $sheet = SalarySheet::where('staff_id', $this->staff->id)->where('month', '2026-10')->firstOrFail();

        $this->assertEquals(20000, (float) $sheet->basic);
        $this->assertEquals(3000, (float) $sheet->bonus);
        $this->assertEquals(1000, (float) $sheet->pf_employee);
        $this->assertEquals(1000, (float) $sheet->pf_employer);
        $this->assertEquals(500, (float) $sheet->manual_deduction);
        $this->assertEquals(1500, (float) $sheet->pf_employee + (float) $sheet->manual_deduction);
        $this->assertEquals(34000, (float) $sheet->total_earning);
    }

    public function test_monthly_loan_installment_is_deducted_only_once_per_month(): void
    {
        StaffSalary::create([
            'company_id' => $this->company->id,
            'staff_id' => $this->staff->id,
            'basic_salary' => 20000,
            'effective_from' => '2026-09-01',
        ]);

        $category = LoanCategory::advanceFor($this->company->id);

        $loan = StaffLoan::create([
            'company_id' => $this->company->id,
            'staff_id' => $this->staff->id,
            'loan_category_id' => $category->id,
            'amount' => 10000,
            'installment_amount' => 2000,
            'total_installments' => 5,
            'remaining' => 10000,
            'granted_at' => '2026-10-01',
            'status' => 'ongoing',
        ]);

        $this->actingAs($this->admin)
            ->post('/admin/salary/sheet/generate', ['month' => '2026-10'])
            ->assertRedirect();

        $sheet = SalarySheet::where('staff_id', $this->staff->id)->where('month', '2026-10')->firstOrFail();
        $this->assertEquals(2000, (float) $sheet->loan_installment);
        $this->assertEquals(8000, (float) $loan->fresh()->remaining);

        // Regenerating the same month must not deduct again.
        $this->actingAs($this->admin)
            ->post('/admin/salary/sheet/generate', ['month' => '2026-10'])
            ->assertRedirect();

        $this->assertEquals(8000, (float) $loan->fresh()->remaining);
    }

    public function test_sheet_flow_draft_approved_paid(): void
    {
        StaffSalary::create([
            'company_id' => $this->company->id,
            'staff_id' => $this->staff->id,
            'basic_salary' => 20000,
            'effective_from' => '2026-09-01',
        ]);

        $this->actingAs($this->admin)
            ->post('/admin/salary/sheet/generate', ['month' => '2026-10'])
            ->assertRedirect();

        $sheet = SalarySheet::where('staff_id', $this->staff->id)->where('month', '2026-10')->firstOrFail();
        $this->assertEquals('draft', $sheet->status);

        $this->actingAs($this->admin)
            ->post("/admin/salary/sheet/{$sheet->id}/approve")
            ->assertRedirect();

        $this->assertEquals('approved', $sheet->fresh()->status);

        $this->actingAs($this->admin)
            ->post("/admin/salary/sheet/{$sheet->id}/pay")
            ->assertRedirect();

        $this->assertEquals('paid', $sheet->fresh()->status);
        $this->assertNotNull($sheet->fresh()->paid_at);
    }

    public function test_staff_cannot_access_salary_pages(): void
    {
        $this->actingAs($this->staff)
            ->get('/admin/salary')
            ->assertForbidden();
    }

    public function test_another_companys_admin_cannot_see_or_edit_salaries(): void
    {
        $other = Company::create([
            'name' => 'Other Co',
            'office_name' => 'Other Office',
            'latitude' => 23.7,
            'longitude' => 90.4,
            'radius_meters' => 100,
            'late_after' => '23:59',
            'timezone' => 'Asia/Dhaka',
            'max_accuracy_meters' => 100,
            'is_active' => true,
        ]);
        $otherAdmin = User::factory()->create([
            'role' => 'admin',
            'company_id' => $other->id,
        ]);

        StaffSalary::create([
            'company_id' => $this->company->id,
            'staff_id' => $this->staff->id,
            'basic_salary' => 20000,
            'effective_from' => '2026-09-01',
        ]);

        $this->actingAs($otherAdmin)
            ->post('/admin/salary', [
                'staff_id' => $this->staff->id,
                'basic_salary' => 500,
                'effective_from' => '2026-10-01',
            ])
            ->assertSessionHasErrors('staff_id');
    }
}
