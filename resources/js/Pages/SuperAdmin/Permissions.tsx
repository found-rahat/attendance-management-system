import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Icon } from '../../components/Icons';
import { Flash, PageHeader } from '../../components/ui';

type Permission = {
    id: number;
    name: string;
    label: string;
    group: string;
    group_label: string;
};

type RoleMeta = { name: string; label: string; locked: boolean };

type Props = {
    permissions: Permission[];
    roles: RoleMeta[];
    rolePermissions: Record<string, number[]>;
};

export default function Permissions({ permissions, roles, rolePermissions }: Props) {
    const { flash, errors } = usePage().props;
    const [selected, setSelected] = useState<Record<string, number[]>>({
        admin: rolePermissions.admin ?? [],
        staff: rolePermissions.staff ?? [],
    });
    const [saving, setSaving] = useState(false);

    const configurable = roles.filter((role) => !role.locked);

    const groups = permissions.reduce<Record<string, { label: string; items: Permission[] }>>(
        (acc, permission) => {
            acc[permission.group] ??= { label: permission.group_label, items: [] };
            acc[permission.group].items.push(permission);
            return acc;
        },
        {},
    );

    function toggle(role: string, id: number) {
        setSelected((prev) => {
            const current = prev[role] ?? [];
            const next = current.includes(id)
                ? current.filter((value) => value !== id)
                : [...current, id];
            return { ...prev, [role]: next };
        });
    }

    function toggleGroup(role: string, items: Permission[], checked: boolean) {
        setSelected((prev) => {
            const ids = items.map((item) => item.id);
            const current = prev[role] ?? [];
            const next = checked
                ? Array.from(new Set([...current, ...ids]))
                : current.filter((id) => !ids.includes(id));
            return { ...prev, [role]: next };
        });
    }

    function save() {
        setSaving(true);
        router.put('/super/permissions', { roles: selected }, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    }

    return (
        <AppLayout>
            <Head title="Roles & Permissions" />

            <PageHeader
                icon="shield"
                title="Roles & Permissions"
                subtitle="Control exactly what each role can see and do across the platform."
            >
                <button type="button" onClick={save} disabled={saving} className="btn-primary">
                    <Icon name="check" size={18} />
                    {saving ? 'Saving...' : 'Save changes'}
                </button>
            </PageHeader>

            <Flash message={flash?.message} errors={errors} />

            <div className="card mt-5 overflow-x-auto">
                <table className="data-table min-w-[640px]">
                    <thead>
                        <tr>
                            <th className="text-left" style={{ width: '50%' }}>
                                Permission
                            </th>
                            {roles.map((role) => (
                                <th key={role.name}>
                                    {role.label}
                                    {role.locked && (
                                        <span className="ml-2 text-xs text-muted">(full access)</span>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(groups).map(([group, data]) => (
                            <GroupRows
                                key={group}
                                label={data.label}
                                items={data.items}
                                roles={roles}
                                selected={selected}
                                onToggle={toggle}
                                onToggleGroup={toggleGroup}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}

function GroupRows({
    label,
    items,
    roles,
    selected,
    onToggle,
    onToggleGroup,
}: {
    label: string;
    items: Permission[];
    roles: RoleMeta[];
    selected: Record<string, number[]>;
    onToggle: (role: string, id: number) => void;
    onToggleGroup: (role: string, items: Permission[], checked: boolean) => void;
}) {
    return (
        <>
            <tr className="bg-ink/5">
                <td colSpan={roles.length + 1} className="text-left text-xs font-semibold uppercase tracking-wide text-cy">
                    {label}
                </td>
            </tr>
            {items.map((permission) => (
                <tr key={permission.id}>
                    <td className="text-left">
                        <span className="font-medium">{permission.label}</span>
                        <span className="ml-2 text-xs text-muted">{permission.name}</span>
                    </td>
                    {roles.map((role) => {
                        const checked = role.locked || (selected[role.name] ?? []).includes(permission.id);

                        return (
                            <td key={role.name}>
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    disabled={role.locked}
                                    onChange={() => onToggle(role.name, permission.id)}
                                    className="h-4 w-4 accent-[#8b2cf5]"
                                />
                            </td>
                        );
                    })}
                </tr>
            ))}
            <tr>
                <td className="text-left text-xs text-muted">Select all in {label}</td>
                {roles.map((role) => (
                    <td key={role.name}>
                        <button
                            type="button"
                            disabled={role.locked}
                            onClick={() => onToggleGroup(role.name, items, true)}
                            className="text-xs text-brand-3 hover:underline disabled:opacity-40"
                        >
                            all
                        </button>
                        <span className="mx-1 text-muted">/</span>
                        <button
                            type="button"
                            disabled={role.locked}
                            onClick={() => onToggleGroup(role.name, items, false)}
                            className="text-xs text-muted hover:underline disabled:opacity-40"
                        >
                            none
                        </button>
                    </td>
                ))}
            </tr>
        </>
    );
}
