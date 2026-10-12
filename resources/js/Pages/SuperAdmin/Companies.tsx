import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import AppLayout from '../../Layouts/AppLayout';
import { LocationPicker, Recenter } from '../../components/LocationPicker';
import { formatDateShort, formatPrice } from '../../lib/format';
import type { Plan } from '../../types';

type Admin = {
    id: number;
    company_id: number;
    name: string;
    email: string;
};

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

type Props = {
    companies: Company[];
    plans: Plan[];
    defaults: Defaults;
};

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
    admin_name: string;
    admin_email: string;
    admin_password: string;
};

const commonInput =
    'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none';

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

    const mapCenter: [number, number] =
        toNumber(values.latitude, 0) !== 0 || toNumber(values.longitude, 0) !== 0
            ? [
                  toNumber(values.latitude, DEFAULT_CENTER[0]),
                  toNumber(values.longitude, DEFAULT_CENTER[1]),
              ]
            : DEFAULT_CENTER;
    const radius = Math.max(10, toNumber(values.radius_meters, 100));

    function update(field: keyof FormValues, value: string) {
        setValues((prev) => ({ ...prev, [field]: value }));
    }

    function setPosition(lat: number, lng: number) {
        setValues((prev) => ({
            ...prev,
            latitude: lat.toFixed(7),
            longitude: lng.toFixed(7),
        }));
    }

    function useMyLocation() {
        if (!navigator.geolocation) {
            return;
        }
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
        if (!confirm(`Delete "${company.name}" and all its data?`)) {
            return;
        }
        router.delete(`/super/companies/${company.id}`, { preserveScroll: true });
    }

    function assignPlan(company: Company, planId: string) {
        router.patch(
            `/super/companies/${company.id}/subscription`,
            {
                subscription_plan_id: planId === '' ? null : Number(planId),
                subscription_status: company.subscription_status || 'active',
                subscription_starts_at: company.subscription_starts_at,
                subscription_ends_at: company.subscription_ends_at,
            },
            { preserveScroll: true },
        );
    }

    return (
        <AppLayout>
            <Head title="Companies" />

            <main className="mx-auto max-w-6xl space-y-5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold">Companies</h1>
                    <button
                        type="button"
                        onClick={() => setShowForm((v) => !v)}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                    >
                        {showForm ? 'Close' : '+ New company'}
                    </button>
                </div>

                {flash?.message && (
                    <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
                        {flash.message}
                    </div>
                )}

                {showForm && (
                    <form
                        onSubmit={submit}
                        className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
                    >
                        <div>
                            <h2 className="font-semibold">Company & office</h2>
                            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium">
                                        Company name
                                    </label>
                                    <input
                                        type="text"
                                        value={values.name}
                                        onChange={(e) => update('name', e.target.value)}
                                        className={commonInput}
                                    />
                                    {errors?.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium">Office name</label>
                                    <input
                                        type="text"
                                        value={values.office_name}
                                        onChange={(e) => update('office_name', e.target.value)}
                                        className={commonInput}
                                    />
                                    {errors?.office_name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.office_name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium">
                                    Office location (geofence)
                                </label>
                                <button
                                    type="button"
                                    onClick={useMyLocation}
                                    className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
                                >
                                    📍 Use my location
                                </button>
                            </div>

                            <div className="h-[360px] overflow-hidden rounded-lg border">
                                <MapContainer center={mapCenter} zoom={16} className="h-full w-full">
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Recenter position={mapCenter} />
                                    <LocationPicker
                                        position={mapCenter}
                                        radius={radius}
                                        onPick={setPosition}
                                    />
                                </MapContainer>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div>
                                    <label className="block text-sm font-medium">Latitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={values.latitude}
                                        onChange={(e) => update('latitude', e.target.value)}
                                        className={commonInput}
                                    />
                                    {errors?.latitude && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.latitude}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium">Longitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={values.longitude}
                                        onChange={(e) => update('longitude', e.target.value)}
                                        className={commonInput}
                                    />
                                    {errors?.longitude && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.longitude}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium">
                                        Radius (meters)
                                    </label>
                                    <input
                                        type="number"
                                        value={values.radius_meters}
                                        onChange={(e) => update('radius_meters', e.target.value)}
                                        className={commonInput}
                                    />
                                    {errors?.radius_meters && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.radius_meters}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium">Late after</label>
                                    <input
                                        type="time"
                                        value={values.late_after}
                                        onChange={(e) => update('late_after', e.target.value)}
                                        className={commonInput}
                                    />
                                    {errors?.late_after && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.late_after}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium">
                                        Max GPS accuracy (m)
                                    </label>
                                    <input
                                        type="number"
                                        value={values.max_accuracy_meters}
                                        onChange={(e) =>
                                            update('max_accuracy_meters', e.target.value)
                                        }
                                        className={commonInput}
                                    />
                                    {errors?.max_accuracy_meters && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.max_accuracy_meters}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium">Timezone</label>
                                    <input
                                        type="text"
                                        list="tz-list"
                                        value={values.timezone}
                                        onChange={(e) => update('timezone', e.target.value)}
                                        className={commonInput}
                                    />
                                    <datalist id="tz-list">
                                        <option value="Asia/Dhaka" />
                                        <option value="Asia/Kolkata" />
                                        <option value="UTC" />
                                    </datalist>
                                    {errors?.timezone && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.timezone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="font-semibold">Company admin account</h2>
                            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div>
                                    <label className="block text-sm font-medium">Admin name</label>
                                    <input
                                        type="text"
                                        value={values.admin_name}
                                        onChange={(e) => update('admin_name', e.target.value)}
                                        className={commonInput}
                                    />
                                    {errors?.admin_name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.admin_name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium">Admin email</label>
                                    <input
                                        type="email"
                                        value={values.admin_email}
                                        onChange={(e) => update('admin_email', e.target.value)}
                                        className={commonInput}
                                    />
                                    {errors?.admin_email && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.admin_email}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium">
                                        Admin password
                                    </label>
                                    <input
                                        type="text"
                                        value={values.admin_password}
                                        onChange={(e) => update('admin_password', e.target.value)}
                                        className={commonInput}
                                    />
                                    {errors?.admin_password && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.admin_password}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Subscription plan</label>
                            <select
                                value={values.subscription_plan_id}
                                onChange={(e) => update('subscription_plan_id', e.target.value)}
                                className={commonInput}
                            >
                                <option value="">No plan (default limit)</option>
                                {plans.map((plan) => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.name} — {formatPrice(plan.price)} (
                                        {plan.staff_limit <= 0
                                            ? 'unlimited'
                                            : `${plan.staff_limit} staff`}
                                        )
                                    </option>
                                ))}
                            </select>
                            {errors?.subscription_plan_id && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.subscription_plan_id}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-md bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {submitting ? 'Creating...' : 'Create company'}
                        </button>
                    </form>
                )}

                <div className="overflow-x-auto rounded-xl border bg-white">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3">Company</th>
                                <th className="p-3">Admin</th>
                                <th className="p-3">Staff</th>
                                <th className="p-3">Plan</th>
                                <th className="p-3">Status</th>
                                <th className="p-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {companies.map((company) => (
                                <tr key={company.id} className="border-t align-top">
                                    <td className="p-3">
                                        <span className="font-medium">{company.name}</span>
                                        <span className="block text-xs text-gray-500">
                                            {company.office_name} · {company.radius_meters}m
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        {company.admins.length > 0 ? (
                                            company.admins.map((admin) => (
                                                <span key={admin.id} className="block">
                                                    {admin.name}
                                                    <span className="block text-xs text-gray-400">
                                                        {admin.email}
                                                    </span>
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        {company.staff_count}
                                        <span className="block text-xs text-gray-400">
                                            {company.plan
                                                ? company.plan.staff_limit <= 0
                                                    ? 'unlimited'
                                                    : `limit ${company.plan.staff_limit}`
                                                : 'default limit'}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <select
                                            value={company.subscription_plan_id ?? ''}
                                            onChange={(e) => assignPlan(company, e.target.value)}
                                            className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                                        >
                                            <option value="">No plan</option>
                                            {plans.map((plan) => (
                                                <option key={plan.id} value={plan.id}>
                                                    {plan.name}
                                                </option>
                                            ))}
                                        </select>
                                        {company.subscription_ends_at && (
                                            <span className="mt-1 block text-xs text-gray-400">
                                                ends {formatDateShort(company.subscription_ends_at)}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        <button
                                            type="button"
                                            onClick={() => toggle(company)}
                                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                company.is_active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-200 text-gray-600'
                                            }`}
                                        >
                                            {company.is_active ? 'active' : 'inactive'}
                                        </button>
                                    </td>
                                    <td className="p-3 text-right">
                                        <button
                                            type="button"
                                            onClick={() => remove(company)}
                                            className="rounded-md border border-red-300 px-3 py-1 text-red-600 hover:bg-red-50"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {companies.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-5 text-center text-gray-500">
                                        No companies yet. Create the first one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </AppLayout>
    );
}
