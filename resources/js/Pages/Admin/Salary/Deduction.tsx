import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../../Layouts/AppLayout';
import { Icon } from '../../../components/Icons';
import { EmptyRow, Field, Flash, Modal, PageHeader } from '../../../components/ui';
import { money } from '../../../lib/money';
import SalaryNav from './SalaryNav';

type Deduction = {
    id: number;
    amount: number | string;
    reason: string;
    month: string | null;
    note: string | null;
    staff: { id: number; name: string; email: string } | null;
};
type Staff = { id: number; name: string; email: string };

type Props = { deductions: Deduction[]; staff: Staff[]; today: string };

export default function SalaryDeduction({ deductions, staff, today }: Props) {
    const { flash, errors } = usePage().props;
    const [form, setForm] = useState({ staff_id: '', amount: '', reason: '', month: today, note: '' });
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);

    const submit = () => {
        setBusy(true);
        router.post('/admin/salary/deduction', form, {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                setForm({ staff_id: '', amount: '', reason: '', month: today, note: '' });
            },
            onFinish: () => setBusy(false),
        });
    };

    return (
        <AppLayout>
            <Head title="Salary Deduction" />
            <PageHeader icon="minus" title="Salary Deduction" subtitle="Manually add deduction (fine, absent, misc) — monthly sheet-এ auto যুক্ত হয়">
                <button className="btn-primary" onClick={() => setOpen(true)}>
                    <Icon name="plus" size={18} /> Add Deduction
                </button>
            </PageHeader>

            <SalaryNav />

            <Flash message={flash?.message} errors={errors} />

            <section className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table min-w-[640px]">
                        <thead>
                            <tr>
                                <th>Staff</th>
                                <th className="text-right">Amount</th>
                                <th>Reason</th>
                                <th>Month</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deductions.length === 0 && <EmptyRow colSpan={5}>কোনো deduction নেই।</EmptyRow>}
                            {deductions.map((d) => (
                                <tr key={d.id}>
                                    <td className="font-medium text-ink">{d.staff?.name}</td>
                                    <td className="text-right font-semibold text-danger-soft">{money(d.amount)}</td>
                                    <td>
                                        {d.reason}
                                        {d.note && <p className="text-xs text-muted">{d.note}</p>}
                                    </td>
                                    <td className="text-xs text-muted">{d.month ?? 'সব মাসে'}</td>
                                    <td className="text-right">
                                        <button
                                            className="btn-ghost px-2.5 py-1.5 text-danger-soft hover:border-danger/50"
                                            onClick={() => window.confirm('Delete this deduction?') && router.delete(`/admin/salary/deduction/${d.id}`, { preserveScroll: true })}
                                        >
                                            <Icon name="trash" size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <Modal open={open} onClose={() => setOpen(false)} title="Add Deduction">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Staff *">
                        <select className="input" value={form.staff_id} onChange={(e) => setForm({ ...form, staff_id: e.target.value })}>
                            <option value="">Select staff</option>
                            {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </Field>
                    <Field label="Amount (৳) *">
                        <input type="number" className="input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                    </Field>
                    <Field label="Reason *">
                        <input type="text" className="input" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="e.g. Absent fine" />
                    </Field>
                    <Field label="Month (কোনো মাসে apply হবে)">
                        <input type="month" className="input" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} />
                    </Field>
                    <Field label="Note" className="sm:col-span-2">
                        <input type="text" className="input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                    </Field>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                    <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
                    <button className="btn-primary" disabled={busy} onClick={submit}>{busy ? 'Saving…' : 'Save'}</button>
                </div>
            </Modal>
        </AppLayout>
    );
}