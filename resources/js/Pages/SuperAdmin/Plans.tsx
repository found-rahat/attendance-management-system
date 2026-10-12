import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { formatPrice, staffLimitLabel } from '../../lib/format';
import type { Plan } from '../../types';

type PlanRow = Plan & { companies_count: number };

type Props = {
    plans: PlanRow[];
};

type FormValues = {
    name: string;
    price: string | number;
    billing_cycle: string;
    staff_limit: string | number;
    features: string;
    is_featured: boolean;
    is_active: boolean;
    sort_order: string | number;
};

const commonInput =
    'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none';

function emptyForm(): FormValues {
    return {
        name: '',
        price: '',
        billing_cycle: 'monthly',
        staff_limit: 5,
        features: '',
        is_featured: false,
        is_active: true,
        sort_order: 0,
    };
}

export default function SuperAdminPlans({ plans }: Props) {
    const { errors, flash } = usePage().props;
    const [values, setValues] = useState<FormValues>(emptyForm);
    const [editing, setEditing] = useState<PlanRow | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    function update<K extends keyof FormValues>(field: K, value: FormValues[K]) {
        setValues((prev) => ({ ...prev, [field]: value }));
    }

    function startCreate() {
        setEditing(null);
        setValues(emptyForm());
        setShowForm(true);
    }

    function startEdit(plan: PlanRow) {
        setEditing(plan);
        setValues({
            name: plan.name,
            price: plan.price,
            billing_cycle: plan.billing_cycle,
            staff_limit: plan.staff_limit,
            features: (plan.features ?? []).join('\n'),
            is_featured: plan.is_featured,
            is_active: plan.is_active,
            sort_order: plan.sort_order,
        });
        setShowForm(true);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);

        const payload = {
            ...values,
            features: values.features
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean),
        };

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setShowForm(false);
                setEditing(null);
                setValues(emptyForm());
            },
            onFinish: () => setSubmitting(false),
        };

        if (editing) {
            router.put(`/super/plans/${editing.id}`, payload, options);
        } else {
            router.post('/super/plans', payload, options);
        }
    }

    function remove(plan: PlanRow) {
        if (!confirm(`Delete plan "${plan.name}"?`)) {
            return;
        }

        router.delete(`/super/plans/${plan.id}`, { preserveScroll: true });
    }

    return (
        <AppLayout>
            <Head title="Subscription Plans" />

            <main className="mx-auto max-w-6xl space-y-5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold">Subscription Plans</h1>
                    <button
                        type="button"
                        onClick={startCreate}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                    >
                        + New plan
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
                        className="space-y-4 rounded-xl border bg-white p-6 shadow-sm"
                    >
                        <h2 className="font-semibold">
                            {editing ? `Edit: ${editing.name}` : 'Create a plan'}
                        </h2>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium">Name</label>
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
                                <label className="block text-sm font-medium">Price (৳)</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={values.price}
                                    onChange={(e) => update('price', e.target.value)}
                                    className={commonInput}
                                />
                                {errors?.price && (
                                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Billing cycle</label>
                                <select
                                    value={values.billing_cycle}
                                    onChange={(e) => update('billing_cycle', e.target.value)}
                                    className={commonInput}
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium">
                                    Staff limit (0 = unlimited)
                                </label>
                                <input
                                    type="number"
                                    value={values.staff_limit}
                                    onChange={(e) => update('staff_limit', e.target.value)}
                                    className={commonInput}
                                />
                                {errors?.staff_limit && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.staff_limit}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Sort order</label>
                                <input
                                    type="number"
                                    value={values.sort_order}
                                    onChange={(e) => update('sort_order', e.target.value)}
                                    className={commonInput}
                                />
                            </div>

                            <div className="flex items-end gap-6">
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={values.is_active}
                                        onChange={(e) => update('is_active', e.target.checked)}
                                        className="h-4 w-4"
                                    />
                                    Active
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={values.is_featured}
                                        onChange={(e) => update('is_featured', e.target.checked)}
                                        className="h-4 w-4"
                                    />
                                    Featured
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium">
                                Features (one per line)
                            </label>
                            <textarea
                                rows={5}
                                value={values.features}
                                onChange={(e) => update('features', e.target.value)}
                                className={commonInput}
                                placeholder={'5 staff accounts\nGPS geofence check-in'}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="rounded-md bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {submitting ? 'Saving...' : editing ? 'Update plan' : 'Create plan'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditing(null);
                                }}
                                className="rounded-md border border-gray-300 px-5 py-2 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`rounded-xl border bg-white p-5 shadow-sm ${
                                plan.is_featured ? 'border-indigo-300' : 'border-gray-200'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        {plan.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {staffLimitLabel(plan.staff_limit)}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    {plan.is_featured && (
                                        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                                            featured
                                        </span>
                                    )}
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                            plan.is_active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-200 text-gray-600'
                                        }`}
                                    >
                                        {plan.is_active ? 'active' : 'hidden'}
                                    </span>
                                </div>
                            </div>

                            <p className="mt-3 text-2xl font-bold text-gray-900">
                                {formatPrice(plan.price)}
                                <span className="text-sm font-normal text-gray-500">
                                    {' '}
                                    / {plan.billing_cycle}
                                </span>
                            </p>

                            <ul className="mt-3 space-y-1 text-sm text-gray-600">
                                {(plan.features ?? []).map((feature) => (
                                    <li key={feature} className="flex gap-2">
                                        <span className="text-emerald-500">✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <p className="mt-4 text-xs text-gray-400">
                                {plan.companies_count} company(s) on this plan
                            </p>

                            <div className="mt-4 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => startEdit(plan)}
                                    className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => remove(plan)}
                                    className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}

                    {plans.length === 0 && (
                        <p className="text-gray-500">No plans yet. Create your first plan.</p>
                    )}
                </div>
            </main>
        </AppLayout>
    );
}
