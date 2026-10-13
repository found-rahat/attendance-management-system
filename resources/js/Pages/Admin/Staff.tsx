import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Icon } from '../../components/Icons';
import { EmptyRow, Field, Flash, PageHeader } from '../../components/ui';
import { formatDate } from '../../lib/datetime';

type StaffMember = {
    id: number;
    name: string;
    email: string;
    created_at: string;
    attendances_count: number;
};

type Subscription = {
    plan_name: string | null;
    staff_limit: number;
    staff_count: number;
    at_limit: boolean;
};

type Props = {
    staff: StaffMember[];
    subscription: Subscription;
};

export default function AdminStaff({ staff, subscription }: Props) {
    const { errors, flash } = usePage().props;
    const [values, setValues] = useState({ name: '', email: '', password: '' });
    const [submitting, setSubmitting] = useState(false);

    const unlimited = subscription.staff_limit <= 0;
    const limitLabel = unlimited ? 'Unlimited' : subscription.staff_limit;
    const atLimit = subscription.at_limit;
    const percent = unlimited ? 0 : Math.min(100, (subscription.staff_count / subscription.staff_limit) * 100);

    function update(field: keyof typeof values, value: string) {
        setValues((prev) => ({ ...prev, [field]: value }));
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        router.post('/admin/staff', values, {
            preserveScroll: true,
            onSuccess: () => setValues({ name: '', email: '', password: '' }),
            onFinish: () => setSubmitting(false),
        });
    }

    function remove(member: StaffMember) {
        if (!confirm(`Remove ${member.name}? This will delete their attendance history.`)) return;
        router.delete(`/admin/staff/${member.id}`, { preserveScroll: true });
    }

    return (
        <AppLayout>
            <Head title="Staff Management" />

            <PageHeader icon="users" title="Staff Management" subtitle="Add and manage the people who check in at your office." />

            <Flash message={flash?.message} errors={errors} />

            <div className="card mt-5 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-muted">
                        Plan: <span className="font-semibold text-ink">{subscription.plan_name ?? 'No plan'}</span>
                    </p>
                    <p className="text-sm text-muted">
                        Staff used:{' '}
                        <span className="font-semibold text-ink">
                            {subscription.staff_count} / {limitLabel}
                        </span>
                    </p>
                </div>

                {!unlimited && (
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-panel-3">
                        <div
                            className={`h-full rounded-full ${atLimit ? 'bg-danger' : 'bg-brand'}`}
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                )}

                {atLimit && (
                    <p className="mt-3 rounded-xl border border-warn/40 bg-warn/10 p-3 text-sm text-warn-soft">
                        আপনার plan-এর staff limit পূর্ণ হয়ে গেছে। আরও staff যোগ করতে platform admin-এর
                        সাথে যোগাযোগ করে plan upgrade করুন।
                    </p>
                )}
            </div>

            <form onSubmit={submit} className="card mt-5 space-y-4 p-5">
                <h2 className="font-semibold">Add a staff member</h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field label="Name">
                        <input type="text" className="input" value={values.name} onChange={(e) => update('name', e.target.value)} />
                    </Field>
                    <Field label="Email">
                        <input type="email" className="input" value={values.email} onChange={(e) => update('email', e.target.value)} />
                    </Field>
                    <Field label="Password">
                        <input type="text" className="input" value={values.password} onChange={(e) => update('password', e.target.value)} />
                    </Field>
                </div>

                <button type="submit" disabled={submitting || atLimit} className="btn-primary">
                    <Icon name="plus" size={18} />
                    {submitting ? 'Adding...' : 'Add staff'}
                </button>
            </form>

            <div className="card mt-5 overflow-x-auto">
                <table className="data-table min-w-[680px]">
                    <thead>
                        <tr>
                            <th className="text-left">Name</th>
                            <th className="text-left">Email</th>
                            <th>Records</th>
                            <th>Joined</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {staff.map((member) => (
                            <tr key={member.id}>
                                <td className="text-left font-medium">{member.name}</td>
                                <td className="text-left text-muted">{member.email}</td>
                                <td>{member.attendances_count}</td>
                                <td>{formatDate(member.created_at)}</td>
                                <td>
                                    <button type="button" onClick={() => remove(member)} className="btn-danger px-3 py-1.5 text-xs">
                                        <Icon name="trash" size={14} /> Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {staff.length === 0 && <EmptyRow colSpan={5}>No staff members yet.</EmptyRow>}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
