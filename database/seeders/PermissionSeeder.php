<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermissionSeeder extends Seeder
{
    /**
     * The full permission catalogue and the default roles that receive them.
     *
     * @var array<int, array{name:string,label:string,group:string,roles:array<int,string>}>
     */
    private array $permissions = [
        // Platform overview
        ['name' => 'dashboard.view', 'label' => 'View dashboard', 'group' => 'platform', 'roles' => ['super_admin', 'admin', 'staff']],

        // Companies (SaaS owner)
        ['name' => 'companies.view', 'label' => 'View companies', 'group' => 'companies', 'roles' => ['super_admin']],
        ['name' => 'companies.create', 'label' => 'Create companies', 'group' => 'companies', 'roles' => ['super_admin']],
        ['name' => 'companies.update', 'label' => 'Update companies', 'group' => 'companies', 'roles' => ['super_admin']],
        ['name' => 'companies.delete', 'label' => 'Delete companies', 'group' => 'companies', 'roles' => ['super_admin']],

        // Plans & billing
        ['name' => 'plans.view', 'label' => 'View plans', 'group' => 'billing', 'roles' => ['super_admin']],
        ['name' => 'plans.manage', 'label' => 'Manage plans', 'group' => 'billing', 'roles' => ['super_admin']],
        ['name' => 'subscription.view', 'label' => 'View own subscription', 'group' => 'billing', 'roles' => ['super_admin', 'admin']],

        // Website content
        ['name' => 'content.manage', 'label' => 'Manage website content', 'group' => 'content', 'roles' => ['super_admin']],

        // Messages
        ['name' => 'messages.view', 'label' => 'View contact messages', 'group' => 'content', 'roles' => ['super_admin']],
        ['name' => 'messages.manage', 'label' => 'Manage contact messages', 'group' => 'content', 'roles' => ['super_admin']],

        // Roles & permissions
        ['name' => 'permissions.manage', 'label' => 'Manage roles & permissions', 'group' => 'platform', 'roles' => ['super_admin']],

        // Attendance (company admin)
        ['name' => 'attendance.view', 'label' => 'View attendance report', 'group' => 'attendance', 'roles' => ['super_admin', 'admin']],
        ['name' => 'attendance.export', 'label' => 'Export attendance PDF', 'group' => 'attendance', 'roles' => ['super_admin', 'admin']],
        ['name' => 'attendance.map', 'label' => 'View live attendance map', 'group' => 'attendance', 'roles' => ['super_admin', 'admin']],

        // Staff & office management
        ['name' => 'staff.view', 'label' => 'View staff', 'group' => 'management', 'roles' => ['super_admin', 'admin']],
        ['name' => 'staff.create', 'label' => 'Add staff', 'group' => 'management', 'roles' => ['admin']],
        ['name' => 'staff.delete', 'label' => 'Remove staff', 'group' => 'management', 'roles' => ['admin']],
        ['name' => 'office.settings', 'label' => 'Manage office settings', 'group' => 'management', 'roles' => ['admin']],
        ['name' => 'designation.view', 'label' => 'View designations', 'group' => 'management', 'roles' => ['super_admin', 'admin']],
        ['name' => 'designation.manage', 'label' => 'Manage designations', 'group' => 'management', 'roles' => ['super_admin', 'admin']],

        // Salary (company admin)
        ['name' => 'salary.view', 'label' => 'View salary module', 'group' => 'salary', 'roles' => ['super_admin', 'admin']],
        ['name' => 'salary.manage', 'label' => 'Manage salary module', 'group' => 'salary', 'roles' => ['super_admin', 'admin']],

        // Self service (staff)
        ['name' => 'attendance.checkin', 'label' => 'Check in / out', 'group' => 'self', 'roles' => ['staff']],
        ['name' => 'attendance.history', 'label' => 'View own history', 'group' => 'self', 'roles' => ['staff']],
    ];

    public function run(): void
    {
        foreach ($this->permissions as $definition) {
            $permission = Permission::query()->updateOrCreate(
                ['name' => $definition['name']],
                [
                    'label' => $definition['label'],
                    'group' => $definition['group'],
                ],
            );

            foreach ($definition['roles'] as $role) {
                DB::table('role_permissions')->updateOrInsert(
                    ['role' => $role, 'permission_id' => $permission->id],
                    [],
                );
            }
        }
    }
}
