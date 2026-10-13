<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

#[Fillable(['name', 'label', 'group', 'description'])]
class Permission extends Model
{
    /**
     * Group labels used in the management UI.
     *
     * @var array<string, string>
     */
    public const GROUPS = [
        'platform' => 'Platform',
        'companies' => 'Companies',
        'billing' => 'Billing & Plans',
        'content' => 'Website Content',
        'attendance' => 'Attendance',
        'management' => 'Staff & Office',
        'self' => 'Self Service',
    ];

    /**
     * All permission names assigned to a role.
     *
     * @return array<int, string>
     */
    public static function namesForRole(string $role): array
    {
        $ids = DB::table('role_permissions')
            ->where('role', $role)
            ->pluck('permission_id')
            ->all();

        return static::query()
            ->whereIn('id', $ids)
            ->pluck('name')
            ->all();
    }
}