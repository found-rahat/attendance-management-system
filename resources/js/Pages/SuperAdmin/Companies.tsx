import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import AppLayout from '../../Layouts/AppLayout';
import { Icon } from '../../components/Icons';
import { Badge, EmptyRow, Field, Flash, Modal, PageHeader } from '../../components/ui';
import { LocationPicker, Recenter } from '../../components/LocationPicker';
import { formatDateShort, formatPrice } from '../../lib/format';
import type { Plan } from '../../types';

type Admin = { id: number; company_id: number; name: string; email: string };

type Company = {
    id: number;
    name: string;
    office_name: string;
    latitude: number;
    longitude: number;
    radius_meters: number;
    late_after: string;
    timezone: string;
    max_accuracy_meters: number;
    is_active: boolean;
    created_at: string;
    subscription_plan_id: number | null;
    subscription_status: string;
    subscription_starts_at: string | null;
    subscription_ends_at: string | null;
    staff_limit_override: number | null;
    subscription_amount_override: number | null;
    staff_count: number;
    admins_count: number;
    attendances_count: number;
    admins: Admin[];
    plan: Pick<Plan, 'id' | 'name' | 'staff_limit' | 'price'> | null;
};

type Defaults = {
    office_name: string;
    latitude: number;
    longitude: number;
    radius_meters: number;
    late_after: string;
    timezone: string;
    max_accuracy_meters: number;
};

type Props = { companies: Company[]; plans: Plan[]; defaults: Defaults };

type FormValues = {
    name: string;
    office_name: string;
    latitude: string | number;
    longitude: string | number;
    radius_meters: string | number;
    late_after: string;
    timezone: string;
    max_accuracy_meters: string | number;
    subscription_plan_id: string | number;
    staff_limit_override: string;
    subscription_amount_override: string;
    admin_name: string;
    admin_email: string;
    admin_password: string;
};

const DEFAULT_CENTER: [number, number] = [23.8103, 90.4125];

function toNumber(value: unknown, fallback: number): number {
    const n = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
    return Number.isFinite(n) ? n : fallback;
}

function emptyForm(defaults: Defaults): FormValues {
    return {
        name: '',
        office_name: defaults.office_name,
        latitude: defaults.latitude,
        longitude: defaults.longitude,
        radius_meters: defaults.radius_meters,
        late_after: defaults.late_after,
        timezone: defaults.timezone,
        max_accuracy_meters: defaults.max_accuracy_meters,
        subscription_plan_id: '',
        staff_limit_override: '',
        subscription_amount_override: '',
        admin_name: '',
        admin_email: '',
        admin_password: '',
    };
}

