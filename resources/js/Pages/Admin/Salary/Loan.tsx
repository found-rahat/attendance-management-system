import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../../Layouts/AppLayout';
import { Icon } from '../../../components/Icons';
import { Badge, EmptyRow, Field, Flash, Modal, PageHeader } from '../../../components/ui';
import { money } from '../../../lib/money';
import SalaryNav from './SalaryNav';

type Category = { id: number; name: string; description: string | null };
type Loan = {
    id: number;
    amount: number | string;
    installment_amount: number | string;
    paid_installments: number;
    total_installments: number;
    remaining: number | string;
    granted_at: string;
    status: 'ongoing' | 'closed';
    note: string | null;
    staff: { id: number; name: string; email: string } | null;
    category: { id: number; name: string } | null;
};
type Staff = { id: number; name: string; email: string };

type Props = { categories: Category[]; loans: Loan[]; staff: Staff[]; today: string; categoryFilter?: string };

export default function SalaryLoan({ categories, loans, staff, today }: Props) {
    const { flash, errors, url } = usePage().props;
    const filter = new URLSearchParams(String(url).split('?')[1] ?? '').get('category') ?? '';

    const [catOpen, setCatOpen] = useState(false);
    const [catName, setCatName] = useState('');
    const [catDesc, setCatDesc] = useState('');
    const [loanOpen, setLoanOpen] = useState(false);
    const [loanForm, setLoanForm] = useState({
        staff_id: '', loan_category_id: '', amount: '', interest_rate: '0',
        installment_amount: '', total_installments: '', granted_at: today, note: '',
    });
    const [busy, setBusy] = useState(false);

    const saveCategory = () => {
        setBusy(true);
        router.post('/admin/salary/loan/categories', { name: catName, description: catDesc }, {
            preserveScroll: true,
            onSuccess: () => { setCatOpen(false); setCatName(''); setCatDesc(''); },
            onFinish: () => setBusy(false),
        });
    };

    const saveLoan = () => {
        setBusy(true);
        router.post('/admin/salary/loan', loanForm, {
            preserveScroll: true,
            onSuccess: () => { setLoanOpen(false); setLoanForm({ ...loanForm, staff_id: '', amount: '', installment_amount: '', total_installments: '' }); },
            onFinish: () => setBusy(false),
        });
    };

    return (
        <AppLayout>
            <Head title="Loan & Advance" />
            <PageHeader icon="card" title="Loan & Advance" subtitle="Staff loan / salary advance — মাসিক kist salary sheet থেকে auto কাটা হয়">
                <button className="btn-primary" onClick={() => setLoanOpen(true)}>
                    <Icon name="plus" size={18} /> New Loan / Advance
                </button>
                <button className="btn-ghost" onClick={() => setCatOpen(true)}>
                    <Icon name="filter" size={16} /> Add Category
                </button>
            </PageHeader>

            <SalaryNav />

            <Flash message={flash?.message} errors={errors} />

            <section className="card overflow-hidden">
                <div className="flex flex-wrap items-center gap-2 px-5 pt-4">
                    <h3 className="mr-2 font-semibold">Loans & Advances</h3>
                    <button className={`px-3 py-1 text-xs rounded-lg border ${filter === '' ? 'border-brand bg-brand/15 text-brand-soft' : 'border-line bg-panel-2 text-ink-soft'}`} onClick={() => router.get('/admin/salary/loan')}>সব</button>
                    {categories.map((c) => (
                        <button
                            key={c.id}
                            className={`px-3 py-1 text-xs rounded-lg border ${filter === String(c.id) ? 'border-brand bg-brand/15 text-brand-soft' : 'border-line bg-panel-2 text-ink-soft'}`}
                            onClick={() => router.get('/admin/salary/loan', { category: c.id })}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>
                <div className="overflow-x-auto">
                    <table className="data-table min-w-[900px]">
                        <thead>
                            <tr>
                                <th>Staff</th>
                                <th>Category</th>
                                <th className="text-right">Amount</th>
                                <th className="text-right">Kist</th>
                                <th className="text-right">Paid / Total</th>
                                <th className="text-right">Remaining</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loans.length === 0 && <EmptyRow colSpan={8}>কোনো loan / advance নেই।</EmptyRow>}
                            {loans.map((l) => (
                                <tr key={l.id}>
                                    <td>
                                        <p className="font-medium text-ink">{l.staff?.name}</p>
                                        <p className="text-xs text-muted">{l.granted_at}</p>
                                    </td>
                                    <td>{l.category?.name ?? '—'}</td>
                                    <td className="text-right">{money(l.amount)}</td>
                                    <td className="text-right">{money(l.installment_amount)}</td>
                                    <td className="text-right">{l.paid_installments} / {l.total_installments}</td>
                                    <td className="text-right font-semibold text-danger-soft">{money(l.remaining)}</td>
                                    <td>
                                        {l.status === 'closed' ? <Badge tone="neutral">Closed</Badge> : <Badge tone="ok">Ongoing</Badge>}
                                    </td>
                                    <td className="text-right">
                                        <div className="flex justify-end gap-1">
                                            {l.status === 'ongoing' && (
                                                <button className="btn-ghost px-2.5 py-1.5 text-xs" onClick={() => window.confirm('Mark this loan as closed?') && router.post(`/admin/salary/loan/${l.id}/close`, {}, { preserveScroll: true })}>
                                                    Close
                                                </button>
                                            )}
                                            <button
                                                className="btn-ghost px-2.5 py-1.5 text-danger-soft hover:border-danger/50"
                                                onClick={() => window.confirm('Delete this loan record?') && router.delete(`/admin/salary/loan/${l.id}`, { preserveScroll: true })}
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

            <section className="card mt-5 overflow-hidden">
                <h3 className="px-5 pt-4 pb-2 font-semibold">Loan Categories</h3>
                <div className="overflow-x-auto">
                    <table className="data-table min-w-[900px]">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((c) => (
                                <tr key={c.id}>
                                    <td className="font-medium text-ink">{c.name}</td>
                                    <td className="text-muted">{c.description ?? '—'}</td>
                                    <td className="text-right">
                                        <button
                                            className="btn-ghost px-2.5 py-1.5 text-danger-soft hover:border-danger/50"
                                            onClick={() => window.confirm('Delete this category?') && router.delete(`/admin/salary/loan/categories/${c.id}`, { preserveScroll: true })}
                                        >
                                            <Icon name="trash" size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="px-5 py-3 text-xs text-muted">💡 "Advance Salary" category থাকলে সেটাই staff salary advance হিসেবে ব্যবহার করুন।</p>
            </section>

            <Modal open={catOpen} onClose={() => setCatOpen(false)} title="Add Loan Category">
                <div className="grid gap-4">
                    <Field label="Name *">
                        <input type="text" className="input" value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="e.g. Personal Loan" />
                    </Field>
                    <Field label="Description">
                        <input type="text" className="input" value={catDesc} onChange={(e) => setCatDesc(e.target.value)} />
                    </Field>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                    <button className="btn-ghost" onClick={() => setCatOpen(false)}>Cancel</button>
                    <button className="btn-primary" disabled={busy || !catName} onClick={saveCategory}>{busy ? 'Saving…' : 'Save'}</button>
                </div>
            </Modal>

            <Modal open={loanOpen} onClose={() => setLoanOpen(false)} title="New Loan / Advance">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Staff *">
                        <select className="input" value={loanForm.staff_id} onChange={(e) => setLoanForm({ ...loanForm, staff_id: e.target.value })}>
                            <option value="">Select staff</option>
                            {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </Field>
                    <Field label="Category *">
                        <select className="input" value={loanForm.loan_category_id} onChange={(e) => setLoanForm({ ...loanForm, loan_category_id: e.target.value })}>
                            <option value="">Select category</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </Field>
                    <Field label="Amount (৳) *">
                        <input type="number" className="input" value={loanForm.amount} onChange={(e) => setLoanForm({ ...loanForm, amount: e.target.value })} />
                    </Field>
                    <Field label="Interest Rate (%)">
                        <input type="number" className="input" value={loanForm.interest_rate} onChange={(e) => setLoanForm({ ...loanForm, interest_rate: e.target.value })} />
                    </Field>
                    <Field label="Kist Amount (৳) — এই বা নিচের যেকোনো একটা">
                        <input type="number" className="input" value={loanForm.installment_amount} onChange={(e) => setLoanForm({ ...loanForm, installment_amount: e.target.value })} />
                    </Field>
                    <Field label="Kist সংখ্যা (installments)">
                        <input type="number" className="input" value={loanForm.total_installments} onChange={(e) => setLoanForm({ ...loanForm, total_installments: e.target.value })} />
                    </Field>
                    <Field label="Granted Date *">
                        <input type="date" className="input" value={loanForm.granted_at} onChange={(e) => setLoanForm({ ...loanForm, granted_at: e.target.value })} />
                    </Field>
                    <Field label="Note">
                        <input type="text" className="input" value={loanForm.note} onChange={(e) => setLoanForm({ ...loanForm, note: e.target.value })} />
                    </Field>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                    <button className="btn-ghost" onClick={() => setLoanOpen(false)}>Cancel</button>
                    <button className="btn-primary" disabled={busy} onClick={saveLoan}>{busy ? 'Saving…' : 'Save'}</button>
                </div>
            </Modal>
        </AppLayout>
    );
}