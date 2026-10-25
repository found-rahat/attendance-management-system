import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../../Layouts/AppLayout';
import { Icon } from '../../../components/Icons';
import { Badge, EmptyRow, Field, Flash, Modal, PageHeader } from '../../../components/ui';
import { money } from '../../../lib/money';
import SalaryNav from './SalaryNav';

type BonusType = {
    id: number;
    name: string;
    amount_type: 'fixed' | 'percent';
    fixed_amount: number | string;
    percentage: number | string;
    description: string | null;
    is_active: boolean;
};
type Bonus = {
    id: number;
    amount: number | string;
    month: string | null;
    note: string | null;
    staff: { id: number; name: string; email: string } | null;
    type: { id: number; name: string; amount_type: string } | null;
};
type Staff = { id: number; name: string; email: string };

type Props = { types: BonusType[]; bonuses: Bonus[]; staff: Staff[]; today: string };

export default function SalaryBonus({ types, bonuses, staff, today }: Props) {
    const { flash, errors } = usePage().props;

    const [typeModal, setTypeModal] = useState<null | { original: BonusType | null }>(null);
    const [typeForm, setTypeForm] = useState({ name: '', amount_type: 'fixed', fixed_amount: '', percentage: '', description: '', is_active: true });
    const [assignOpen, setAssignOpen] = useState(false);
    const [assignForm, setAssignForm] = useState({ staff_id: '', bonus_type_id: '', month: today, note: '' });
    const [busy, setBusy] = useState(false);

    const openTypeAdd = () => {
        setTypeForm({ name: '', amount_type: 'fixed', fixed_amount: '', percentage: '', description: '', is_active: true });
        setTypeModal({ original: null });
    };
    const openTypeEdit = (t: BonusType) => {
        setTypeForm({ name: t.name, amount_type: t.amount_type, fixed_amount: String(t.fixed_amount), percentage: String(t.percentage), description: t.description ?? '', is_active: t.is_active });
        setTypeModal({ original: t });
    };
    const saveType = () => {
        setBusy(true);
        const url = typeModal?.original ? `/admin/salary/bonus/types/${typeModal.original.id}` : '/admin/salary/bonus/types';
        router[typeModal?.original ? 'put' : 'post'](url, typeForm, {
            preserveScroll: true,
            onSuccess: () => setTypeModal(null),
            onFinish: () => setBusy(false),
        });
    };
    const deleteType = (t: BonusType) => {
        if (!window.confirm('Delete bonus type?')) return;
        router.delete(`/admin/salary/bonus/types/${t.id}`, { preserveScroll: true });
    };
    const assign = () => {
        setBusy(true);
        router.post('/admin/salary/bonus', assignForm, {
            preserveScroll: true,
            onSuccess: () => setAssignOpen(false),
            onFinish: () => setBusy(false),
        });
    };

    return (
        <AppLayout>
            <Head title="Bonus" />
            <PageHeader icon="gift" title="Bonus" subtitle="Bonus types ও staff-দের bonus assignment">
                <button className="btn-primary" onClick={() => setAssignOpen(true)}>
                    <Icon name="gift" size={18} /> Assign Bonus
                </button>
                <button className="btn-ghost" onClick={openTypeAdd}>
                    <Icon name="plus" size={16} /> Add Type
                </button>
            </PageHeader>

            <SalaryNav />

            <Flash message={flash?.message} errors={errors} />

            <div className="grid gap-5 xl:grid-cols-2">
                <section className="card overflow-hidden">
                    <h3 className="px-5 pt-4 pb-2 font-semibold">Bonus Types</h3>
                    <div className="overflow-x-auto">
                        <table className="data-table min-w-[560px]">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th className="text-right">Amount</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {types.length === 0 && <EmptyRow colSpan={5}>কোনো bonus type নেই।</EmptyRow>}
                                {types.map((t) => (
                                    <tr key={t.id}>
                                        <td>
                                            <p className="font-medium text-ink">{t.name}</p>
                                            {t.description && <p className="text-xs text-muted">{t.description}</p>}
                                        </td>
                                        <td><Badge tone={t.amount_type === 'percent' ? 'info' : 'neutral'}>{t.amount_type}</Badge></td>
                                        <td className="text-right">
                                            {t.amount_type === 'percent' ? `${t.percentage}%` : money(t.fixed_amount)}
                                        </td>
                                        <td>{t.is_active ? <Badge tone="ok">Active</Badge> : <Badge tone="neutral">Inactive</Badge>}</td>
                                        <td className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <button className="btn-ghost px-2.5 py-1.5" onClick={() => openTypeEdit(t)}>
                                                    <Icon name="edit" size={14} />
                                                </button>
                                                <button className="btn-ghost px-2.5 py-1.5 text-danger-soft hover:border-danger/50" onClick={() => deleteType(t)}>
                                                    <Icon name="trash" size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="card overflow-hidden">
                    <h3 className="px-5 pt-4 pb-2 font-semibold">Bonus List</h3>
                    <div className="overflow-x-auto">
                        <table className="data-table min-w-[560px]">
                            <thead>
                                <tr>
                                    <th>Staff</th>
                                    <th>Type</th>
                                    <th className="text-right">Amount</th>
                                    <th>Month</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bonuses.length === 0 && <EmptyRow colSpan={5}>কোনো bonus দেওয়া হয়নি।</EmptyRow>}
                                {bonuses.map((b) => (
                                    <tr key={b.id}>
                                        <td className="font-medium text-ink">{b.staff?.name}</td>
                                        <td>{b.type?.name}</td>
                                        <td className="text-right font-medium text-gold">{money(b.amount)}</td>
                                        <td className="text-xs text-muted">{b.month ?? '—'}</td>
                                        <td className="text-right">
                                            <button
                                                className="btn-ghost px-2.5 py-1.5 text-danger-soft hover:border-danger/50"
                                                onClick={() => window.confirm('Delete this bonus record?') && router.delete(`/admin/salary/bonus/${b.id}`, { preserveScroll: true })}
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
            </div>

            <Modal open={typeModal !== null} onClose={() => setTypeModal(null)} title={typeModal?.original ? 'Edit Bonus Type' : 'Add Bonus Type'}>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Name *">
                        <input type="text" className="input" value={typeForm.name} onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })} />
                    </Field>
                    <Field label="Amount Type *">
                        <select className="input" value={typeForm.amount_type} onChange={(e) => setTypeForm({ ...typeForm, amount_type: e.target.value as 'fixed' | 'percent' })}>
                            <option value="fixed">Fixed amount</option>
                            <option value="percent">Percentage of basic</option>
                        </select>
                    </Field>
                    {typeForm.amount_type === 'fixed' ? (
                        <Field label="Fixed Amount (৳) *">
                            <input type="number" className="input" value={typeForm.fixed_amount} onChange={(e) => setTypeForm({ ...typeForm, fixed_amount: e.target.value })} />
                        </Field>
                    ) : (
                        <Field label="Percentage (%) *">
                            <input type="number" className="input" value={typeForm.percentage} onChange={(e) => setTypeForm({ ...typeForm, percentage: e.target.value })} />
                        </Field>
                    )}
                    <Field label="Status">
                        <select className="input" value={String(typeForm.is_active)} onChange={(e) => setTypeForm({ ...typeForm, is_active: e.target.value === 'true' })}>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </Field>
                    <Field label="Description" className="sm:col-span-2">
                        <input type="text" className="input" value={typeForm.description} onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })} />
                    </Field>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                    <button className="btn-ghost" onClick={() => setTypeModal(null)}>Cancel</button>
                    <button className="btn-primary" disabled={busy} onClick={saveType}>{busy ? 'Saving…' : 'Save'}</button>
                </div>
            </Modal>

            <Modal open={assignOpen} onClose={() => setAssignOpen(false)} title="Assign Bonus">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Staff *">
                        <select className="input" value={assignForm.staff_id} onChange={(e) => setAssignForm({ ...assignForm, staff_id: e.target.value })}>
                            <option value="">Select staff</option>
                            {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </Field>
                    <Field label="Bonus Type *">
                        <select className="input" value={assignForm.bonus_type_id} onChange={(e) => setAssignForm({ ...assignForm, bonus_type_id: e.target.value })}>
                            <option value="">Select type</option>
                            {types.filter((t) => t.is_active).map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name} ({t.amount_type === 'percent' ? `${t.percentage}%` : money(t.fixed_amount)})
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Month (যে মাসের sheet-এ যোগ হবে)">
                        <input type="month" className="input" value={assignForm.month} onChange={(e) => setAssignForm({ ...assignForm, month: e.target.value })} />
                    </Field>
                    <Field label="Note">
                        <input type="text" className="input" value={assignForm.note} onChange={(e) => setAssignForm({ ...assignForm, note: e.target.value })} />
                    </Field>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                    <button className="btn-ghost" onClick={() => setAssignOpen(false)}>Cancel</button>
                    <button className="btn-primary" disabled={busy} onClick={assign}>{busy ? 'Saving…' : 'Assign'}</button>
                </div>
            </Modal>
        </AppLayout>
    );
}