<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionTest extends TestCase
{
    use RefreshDatabase;

    private function company(array $attributes = []): Company
    {
        return Company::create(array_merge([
            'name' => 'Test Co',
            'office_name' => 'Test Office',
            'latitude' => 23.7937,
            'longitude' => 90.4066,
            'radius_meters' => 100,
            'late_after' => '09:15',
            'timezone' => 'Asia/Dhaka',
            'max_accuracy_meters' => 100,
            'is_active' => true,
        ], $attributes));
    }

    private function plan(array $attributes = []): SubscriptionPlan
    {
        return SubscriptionPlan::create(array_merge([
            'name' => 'Starter',
            'slug' => 'starter',
            'price' => 500,
            'billing_cycle' => 'monthly',
            'staff_limit' => 5,
            'features' => ['5 staff accounts'],
            'is_featured' => false,
            'is_active' => true,
            'sort_order' => 1,
        ], $attributes));
    }

    private function superAdmin(): User
    {
        return User::factory()->create(['role' => 'super_admin', 'company_id' => null]);
    }

    public function test_landing_and_pricing_pages_render_active_plans(): void
    {
        $this->plan(['is_active' => true]);
        $this->plan(['name' => 'Hidden', 'slug' => 'hidden', 'is_active' => false]);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Landing')
                ->has('plans', 1)
                ->has('site.brand_name')
            );

        $this->get('/pricing')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Pricing')
                ->has('plans', 1)
            );
    }

    public function test_super_admin_can_create_update_and_delete_plans(): void
    {
        $super = $this->superAdmin();

        $this->actingAs($super)
            ->post('/super/plans', [
                'name' => 'Growth',
                'price' => 2000,
                'billing_cycle' => 'monthly',
                'staff_limit' => 25,
                'features' => ['25 staff accounts', 'Live map'],
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 2,
            ])
            ->assertRedirect();

        $plan = SubscriptionPlan::where('slug', 'growth')->firstOrFail();
        $this->assertSame(25, $plan->staff_limit);
        $this->assertSame(['25 staff accounts', 'Live map'], $plan->features);

        $this->actingAs($super)
            ->put("/super/plans/{$plan->id}", [
                'name' => 'Growth Plus',
                'price' => 2500,
                'billing_cycle' => 'monthly',
                'staff_limit' => 30,
                'features' => ['30 staff accounts'],
                'is_active' => true,
                'is_featured' => false,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('subscription_plans', [
            'id' => $plan->id,
            'name' => 'Growth Plus',
            'staff_limit' => 30,
        ]);

        $this->actingAs($super)
            ->delete("/super/plans/{$plan->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('subscription_plans', ['id' => $plan->id]);
    }

    public function test_super_admin_can_assign_subscription_to_company(): void
    {
        $super = $this->superAdmin();
        $plan = $this->plan();
        $company = $this->company();

        $this->actingAs($super)
            ->patch("/super/companies/{$company->id}/subscription", [
                'subscription_plan_id' => $plan->id,
                'subscription_status' => 'active',
                'subscription_starts_at' => '2026-01-01',
                'subscription_ends_at' => '2026-12-31',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('companies', [
            'id' => $company->id,
            'subscription_plan_id' => $plan->id,
            'subscription_status' => 'active',
        ]);
    }

    public function test_super_admin_can_update_site_settings(): void
    {
        $super = $this->superAdmin();

        $this->actingAs($super)
            ->get('/super/site')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('SuperAdmin/Site'));

        $this->actingAs($super)
            ->put('/super/site', [
                'brand_name' => 'My Attend',
                'hero_title' => 'Hello world',
                'hero_subtitle' => 'Sub',
                'contact_email' => 'hi@example.com',
                'contact_phone' => '123',
                'contact_address' => 'Dhaka',
                'cta_heading' => 'CTA',
                'cta_subtext' => 'CTA sub',
                'footer_text' => 'Footer',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('site_contents', [
            'brand_name' => 'My Attend',
            'hero_title' => 'Hello world',
        ]);
    }

    public function test_landing_reflects_saved_site_settings_for_guests(): void
    {
        \App\Models\SiteContent::current()->update(['brand_name' => 'My Attend']);

        $this->get('/')->assertInertia(
            fn ($page) => $page->where('site.brand_name', 'My Attend'),
        );
    }

    public function test_staff_limit_blocks_adding_beyond_plan(): void
    {
        $plan = $this->plan(['staff_limit' => 1]);
        $company = $this->company(['subscription_plan_id' => $plan->id]);
        $admin = User::factory()->create([
            'role' => 'admin',
            'company_id' => $company->id,
        ]);

        User::factory()->create([
            'role' => 'staff',
            'company_id' => $company->id,
        ]);

        $this->actingAs($admin)
            ->get('/admin/staff')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Staff')
                ->where('subscription.at_limit', true)
                ->where('subscription.staff_limit', 1)
            );

        $this->actingAs($admin)
            ->post('/admin/staff', [
                'name' => 'Extra Staff',
                'email' => 'extra@test.test',
                'password' => 'password',
            ])
            ->assertSessionHasErrors('name');

        $this->assertDatabaseMissing('users', ['email' => 'extra@test.test']);
    }

    public function test_staff_within_limit_can_be_added(): void
    {
        $plan = $this->plan(['staff_limit' => 5]);
        $company = $this->company(['subscription_plan_id' => $plan->id]);
        $admin = User::factory()->create([
            'role' => 'admin',
            'company_id' => $company->id,
        ]);

        $this->actingAs($admin)
            ->post('/admin/staff', [
                'name' => 'New Staff',
                'email' => 'new@test.test',
                'password' => 'password',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('users', [
            'email' => 'new@test.test',
            'role' => 'staff',
            'company_id' => $company->id,
        ]);
    }

    public function test_non_super_admin_cannot_manage_plans_or_site(): void
    {
        $adminCompany = $this->company();
        $admin = User::factory()->create([
            'role' => 'admin',
            'company_id' => $adminCompany->id,
        ]);

        $this->actingAs($admin)->get('/super/plans')->assertForbidden();
        $this->actingAs($admin)->get('/super/site')->assertForbidden();
        $this->actingAs($admin)
            ->post('/super/plans', [
                'name' => 'X',
                'price' => 1,
                'billing_cycle' => 'monthly',
                'staff_limit' => 1,
            ])
            ->assertForbidden();
    }

    public function test_expired_subscription_blocks_staff_access(): void
    {
        $plan = $this->plan();
        $company = $this->company([
            'subscription_plan_id' => $plan->id,
            'subscription_status' => 'active',
            'subscription_ends_at' => now()->subDay()->toDateString(),
        ]);
        $staff = User::factory()->create([
            'role' => 'staff',
            'company_id' => $company->id,
        ]);

        $this->actingAs($staff)
            ->get('/attendance')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('AccountSuspended')
                ->where('reason', 'subscription_inactive')
            );
    }

    public function test_cancelled_subscription_blocks_admin_access(): void
    {
        $company = $this->company(['subscription_status' => 'cancelled']);
        $admin = User::factory()->create([
            'role' => 'admin',
            'company_id' => $company->id,
        ]);

        $this->actingAs($admin)
            ->get('/admin/staff')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('AccountSuspended'));
    }

    public function test_disabled_company_blocks_access(): void
    {
        $company = $this->company(['is_active' => false]);
        $admin = User::factory()->create([
            'role' => 'admin',
            'company_id' => $company->id,
        ]);

        $this->actingAs($admin)
            ->get('/admin/staff')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('AccountSuspended')
                ->where('reason', 'company_disabled')
            );
    }

    public function test_super_admin_is_not_blocked_by_disable_flag(): void
    {
        $company = $this->company(['is_active' => false]);
        $super = $this->superAdmin();

        $this->actingAs($super)->get('/super/companies')->assertOk();
        // Original tenant admins are routed through the middleware regardless.
        $this->assertNotNull($company);
    }

    public function test_admin_can_view_their_subscription_page(): void
    {
        $plan = $this->plan(['staff_limit' => 10]);
        $company = $this->company([
            'subscription_plan_id' => $plan->id,
            'subscription_status' => 'active',
            'subscription_ends_at' => now()->addDays(10)->toDateString(),
        ]);
        $admin = User::factory()->create([
            'role' => 'admin',
            'company_id' => $company->id,
        ]);
        User::factory()->create([
            'role' => 'staff',
            'company_id' => $company->id,
        ]);

        $this->actingAs($admin)
            ->get('/admin/subscription')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Subscription')
                ->where('plan.name', $plan->name)
                ->where('subscription.active', true)
                ->where('subscription.days_left', 10)
                ->where('subscription.staff_count', 1)
                ->where('subscription.staff_limit', 10)
            );
    }

    public function test_contact_form_stores_message_for_guests(): void
    {
        $this->post('/contact', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'phone' => '01711111111',
            'message' => 'আমাদের company-র জন্য plan জানতে চাই।',
        ])
            ->assertRedirect()
            ->assertSessionHas('message');

        $this->assertDatabaseHas('contact_messages', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
        ]);
    }

    public function test_super_admin_can_read_and_delete_messages(): void
    {
        $super = $this->superAdmin();
        $message = \App\Models\ContactMessage::create([
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'message' => 'আমাদের company-র জন্য plan জানতে চাই।',
        ]);

        $this->actingAs($super)
            ->get('/super/messages')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('SuperAdmin/Messages')
                ->has('messages', 1)
                ->where('unread_count', 1)
            );

        $this->actingAs($super)
            ->patch("/super/messages/{$message->id}/read")
            ->assertRedirect();

        $this->assertNotNull($message->fresh()->read_at);

        $this->actingAs($super)
            ->delete("/super/messages/{$message->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('contact_messages', ['id' => $message->id]);
    }

    public function test_site_features_and_faqs_are_editable(): void
    {
        $super = $this->superAdmin();

        $this->actingAs($super)
            ->post('/super/site/features', [
                'title' => 'One feature',
                'text' => 'Text',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('landing_features', ['title' => 'One feature']);

        $feature = \App\Models\LandingFeature::where('title', 'One feature')->firstOrFail();

        $this->actingAs($super)
            ->put("/super/site/features/{$feature->id}", [
                'icon' => '✅',
                'title' => 'Updated feature',
                'text' => 'New text',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('landing_features', [
            'id' => $feature->id,
            'title' => 'Updated feature',
        ]);

        $this->actingAs($super)
            ->post('/super/site/faqs', [
                'question' => 'প্রশ্ন?',
                'answer' => 'উত্তর।',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('landing_faqs', ['question' => 'প্রশ্ন?']);

        $this->actingAs($super)
            ->delete("/super/site/features/{$feature->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('landing_features', ['id' => $feature->id]);
    }

    public function test_landing_renders_saved_features_and_faqs_for_guests(): void
    {
        \App\Models\LandingFeature::create([
            'icon' => '✅',
            'title' => 'One feature',
            'text' => 'Text',
        ]);
        \App\Models\LandingFaq::create([
            'question' => 'প্রশ্ন?',
            'answer' => 'উত্তর।',
        ]);

        $this->get('/')->assertInertia(fn ($page) => $page
            ->component('Landing')
            ->has('site.features', 1)
            ->where('site.features.0.title', 'One feature')
            ->has('site.faqs', 1)
            ->where('site.faqs.0.q', 'প্রশ্ন?')
        );
    }

    public function test_feature_and_faq_require_title_and_question(): void
    {
        $super = $this->superAdmin();

        $this->actingAs($super)
            ->post('/super/site/features', ['text' => 'Text'])
            ->assertSessionHasErrors('title');

        $this->actingAs($super)
            ->post('/super/site/faqs', ['answer' => 'উত্তর।'])
            ->assertSessionHasErrors('question');
    }
}
