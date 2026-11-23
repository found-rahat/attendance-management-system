<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\LandingFaq;
use App\Models\LandingFeature;
use App\Models\SiteContent;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AttendanceSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed a super admin, demo companies (with admins + staff) and attendance.
     */
    public function run(): void
    {
        $plans = $this->seedPlans();
        $this->seedSiteContent();

        User::query()->updateOrCreate(
            ['email' => 'super@platform.com'],
            [
                'name' => 'Platform Owner',
                'password' => 'password',
                'role' => User::ROLE_SUPER_ADMIN,
                'company_id' => null,
            ],
        );

        $acme = Company::query()->updateOrCreate(
            ['name' => 'Acme Corporation'],
            array_merge(
                $this->companyAttributes(
                    'Acme Head Office',
                    (float) config('attendance.latitude'),
                    (float) config('attendance.longitude'),
                    100,
                ),
                [
                    'subscription_plan_id' => $plans['business']->id,
                    'subscription_status' => 'active',
                    'subscription_starts_at' => now()->toDateString(),
                ],
            ),
        );

        $beta = Company::query()->updateOrCreate(
            ['name' => 'Beta Logistics'],
            array_merge(
                $this->companyAttributes('Beta Warehouse', 23.7509, 90.3932, 150),
                [
                    'subscription_plan_id' => $plans['growth']->id,
                    'subscription_status' => 'active',
                    'subscription_starts_at' => now()->toDateString(),
                ],
            ),
        );

        $this->seedUsers($acme, 'admin@company.com', 'Acme Admin', [
            ['name' => 'Rahim Uddin', 'email' => 'rahim@company.com'],
            ['name' => 'Karim Hasan', 'email' => 'karim@company.com'],
            ['name' => 'Sadia Akter', 'email' => 'sadia@company.com'],
        ]);

        $this->seedUsers($beta, 'admin@beta.com', 'Beta Admin', [
            ['name' => 'Nabila Islam', 'email' => 'nabila@beta.com'],
            ['name' => 'Tanvir Ahmed', 'email' => 'tanvir@beta.com'],
        ]);

        $this->seedAttendance($acme);
        $this->seedAttendance($beta);
    }

    /**
     * Seed the scalar site content and the demo landing features/FAQs.
     */
    private function seedSiteContent(): void
    {
        $content = SiteContent::current();

        foreach (SiteContent::COLUMNS as $column) {
            $content->{$column} = config("site.defaults.{$column}");
        }

        $content->save();

        if (LandingFeature::query()->count() === 0) {
            foreach (config('site.defaults.features', []) as $feature) {
                LandingFeature::create([
                    'icon' => $feature['icon'],
                    'title' => $feature['title'],
                    'text' => $feature['text'],
                ]);
            }
        }

        if (LandingFaq::query()->count() === 0) {
            foreach (config('site.defaults.faqs', []) as $faq) {
                LandingFaq::create([
                    'question' => $faq['q'],
                    'answer' => $faq['a'],
                ]);
            }
        }
    }

    /**
     * @return array<string, SubscriptionPlan>
     */
    private function seedPlans(): array
    {
        $definitions = [
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'price' => 500,
                'staff_limit' => 5,
                'sort_order' => 1,
                'is_featured' => false,
                'features' => [
                    '5 staff accounts',
                    'GPS geofence check-in / out',
                    'Daily & monthly reports',
                    'Email support',
                ],
            ],
            [
                'name' => 'Growth',
                'slug' => 'growth',
                'price' => 2000,
                'staff_limit' => 25,
                'sort_order' => 2,
                'is_featured' => true,
                'features' => [
                    '25 staff accounts',
                    'Everything in Starter',
                    'Live location map',
                    'Staff management',
                    'Priority support',
                ],
            ],
            [
                'name' => 'Business',
                'slug' => 'business',
                'price' => 3500,
                'staff_limit' => 50,
                'sort_order' => 3,
                'is_featured' => false,
                'features' => [
                    '50 staff accounts',
                    'Everything in Growth',
                    'Advanced attendance reports',
                    'Dedicated support',
                ],
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'price' => 7000,
                'staff_limit' => 0,
                'sort_order' => 4,
                'is_featured' => false,
                'features' => [
                    'Unlimited staff accounts',
                    'Everything in Business',
                    'Custom geofence policies',
                    'Onboarding & training',
                ],
            ],
        ];

        $plans = [];

        foreach ($definitions as $definition) {
            $plans[$definition['slug']] = SubscriptionPlan::query()->updateOrCreate(
                ['slug' => $definition['slug']],
                array_merge($definition, [
                    'billing_cycle' => 'monthly',
                    'is_active' => true,
                ]),
            );
        }

        return $plans;
    }

    /**
     * @return array<string, mixed>
     */
    private function companyAttributes(string $office, float $lat, float $lng, int $radius): array
    {
        return [
            'office_name' => $office,
            'latitude' => $lat,
            'longitude' => $lng,
            'radius_meters' => $radius,
            'late_after' => (string) config('attendance.late_after'),
            'exit_time' => (string) config('attendance.exit_time'),
            'timezone' => (string) config('attendance.timezone'),
            'max_accuracy_meters' => (int) config('attendance.max_accuracy_meters'),
            'is_active' => true,
        ];
    }

    /**
     * @param  array<int, array{name: string, email: string}>  $staffList
     */
    private function seedUsers(Company $company, string $adminEmail, string $adminName, array $staffList): void
    {
        User::query()->updateOrCreate(
            ['email' => $adminEmail],
            [
                'name' => $adminName,
                'password' => 'password',
                'role' => User::ROLE_ADMIN,
                'company_id' => $company->id,
            ],
        );

        foreach ($staffList as $person) {
            User::query()->updateOrCreate(
                ['email' => $person['email']],
                [
                    'name' => $person['name'],
                    'password' => 'password',
                    'role' => User::ROLE_STAFF,
                    'company_id' => $company->id,
                ],
            );
        }
    }

    private function seedAttendance(Company $company): void
    {
        $staffIds = User::query()
            ->where('company_id', $company->id)
            ->where('role', User::ROLE_STAFF)
            ->pluck('id');

        $timezone = $company->timezone;

        foreach ($staffIds as $staffId) {
            for ($daysBack = 1; $daysBack <= 5; $daysBack++) {
                $instant = Carbon::now()->subDays($daysBack);
                $date = Carbon::parse($instant->toDateTimeString(), $timezone)->toDateString();

                if (in_array(Carbon::parse($date.' 12:00', $timezone)->dayOfWeekIso, [6, 7], true)) {
                    continue;
                }

                $checkInTime = sprintf('%02d:%02d', random_int(8, 11), random_int(0, 45));
                $checkIn = Carbon::parse($date.' '.$checkInTime, $timezone);
                $checkOut = Carbon::parse(
                    $date.' '.sprintf('%02d:%02d', random_int(17, 19), random_int(0, 59)),
                    $timezone,
                );

                $dLat = random_int(-40, 40) / 111320;
                $dLng = random_int(-40, 40) / (111320 * cos(deg2rad($company->latitude)));

                DB::table('staff_attendances')->updateOrInsert(
                    [
                        'staff_id' => $staffId,
                        'date' => $date,
                    ],
                    [
                        'company_id' => $company->id,
                        'check_in_at' => $checkIn->setTimezone('UTC')->format('Y-m-d H:i:s'),
                        'check_in_latitude' => $company->latitude + $dLat,
                        'check_in_longitude' => $company->longitude + $dLng,
                        'check_in_accuracy' => random_int(8, 25),
                        'check_in_distance' => round(random_int(5, 40), 2),
                        'check_out_at' => $checkOut->setTimezone('UTC')->format('Y-m-d H:i:s'),
                        'check_out_latitude' => $company->latitude + $dLat,
                        'check_out_longitude' => $company->longitude + $dLng,
                        'check_out_accuracy' => random_int(8, 25),
                        'check_out_distance' => round(random_int(5, 40), 2),
                        'status' => $checkInTime > $company->late_after ? 'late' : 'present',
                        'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                        'updated_at' => Carbon::now()->format('Y-m-d H:i:s'),
                    ],
                );
            }
        }
    }
}
