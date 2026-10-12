<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Landing'));
    }

    public function test_authenticated_user_is_redirected_to_their_home(): void
    {
        $user = User::factory()->create([
            'role' => 'super_admin',
            'company_id' => null,
        ]);

        $this->actingAs($user)
            ->get('/')
            ->assertRedirect(route('super.dashboard'));
    }
}