export default function Companies({ companies, plans, defaults }: Props) {
    const { errors, flash } = usePage().props;
    const [values, setValues] = useState<FormValues>(() => emptyForm(defaults));
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Company | null>(null);
    const [editStaffLimit, setEditStaffLimit] = useState<string>('');
    const [editAmount, setEditAmount] = useState<string>('');
    const [editStart, setEditStart] = useState<string>('');
    const [editEnd, setEditEnd] = useState<string>('');

    const mapCenter: [number, number] =
        toNumber(values.latitude, 0) !== 0 || toNumber(values.longitude, 0) !== 0
            ? [toNumber(values.latitude, DEFAULT_CENTER[0]), toNumber(values.longitude, DEFAULT_CENTER[1])]
            : DEFAULT_CENTER;
    const radius = Math.max(10, toNumber(values.radius_meters, 100));

    function update(field: keyof FormValues, value: string) {
        setValues((prev) => ({ ...prev, [field]: value }));
    }

    function setPosition(lat: number, lng: number) {
        setValues((prev) => ({ ...prev, latitude: lat.toFixed(7), longitude: lng.toFixed(7) }));
    }

    function useMyLocation() {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (pos) => setPosition(pos.coords.latitude, pos.coords.longitude),
            () => undefined,
            { enableHighAccuracy: true, timeout: 15000 },
        );
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        router.post('/super/companies', values, {
            preserveScroll: true,
            onSuccess: () => {
                setValues(emptyForm(defaults));
                setShowForm(false);
            },
            onFinish: () => setSubmitting(false),
        });
    }

    function toggle(company: Company) {
        router.patch(`/super/companies/${company.id}/toggle`, {}, { preserveScroll: true });
    }

    function remove(company: Company) {
        if (!confirm(`Delete "${company.name}" and all its data?`)) return;
        router.delete(`/super/companies/${company.id}`, { preserveScroll: true });
    }

    function saveSubscription(company: Company, patch: Partial<{
        subscription_plan_id: number | null;
        subscription_status: string;
        subscription_starts_at: string | null;
        subscription_ends_at: string | null;
        staff_limit_override: number | null;
        subscription_amount_override: number | null;
    }>) {
        router.patch(
            `/super/companies/${company.id}/subscription`,
            {
                subscription_plan_id:
                    patch.subscription_plan_id !== undefined
                        ? patch.subscription_plan_id
                        : company.subscription_plan_id,
                subscription_status:
                    patch.subscription_status !== undefined
                        ? patch.subscription_status
                        : company.subscription_status || 'active',
                subscription_starts_at:
                    patch.subscription_starts_at !== undefined
                        ? patch.subscription_starts_at
                        : company.subscription_starts_at,
                subscription_ends_at:
                    patch.subscription_ends_at !== undefined
                        ? patch.subscription_ends_at
                        : company.subscription_ends_at,
                staff_limit_override:
                    patch.staff_limit_override !== undefined
                        ? patch.staff_limit_override
                        : company.staff_limit_override,
                subscription_amount_override:
                    patch.subscription_amount_override !== undefined
                        ? patch.subscription_amount_override
                        : company.subscription_amount_override,
            },
            { preserveScroll: true },
        );
    }

    function assignPlan(company: Company, planId: string) {
        const plan = plans.find((p) => String(p.id) === planId);
        saveSubscription(company, {
            subscription_plan_id: planId === '' ? null : Number(planId),
            staff_limit_override: plan ? plan.staff_limit : null,
            subscription_amount_override: plan ? plan.price : null,
        });
    }

    function openEdit(company: Company) {
        setEditing(company);
        setEditStaffLimit(company.staff_limit_override !== null ? String(company.staff_limit_override) : '');
        setEditAmount(company.subscription_amount_override !== null ? String(company.subscription_amount_override) : '');
        const today = new Date().toISOString().slice(0, 10);
        setEditStart(company.subscription_starts_at ? String(company.subscription_starts_at).slice(0, 10) : today);
        setEditEnd(company.subscription_ends_at ? String(company.subscription_ends_at).slice(0, 10) : '');
    }

    function saveEdit() {
        if (!editing) return;
        saveSubscription(editing, {
            staff_limit_override: editStaffLimit === '' ? null : Number(editStaffLimit),
            subscription_amount_override: editAmount === '' ? null : Number(editAmount),
            subscription_starts_at: editStart || null,
            subscription_ends_at: editEnd || null,
        });
        setEditing(null);
    }

    return (
        <AppLayout>
            <Head title="Companies" />

            <PageHeader icon="building" title="Companies" subtitle="Every tenant, its office geofence, admin account and subscription.">
                <button type="button" onClick={() => setShowForm((v) => !v)} className="btn-primary">
                    <Icon name={showForm ? 'close' : 'plus'} size={18} />
                    {showForm ? 'Close' : 'New company'}
                </button>
            </PageHeader>

            <Flash message={flash?.message} errors={errors} />

            <Modal open={showForm} onClose={() => setShowForm(false)} title="New company">
                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <h2 className="font-semibold">Company & office</h2>
                        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field label="Company name">
                                <input className="input" value={values.name} onChange={(e) => update('name', e.target.value)} />
                            </Field>
                            <Field label="Office name">
                                <input className="input" value={values.office_name} onChange={(e) => update('office_name', e.target.value)} />
                            </Field>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="label mb-0">Office location (geofence)</label>
                            <button type="button" onClick={useMyLocation} className="btn-ghost px-3 py-1.5 text-xs">
                                <Icon name="location" size={14} /> Use my location
                            </button>
                        </div>
                        <div className="h-[340px] overflow-hidden rounded-xl border border-line">
                            <MapContainer center={mapCenter} zoom={16} className="h-full w-full">
                                <TileLayer
                                    attribution='&copy; OpenStreetMap contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Recenter position={mapCenter} />
                                <LocationPicker position={mapCenter} radius={radius} onPick={setPosition} />
                            </MapContainer>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <Field label="Latitude">
                                <input type="number" step="any" className="input" value={values.latitude} onChange={(e) => update('latitude', e.target.value)} />
                            </Field>
                            <Field label="Longitude">
                                <input type="number" step="any" className="input" value={values.longitude} onChange={(e) => update('longitude', e.target.value)} />
                            </Field>
                            <Field label="Radius (meters)">
                                <input type="number" className="input" value={values.radius_meters} onChange={(e) => update('radius_meters', e.target.value)} />
                            </Field>
                            <Field label="Late after">
                                <input type="time" className="input" value={values.late_after} onChange={(e) => update('late_after', e.target.value)} />
                            </Field>
                            <Field label="Max GPS accuracy (m)">
                                <input type="number" className="input" value={values.max_accuracy_meters} onChange={(e) => update('max_accuracy_meters', e.target.value)} />
                            </Field>
                            <Field label="Timezone">
                                <input className="input" list="tz-list" value={values.timezone} onChange={(e) => update('timezone', e.target.value)} />
                                <datalist id="tz-list">
                                    <option value="Asia/Dhaka" />
                                    <option value="Asia/Kolkata" />
                                    <option value="UTC" />
                                </datalist>
                            </Field>
                        </div>
                    </div>

                    <div>
                        <h2 className="font-semibold">Company admin account</h2>
                        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <Field label="Admin name">
                                <input className="input" value={values.admin_name} onChange={(e) => update('admin_name', e.target.value)} />
                            </Field>
                            <Field label="Admin email">
                                <input type="email" className="input" value={values.admin_email} onChange={(e) => update('admin_email', e.target.value)} />
                            </Field>
                            <Field label="Admin password">
                                <input className="input" value={values.admin_password} onChange={(e) => update('admin_password', e.target.value)} />
                            </Field>
                        </div>
                    </div>

                    <Field label="Subscription plan">
                        <select className="input" value={values.subscription_plan_id} onChange={(e) => update('subscription_plan_id', e.target.value)}>
                            <option value="">No plan (default limit)</option>
                            {plans.map((plan) => (
                                <option key={plan.id} value={plan.id}>
                                    {plan.name} — {formatPrice(plan.price)} ({plan.staff_limit <= 0 ? 'unlimited' : `${plan.staff_limit} staff`})
                                </option>
                            ))}
                        </select>
                    </Field>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Staff limit (override)">
                            <input
                                type="number"
                                min="0"
                                className="input"
                                value={values.staff_limit_override}
                                onChange={(e) => update('staff_limit_override', e.target.value)}
                                placeholder="Leave empty to use plan limit"
                            />
                        </Field>
                        <Field label="Subscription amount (override)">
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="input"
                                value={values.subscription_amount_override}
                                onChange={(e) => update('subscription_amount_override', e.target.value)}
                                placeholder="Leave empty to use plan price"
                            />
                        </Field>
                    </div>

                    <button type="submit" disabled={submitting} className="btn-primary">
                        {submitting ? 'Creating...' : 'Create company'}
                    </button>
                </form>
            </Modal>

            <div className="card mt-5 overflow-x-auto">
                <table className="data-table min-w-[860px]">
                    <thead>
                        <tr>
                            <th className="text-left">Company</th>
                            <th className="text-left">Admin</th>
                            <th>Staff</th>
                            <th>Plan</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.map((company) => (
                            <tr key={company.id} className="align-top">
                                <td className="text-left">
                                    <span className="font-medium">{company.name}</span>
                                    <span className="block text-xs text-muted">
                                        {company.office_name} · {company.radius_meters}m
                                    </span>
                                </td>
                                <td className="text-left">
                                    {company.admins.length > 0 ? (
                                        company.admins.map((admin) => (
                                            <span key={admin.id} className="block">
                                                {admin.name}
                                                <span className="block text-xs text-muted">{admin.email}</span>
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-muted">—</span>
                                    )}
                                </td>
                                <td>
                                    {company.staff_count}
                                    <span className="block text-xs text-muted">
                                        {company.staff_limit_override !== null
                                            ? `override ${company.staff_limit_override}`
                                            : (company.plan ? (company.plan.staff_limit <= 0 ? 'unlimited' : `limit ${company.plan.staff_limit}`) : 'default limit')}
                                    </span>
                                </td>
                                <td>
                                    <select
                                        value={company.subscription_plan_id ?? ''}
                                        onChange={(e) => assignPlan(company, e.target.value)}
                                        className="input px-2 py-1"
                                    >
                                        <option value="">No plan</option>
                                        {plans.map((plan) => (
                                            <option key={plan.id} value={plan.id}>{plan.name}</option>
                                        ))}
                                    </select>
                                    {company.subscription_starts_at && (
                                        <span className="mt-1 block text-xs text-muted">starts {formatDateShort(company.subscription_starts_at)}</span>
                                    )}
                                    {company.subscription_ends_at && (
                                        <span className="block text-xs text-muted">ends {formatDateShort(company.subscription_ends_at)}</span>
                                    )}
                                </td>
                                <td>
                                    <button type="button" onClick={() => toggle(company)}>
                                        <Badge tone={company.is_active ? 'ok' : 'neutral'}>
                                            {company.is_active ? 'active' : 'inactive'}
                                        </Badge>
                                    </button>
                                </td>
                                <td className="flex gap-2">
                                    <button type="button" onClick={() => openEdit(company)} className="btn-ghost px-3 py-1.5 text-xs">
                                        <Icon name="edit" size={14} /> Edit
                                    </button>
                                    <button type="button" onClick={() => remove(company)} className="btn-danger px-3 py-1.5 text-xs">
                                        <Icon name="trash" size={14} /> Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {companies.length === 0 && <EmptyRow colSpan={6}>No companies yet. Create the first one.</EmptyRow>}
                    </tbody>
                </table>
            </div>

            <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing ? `Edit ${editing.name}` : 'Edit company'}>
                <div className="space-y-4">
                    <Field label="Staff limit (override)">
                        <input
                            type="number"
                            min="0"
                            className="input"
                            value={editStaffLimit}
                            onChange={(e) => setEditStaffLimit(e.target.value)}
                            placeholder="Leave empty to use plan limit"
                        />
                    </Field>
                    <Field label="Subscription amount (override)">
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="input"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            placeholder="Leave empty to use plan price"
                        />
                    </Field>
                    <Field label="Subscription start date">
                        <input
                            type="date"
                            className="input"
                            value={editStart}
                            onChange={(e) => setEditStart(e.target.value)}
                        />
                    </Field>
                    <Field label="Subscription end date">
                        <input
                            type="date"
                            className="input"
                            value={editEnd}
                            onChange={(e) => setEditEnd(e.target.value)}
                        />
                    </Field>
                    <div className="flex justify-end gap-2">
                        <button type="button" className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
                        <button type="button" className="btn-primary" onClick={saveEdit}>Update</button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
