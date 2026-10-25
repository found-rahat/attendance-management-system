<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Designation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DesignationTest extends TestCase
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

    public function test_admin_can_create_designation(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/designations', ['name' => 'Teacher'])
            ->assertRedirect();

        $this->assertDatabaseHas('designations', [
            'company_id' => $this->company->id,
            'name' => 'Teacher',
        ]);
    }

    public function test_duplicate_designation_name_is_rejected_within_company(): void
    {
        Designation::create(['company_id' => $this->company->id, 'name' => 'Teacher']);

        $this->actingAs($this->admin)
            ->post('/admin/designations', ['name' => 'Teacher'])
            ->assertSessionHasErrors('name');

        $this->assertSame(1, Designation::count());
    }

    public function test_designation_with_assigned_staff_cannot_be_deleted(): void
    {
        $designation = Designation::create(['company_id' => $this->company->id, 'name' => 'Manager']);
        User::factory()->create([
            'role' => 'staff',
            'company_id' => $this->company->id,
            'designation_id' => $designation->id,
        ]);

        $this->actingAs($this->admin)
            ->delete("/admin/designations/{$designation->id}")
            ->assertStatus(422);

        $this->assertDatabaseHas('designations', ['id' => $designation->id]);
    }

    public function test_admin_can_delete_unused_designation(): void
    {
        $designation = Designation::create(['company_id' => $this->company->id, 'name' => 'Unused']);

        $this->actingAs($this->admin)
            ->delete("/admin/designations/{$designation->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('designations', ['id' => $designation->id]);
    }

    public function test_another_companys_designation_cannot_be_edited(): void
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
        $designation = Designation::create(['company_id' => $other->id, 'name' => 'Foreign']);

        $this->actingAs($this->admin)
            ->put("/admin/designations/{$designation->id}", ['name' => 'Hacked', 'is_active' => true])
            ->assertForbidden();
    }

    public function test_staff_cannot_access_designations_page(): void
    {
        $staff = User::factory()->create([
            'role' => 'staff',
            'company_id' => $this->company->id,
        ]);

        $this->actingAs($staff)
            ->get('/admin/designations')
            ->assertForbidden();
    }
}
