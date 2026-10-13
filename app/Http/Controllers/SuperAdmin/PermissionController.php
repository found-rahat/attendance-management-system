<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PermissionController extends Controller
{
    /**
     * Roles that can be configured (super admin always has everything).
     *
     * @var array<int, string>
     */
    private array $configurableRoles = [User::ROLE_ADMIN, User::ROLE_STAFF];

    public function index(): Response
    {
        $permissions = Permission::query()
            ->orderBy('group')
            ->orderBy('label')
            ->get(['id', 'name', 'label', 'group']);

        $assignments = DB::table('role_permissions')
            ->whereIn('role', $this->configurableRoles)
            ->get()
            ->groupBy('role')
            ->map(fn ($rows) => $rows->pluck('permission_id')->all());

        return Inertia::render('SuperAdmin/Permissions', [
            'permissions' => $permissions->map(fn (Permission $permission) => [
                'id' => $permission->id,
                'name' => $permission->name,
                'label' => $permission->label,
                'group' => $permission->group,
                'group_label' => Permission::GROUPS[$permission->group] ?? ucfirst($permission->group ?? 'other'),
            ]),
            'roles' => [
                ['name' => 'super_admin', 'label' => 'Super Admin', 'locked' => true],
                ['name' => 'admin', 'label' => 'Company Admin', 'locked' => false],
                ['name' => 'staff', 'label' => 'Staff', 'locked' => false],
            ],
            'rolePermissions' => [
                'super_admin' => $permissions->pluck('id')->all(),
                'admin' => $assignments->get('admin', []),
                'staff' => $assignments->get('staff', []),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'roles' => ['required', 'array'],
            'roles.admin' => ['present', 'array'],
            'roles.admin.*' => ['integer', Rule::exists('permissions', 'id')],
            'roles.staff' => ['present', 'array'],
            'roles.staff.*' => ['integer', Rule::exists('permissions', 'id')],
        ]);

        DB::transaction(function () use ($data) {
            foreach ($this->configurableRoles as $role) {
                DB::table('role_permissions')->where('role', $role)->delete();

                $rows = collect($data['roles'][$role] ?? [])
                    ->unique()
                    ->map(fn ($id) => [
                        'role' => $role,
                        'permission_id' => $id,
                    ])
                    ->all();

                if (! empty($rows)) {
                    DB::table('role_permissions')->insert($rows);
                }
            }
        });

        return back()->with('message', 'Permissions updated.');
    }
}