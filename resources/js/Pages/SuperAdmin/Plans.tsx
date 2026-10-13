import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Icon } from '../../components/Icons';
import { Badge, Field, Flash, PageHeader } from '../../components/ui';
import { formatPrice, staffLimitLabel } from '../../lib/format';
import type { Plan } from '../../types';

type PlanRow = Plan & { companies_count: number };
type Props = { plans: PlanRow[] };

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
            features: values.features.split('\n').map((line) => line.trim()).filter(Boolean),
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
        if (!confirm(`Delete plan "${plan.name}"?`)) return;
        router.delete(`/super/plans/${plan.id}`, { preserveScroll: true });
    }

    return (
        <AppLayout>
            <Head title="Subscription Plans" />

            <PageHeader icon="card" title="Subscription Plans" subtitle="Pricing tiers that companies can be subscribed to.">
                <button type="button" onClick={startCreate} className="btn-primary">
                    <Icon name="plus" size={18} /> New plan
                </button>
            </PageHeader>

            <Flash message={flash?.message} errors={errors} />

            {showForm && (
                <form onSubmit={submit} className="card mt-5 space-y-5 p-6">
                    <h2 className="font-semibold">{editing ? `Edit: ${editing.name}` : 'Create a plan'}</h2>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Field label="Name">
                            <input className="input" value={values.name} onChange={(e) => update('name', e.target.value)} />
                        </Field>
                        <Field label="Price (৳)">
                            <input type="number" step="any" className="input" value={values.price} onChange={(e) => update('price', e.target.value)} />
                        </Field>
                        <Field label="Billing cycle">
                            <select className="input" value={values.billing_cycle} onChange={(e) => update('billing_cycle', e.target.value)}>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </Field>
                        <Field label="Staff limit (0 = unlimited)">
                            <input type="number" className="input" value={values.staff_limit} onChange={(e) => update('staff_limit', e.target.value)} />
                        </Field>
                        <Field label="Sort order">
                            <input type="number" className="input" value={values.sort_order} onChange={(e) => update('sort_order', e.target.value)} />
                        </Field>
                        <div className="flex items-end gap-6 pb-2">
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={values.is_active} onChange={(e) => update('is_active', e.target.checked)} className="h-4 w-4 accent-[#8b2cf5]" />
                                Active
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={values.is_featured} onChange={(e) => update('is_featured', e.target.checked)} className="h-4 w-4 accent-[#8b2cf5]" />
                                Featured
                            </label>
                        </div>
                    </div>

                    <Field label="Features (one per line)">
                        <textarea rows={5} className="input" value={values.features} onChange={(e) => update('features', e.target.value)} placeholder={'5 staff accounts\nGPS geofence check-in'} />
                    </Field>

                    <div className="flex gap-3">
                        <button type="submit" disabled={submitting} className="btn-primary">
                            {submitting ? 'Saving...' : editing ? 'Update plan' : 'Create plan'}
                        </button>
                        <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-ghost">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan) => (
                    <div key={plan.id} className={`card p-5 ${plan.is_featured ? 'border-brand/60' : ''}`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-semibold">{plan.name}</h3>
                                <p className="text-sm text-muted">{staffLimitLabel(plan.staff_limit)}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                {plan.is_featured && <Badge tone="brand">featured</Badge>}
                                <Badge tone={plan.is_active ? 'ok' : 'neutral'}>{plan.is_active ? 'active' : 'hidden'}</Badge>
                            </div>
                        </div>

                        <p className="mt-3 text-2xl font-bold">
                            {formatPrice(plan.price)}
                            <span className="text-sm font-normal text-muted"> / {plan.billing_cycle}</span>
                        </p>

                        <ul className="mt-3 space-y-1 text-sm text-ink-soft">
                            {(plan.features ?? []).map((feature) => (
                                <li key={feature} className="flex gap-2">
                                    <Icon name="check" size={15} className="mt-0.5 text-ok" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <p className="mt-4 text-xs text-muted">{plan.companies_count} company(s) on this plan</p>

                        <div className="mt-4 flex gap-2">
                            <button type="button" onClick={() => startEdit(plan)} className="btn-ghost px-3 py-1.5 text-xs">
                                <Icon name="edit" size={14} /> Edit
                            </button>
                            <button type="button" onClick={() => remove(plan)} className="btn-danger px-3 py-1.5 text-xs">
                                <Icon name="trash" size={14} /> Delete
                            </button>
                        </div>
                    </div>
                ))}

                {plans.length === 0 && <p className="text-muted">No plans yet. Create your first plan.</p>}
            </div>
        </AppLayout>
    );
}
