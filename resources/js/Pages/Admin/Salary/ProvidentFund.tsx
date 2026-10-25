import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../../Layouts/AppLayout';
import { Icon } from '../../../components/Icons';
import { Badge, EmptyRow, Field, Flash, Modal, PageHeader } from '../../../components/ui';
import SalaryNav from './SalaryNav';

type PType = {
    id: number;
    name: string;
    employee_percent: number | string;
    employer_percent: number | string;
    is_active: boolean;
};
type Fund = {
    id: number;
    enrolled_at: string;
    staff: { id: number; name: string; email: string } | null;
    type: { id: number; name: string; employee_percent: number | string; employer_percent: number | string } | null;
};
type Staff = { id: number; name: string; email: string };

type Props = { types: PType[]; funds: Fund[]; staff: Staff[]; today: string };

export default function SalaryProvidentFund({ types, funds, staff, today }: Props) {
    const { flash, errors } = usePage().props;

    const [typeModal, setTypeModal] = useState<null | { original: PType | null }>(null);
    const [typeForm, setTypeForm] = useState({ name: '', employee_percent: '', employer_percent: '', is_active: true });
    const [enrollOpen, setEnrollOpen] = useState(false);
    const [enrollForm, setEnrollForm] = useState({ staff_id: '', provident_fund_type_id: '', enrolled_at: today });
    const [editFund, setEditFund] = useState<Fund | null>(null);
    const [editFundType, setEditFundType] = useState('');
    const [busy, setBusy] = useState(false);

    const openTypeAdd = () => {
        setTypeForm({ name: '', employee_percent: '', employer_percent: '', is_active: true });
        setTypeModal({ original: null });
    };
    const openTypeEdit = (t: PType) => {
        setTypeForm({ name: t.name, employee_percent: String(t.employee_percent), employer_percent: String(t.employer_percent), is_active: t.is_active });
        setTypeModal({ original: t });
    };
    const saveType = () => {
        setBusy(true);
        const url = typeModal?.original ? `/admin/salary/provident/types/${typeModal.original.id}` : '/admin/salary/provident/types';
        router[typeModal?.original ? 'put' : 'post'](url, typeForm, { preserveScroll: true, onSuccess: () => setTypeModal(null), onFinish: () => setBusy(false) });
    };
    const enroll = () => {
        setBusy(true);
        router.post('/admin/salary/provident', enrollForm, { preserveScroll: true, onSuccess: () => setEnrollOpen(false), onFinish: () => setBusy(false) });
    };
    const saveFund = () => {
        if (!editFund) return;
        setBusy(true);
        router.put(`/admin/salary/provident/${editFund.id}`, { provident_fund_type_id: editFundType, enrolled_at: editFund.enrolled_at }, { preserveScroll: true, onSuccess: () => setEditFund(null), onFinish: () => setBusy(false) });
    };

    return (
        <AppLayout>
            <Head title="Provident Fund" />
            <PageHeader icon="shield" title="Provident Fund" subtitle="PF type ও staff enrollment — employee % basic থেকে monthly sheet-এ auto কাটা হয়">
                <button className="btn-primary" onClick={() => setEnrollOpen(true)}>
                    <Icon name="plus" size={18} /> Enroll Staff
                </button>
                <button className="btn-ghost" onClick={openTypeAdd}>
                    <Icon name="plus" size={16} /> Add Type
                </button>
            </PageHeader>

            <SalaryNav />

            <Flash message={flash?.message} errors={errors} />

            <div className="grid gap-5 xl:grid-cols-2">
                <section className="card overflow-hidden">
                    <h3 className="px-5 pt-4 pb-2 font-semibold">Provident Fund Types</h3>
                    <div className="overflow-x-auto">
                        <table className="data-table min-w-[640px]">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th className="text-right">Employee %</th>
                                    <th className="text-right">Employer %</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {types.length === 0 && <EmptyRow colSpan={5}>কোনো PF type নেই।</EmptyRow>}
                                {types.map((t) => (
                                    <tr key={t.id}>
                                        <td className="font-medium text-ink">{t.name}</td>
                                        <td className="text-right">{t.employee_percent}%</td>
                                        <td className="text-right">{t.employer_percent}%</td>
                                        <td>{t.is_active ? <Badge tone="ok">Active</Badge> : <Badge tone="neutral">Inactive</Badge>}</td>
                                        <td className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <button className="btn-ghost px-2.5 py-1.5" onClick={() => openTypeEdit(t)}>
                                                    <Icon name="edit" size={14} />
                                                </button>
                                                <button
                                                    className="btn-ghost px-2.5 py-1.5 text-danger-soft hover:border-danger/50"
                                                    onClick={() => window.confirm('Delete this PF type?') && router.delete(`/admin/salary/provident/types/${t.id}`, { preserveScroll: true })}
                                                >
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
                    <h3 className="px-5 pt-4 pb-2 font-semibold">Staff Enrollment</h3>
                    <div className="overflow-x-auto">
                        <table className="data-table min-w-[640px]">
                            <thead>
                                <tr>
                                    <th>Staff</th>
                                    <th>Type</th>
                                    <th className="text-right">Employee %</th>
                                    <th>Enrolled</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {funds.length === 0 && <EmptyRow colSpan={5}>কোনো staff enrolled নেই।</EmptyRow>}
                                {funds.map((f) => (
                                    <tr key={f.id}>
                                        <td>
                                            <p className="font-medium text-ink">{f.staff?.name}</p>
                                            <p className="text-xs text-muted">{f.staff?.email}</p>
                                        </td>
                                        <td>{f.type?.name ?? '—'}</td>
                                        <td className="text-right">{f.type?.employee_percent}%</td>
                                        <td className="text-xs text-muted">{f.enrolled_at}</td>
                                        <td className="text-right">
                                            <button className="btn-ghost px-2.5 py-1.5" onClick={() => { setEditFund(f); setEditFundType(String(f.type?.id ?? '')); }}>
                                                <Icon name="edit" size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            <Modal open={typeModal !== null} onClose={() => setTypeModal(null)} title={typeModal?.original ? 'Edit PF Type' : 'Add PF Type'}>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Name *">
                        <input type="text" className="input" value={typeForm.name} onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })} />
                    </Field>
                    <Field label="Employee % *">
                        <input type="number" className="input" value={typeForm.employee_percent} onChange={(e) => setTypeForm({ ...typeForm, employee_percent: e.target.value })} />
                    </Field>
                    <Field label="Employer %">
                        <input type="number" className="input" value={typeForm.employer_percent} onChange={(e) => setTypeForm({ ...typeForm, employer_percent: e.target.value })} />
                    </Field>
                    <Field label="Status">
                        <select className="input" value={String(typeForm.is_active)} onChange={(e) => setTypeForm({ ...typeForm, is_active: e.target.value === 'true' })}>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </Field>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                    <button className="btn-ghost" onClick={() => setTypeModal(null)}>Cancel</button>
                    <button className="btn-primary" disabled={busy} onClick={saveType}>{busy ? 'Saving…' : 'Save'}</button>
                </div>
            </Modal>

            <Modal open={enrollOpen} onClose={() => setEnrollOpen(false)} title="Enroll Staff in PF">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Staff *">
                        <select className="input" value={enrollForm.staff_id} onChange={(e) => setEnrollForm({ ...enrollForm, staff_id: e.target.value })}>
                            <option value="">Select staff</option>
                            {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </Field>
                    <Field label="PF Type *">
                        <select className="input" value={enrollForm.provident_fund_type_id} onChange={(e) => setEnrollForm({ ...enrollForm, provident_fund_type_id: e.target.value })}>
                            <option value="">Select type</option>
                            {types.filter((t) => t.is_active).map((t) => (
                                <option key={t.id} value={t.id}>{t.name} (Emp {t.employee_percent}%)</option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Enrolled Date">
                        <input type="date" className="input" value={enrollForm.enrolled_at} onChange={(e) => setEnrollForm({ ...enrollForm, enrolled_at: e.target.value })} />
                    </Field>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                    <button className="btn-ghost" onClick={() => setEnrollOpen(false)}>Cancel</button>
                    <button className="btn-primary" disabled={busy} onClick={enroll}>{busy ? 'Saving…' : 'Enroll'}</button>
                </div>
            </Modal>

            <Modal open={editFund !== null} onClose={() => setEditFund(null)} title="Edit PF Enrollment">
                <div className="grid gap-4">
                    <Field label="PF Type">
                        <select className="input" value={editFundType} onChange={(e) => setEditFundType(e.target.value)}>
                            <option value="">Select type</option>
                            {types.map((t) => <option key={t.id} value={t.id}>{t.name} (Emp {t.employee_percent}%)</option>)}
                        </select>
                    </Field>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                    <button className="btn-ghost" onClick={() => setEditFund(null)}>Cancel</button>
                    <button className="btn-primary" disabled={busy} onClick={saveFund}>{busy ? 'Saving…' : 'Save'}</button>
                </div>
            </Modal>
        </AppLayout>
    );
}