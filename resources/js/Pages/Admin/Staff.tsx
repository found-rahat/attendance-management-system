import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Icon } from '../../components/Icons';
import { EmptyRow, Field, Flash, Modal, PageHeader } from '../../components/ui';
import { formatDate } from '../../lib/datetime';
import { money } from '../../lib/money';

type Salary = {
    basic_salary: number | string;
    house_rent: number | string;
    medical_allowance: number | string;
    transport_allowance: number | string;
    special_allowance: number | string;
} | null;

type StaffMember = {
    id: number;
    name: string;
    email: string;
    designation: string | null;
    office_id: string | null;
    created_at: string;
    attendances_count: number;
    latest_salary: Salary;
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
    designations: { id: number; name: string }[];
    today: string;
};

const EMPTY = {
    name: '', email: '', password: '', designation_id: '', office_id: '',
    effective_from: '', basic_salary: '', house_rent: '', medical_allowance: '',
    transport_allowance: '', special_allowance: '',
};

function gross(s: Salary): number {
    if (!s) return 0;
    return Number(s.basic_salary) + Number(s.house_rent) + Number(s.medical_allowance) + Number(s.transport_allowance) + Number(s.special_allowance);
}

export default function AdminStaff({ staff, subscription, designations, today }: Props) {
    const { errors, flash } = usePage().props;
    const [values, setValues] = useState({ ...EMPTY, effective_from: today });
    const [submitting, setSubmitting] = useState(false);
    const [open, setOpen] = useState(false);

    const unlimited = subscription.staff_limit <= 0;
    const limitLabel = unlimited ? 'Unlimited' : subscription.staff_limit;
    const atLimit = subscription.at_limit;
    const percent = unlimited ? 0 : Math.min(100, (subscription.staff_count / subscription.staff_limit) * 100);

    function update(field: keyof typeof values, value: string) {
        setValues((prev) => ({ ...prev, [field]: value }));
    }

    function openModal() {
        setValues({ ...EMPTY, effective_from: today });
        setOpen(true);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        router.post('/admin/staff', values, {
            preserveScroll: true,
            onSuccess: () => {
                setValues({ ...EMPTY, effective_from: today });
                setOpen(false);
            },
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

            <PageHeader icon="users" title="Staff Management" subtitle="Add and manage the people who check in at your office.">
                <button type="button" className="btn-primary" onClick={openModal} disabled={atLimit}>
                    <Icon name="plus" size={18} /> Add Staff
                </button>
            </PageHeader>

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

            <Modal open={open} onClose={() => setOpen(false)} title="Add a staff member">
                <form onSubmit={submit} className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field label="Name *">
                        <input type="text" className="input" value={values.name} onChange={(e) => update('name', e.target.value)} />
                    </Field>
                    <Field label="Email *">
                        <input type="email" className="input" value={values.email} onChange={(e) => update('email', e.target.value)} />
                    </Field>
                    <Field label="Password *">
                        <input type="text" className="input" value={values.password} onChange={(e) => update('password', e.target.value)} />
                    </Field>
                    <Field label="Designation">
                        <select className="input" value={values.designation_id} onChange={(e) => update('designation_id', e.target.value)}>
                            <option value="">{designations.length === 0 ? 'কোনো designation নেই' : 'Select designation'}</option>
                            {designations.map((d) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Employee / Office ID">
                        <input type="text" className="input" value={values.office_id} onChange={(e) => update('office_id', e.target.value)} placeholder="e.g. EMP-001" />
                    </Field>
                    <Field label="Salary Effective From">
                        <input type="date" className="input" value={values.effective_from} onChange={(e) => update('effective_from', e.target.value)} />
                    </Field>
                </div>

                {designations.length === 0 && (
                    <p className="text-xs text-warn-soft">
                        Designation তালিকা খালি — যোগ করতে{' '}
                        <Link href="/admin/designations" className="font-semibold underline">Designations page</Link> এ যান।
                    </p>
                )}

                <div>
                    <h3 className="mb-3 text-sm font-semibold text-ink-soft">Salary (optional — পরে Salary page থেকেও সেট করা যাবে)</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
                        <Field label="Basic (৳)">
                            <input type="number" className="input" value={values.basic_salary} onChange={(e) => update('basic_salary', e.target.value)} />
                        </Field>
                        <Field label="House Rent (৳)">
                            <input type="number" className="input" value={values.house_rent} onChange={(e) => update('house_rent', e.target.value)} />
                        </Field>
                        <Field label="Medical (৳)">
                            <input type="number" className="input" value={values.medical_allowance} onChange={(e) => update('medical_allowance', e.target.value)} />
                        </Field>
                        <Field label="Transport (৳)">
                            <input type="number" className="input" value={values.transport_allowance} onChange={(e) => update('transport_allowance', e.target.value)} />
                        </Field>
                        <Field label="Special (৳)">
                            <input type="number" className="input" value={values.special_allowance} onChange={(e) => update('special_allowance', e.target.value)} />
                        </Field>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
                        Cancel
                    </button>
                    <button type="submit" disabled={submitting || atLimit} className="btn-primary">
                        <Icon name="plus" size={18} />
                        {submitting ? 'Adding...' : 'Add staff'}
                    </button>
                </div>
                </form>
            </Modal>

            <div className="card mt-5 overflow-x-auto">
                <table className="data-table min-w-[960px]">
                    <thead>
                        <tr>
                            <th className="text-left">Name</th>
                            <th className="text-left">Email</th>
                            <th>Office ID</th>
                            <th>Designation</th>
                            <th className="text-right">Salary</th>
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
                                <td>{member.office_id ?? '—'}</td>
                                <td>{member.designation ?? '—'}</td>
                                <td className="text-right">
                                    {member.latest_salary ? money(gross(member.latest_salary)) : <span className="text-warn-soft">Not set</span>}
                                </td>
                                <td>{member.attendances_count}</td>
                                <td>{formatDate(member.created_at)}</td>
                                <td>
                                    <button type="button" onClick={() => remove(member)} className="btn-danger px-3 py-1.5 text-xs">
                                        <Icon name="trash" size={14} /> Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {staff.length === 0 && <EmptyRow colSpan={8}>No staff members yet.</EmptyRow>}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}