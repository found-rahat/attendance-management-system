import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AppLayout from '../../../Layouts/AppLayout';
import { Icon } from '../../../components/Icons';
import { Badge, EmptyRow, Field, Flash, Modal, PageHeader, StatCard } from '../../../components/ui';
import { money } from '../../../lib/money';
import SalaryNav from './SalaryNav';

type SheetRow = {
    id: number;
    month: string;
    basic: number | string;
    house_rent: number | string;
    medical: number | string;
    transport: number | string;
    special: number | string;
    bonus: number | string;
    pf_employee: number | string;
    pf_employer: number | string;
    loan_installment: number | string;
    manual_deduction: number | string;
    total_earning: number | string;
    total_deduction: number | string;
    net: number | string;
    status: 'draft' | 'approved' | 'paid';
    paid_at: string | null;
    staff: { id: number; name: string; email: string; designation?: string | null } | null;
};

type Props = {
    month: string;
    sheets: SheetRow[];
    staff: { id: number; name: string; email: string }[];
    has_salary_set: number[];
    last_generated_month: string | null;
};

const STATUS_META: Record<string, { tone: 'neutral' | 'info' | 'ok'; label: string }> = {
    draft: { tone: 'neutral', label: 'Draft' },
    approved: { tone: 'info', label: 'Approved' },
    paid: { tone: 'ok', label: 'Paid' },
};

export default function SalarySheetPage({ month, sheets, staff, has_salary_set, last_generated_month }: Props) {
    const { flash, errors } = usePage().props;
    const [currentMonth, setCurrentMonth] = useState(month);
    const [genOpen, setGenOpen] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [busy, setBusy] = useState(false);

    const salarySet = useMemo(() => new Set(has_salary_set), [has_salary_set]);

    const totals = useMemo(() => {
        return sheets.reduce(
            (acc, s) => ({
                earning: acc.earning + Number(s.total_earning),
                deduction: acc.deduction + Number(s.total_deduction),
                net: acc.net + Number(s.net),
                paid: acc.paid + (s.status === 'paid' ? 1 : 0),
            }),
            { earning: 0, deduction: 0, net: 0, paid: 0 },
        );
    }, [sheets]);

    const loadMonth = () => router.get('/admin/salary/sheet', { month: currentMonth }, { preserveState: true });

    const openGenerate = () => {
        setSelected(staff.filter((s) => has_salary_set.includes(s.id)).map((s) => s.id));
        setGenOpen(true);
    };

    const generate = () => {
        setBusy(true);
        router.post(
            '/admin/salary/sheet/generate',
            { month: currentMonth, staff_ids: selected },
            { preserveScroll: true, onFinish: () => { setBusy(false); setGenOpen(false); } },
        );
    };

    const run = (method: 'post' | 'delete', url: string, withConfirm = false) => {
        if (withConfirm && !window.confirm('Remove this sheet entry?')) return;
        setBusy(true);
        router[method](url, {}, { preserveScroll: true, onFinish: () => setBusy(false) });
    };

    return (
        <AppLayout>
            <Head title="Salary Sheet" />
            <PageHeader icon="pay" title="Salary Sheet" subtitle="Month-wise earnings & deductions (auto PF, loan kist, bonus, deduction)">
                <Field label="Month">
                    <input type="month" className="input" value={currentMonth} onChange={(e) => setCurrentMonth(e.target.value)} />
                </Field>
                <button className="btn-ghost" onClick={loadMonth}>Load</button>
                <button className="btn-primary" onClick={openGenerate}>
                    <Icon name="plus" size={18} /> Generate Sheet
                </button>
            </PageHeader>

            <SalaryNav />

            <Flash message={flash?.message} errors={errors} />

            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard tone="purple" icon="pay" label="Total Earning" value={money(totals.earning)} />
                <StatCard tone="orange" icon="minus" label="Total Deduction" value={money(totals.deduction)} />
                <StatCard tone="green" icon="check" label="Net Payable" value={money(totals.net)} />
                <StatCard tone="cyan" icon="users" label="Staff / Paid" value={`${sheets.length} / ${totals.paid}`} sub={last_generated_month ? `Last generated: ${last_generated_month}` : undefined} />
            </section>

            <section className="card mt-5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table min-w-[1150px]">
                        <thead>
                            <tr>
                                <th>Staff</th>
                                <th className="text-right">Basic</th>
                                <th className="text-right">Allow.</th>
                                <th className="text-right">Bonus</th>
                                <th className="text-right">Earning</th>
                                <th className="text-right">PF (Emp)</th>
                                <th className="text-right">Loan Kist</th>
                                <th className="text-right">Deduct.</th>
                                <th className="text-right">Net</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sheets.length === 0 && (
                                <EmptyRow colSpan={11}>
                                    এই মাসে এখনও sheet generate হয়নি। উপরে <b>Generate Sheet</b> চাপুন।
                                </EmptyRow>
                            )}
                            {sheets.map((s) => {
                                const allowance = Number(s.house_rent) + Number(s.medical) + Number(s.transport) + Number(s.special);
                                const meta = STATUS_META[s.status];

                                return (
                                    <tr key={s.id}>
                                        <td>
                                            <p className="font-medium text-ink">{s.staff?.name}</p>
                                            <p className="text-xs text-muted">{s.staff?.designation || s.staff?.email}</p>
                                        </td>
                                        <td className="text-right">{money(s.basic)}</td>
                                        <td className="text-right">{money(allowance)}</td>
                                        <td className="text-right text-gold">{money(s.bonus)}</td>
                                        <td className="text-right font-medium">{money(s.total_earning)}</td>
                                        <td className="text-right">{money(s.pf_employee)}</td>
                                        <td className="text-right">{money(s.loan_installment)}</td>
                                        <td className="text-right">{money(s.manual_deduction)}</td>
                                        <td className="text-right font-semibold text-ok-soft">{money(s.net)}</td>
                                        <td><Badge tone={meta.tone}>{meta.label}</Badge></td>
                                        <td className="text-right">
                                            <div className="flex justify-end gap-1">
                                                {s.status === 'draft' && (
                                                    <>
                                                        <button className="btn-ghost px-2.5 py-1.5 text-xs" onClick={() => run('post', `/admin/salary/sheet/${s.id}/approve`)}>Approve</button>
                                                        <button className="btn-ghost px-2.5 py-1.5 text-xs text-danger-soft hover:border-danger/50" onClick={() => run('delete', `/admin/salary/sheet/${s.id}`, true)}>
                                                            <Icon name="trash" size={14} />
                                                        </button>
                                                    </>
                                                )}
                                                {s.status === 'approved' && (
                                                    <button className="btn-primary px-2.5 py-1.5 text-xs" onClick={() => run('post', `/admin/salary/sheet/${s.id}/pay`)}>Mark Paid</button>
                                                )}
                                                {s.status === 'paid' && (
                                                    <span className="text-xs text-muted">{s.paid_at}</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            {sheets.length > 0 && (
                <p className="mt-3 text-xs text-muted">
                    Allow. = house rent + medical + transport + special · PF = basic × employee % · Loan kist ও manual deduction auto অন্তর্ভুক্ত হয়।
                </p>
            )}

            <Modal open={genOpen} onClose={() => setGenOpen(false)} title={`Generate Sheet · ${currentMonth}`}>
                <p className="mb-3 text-sm text-muted">
                    যেসব staff-এর salary set আছে তারা বাছাই করা থাকবে। Existing sheet entries replace হবে। Loan kist একবার মাসে deduction হয়।
                </p>
                <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-line p-3">
                    {staff.length === 0 && <p className="text-sm text-muted">কোনো staff নেই।</p>}
                    {staff.map((s) => (
                        <label key={s.id} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-hover">
                            <input
                                type="checkbox"
                                className="size-4 accent-[#8b2ce8]"
                                checked={selected.includes(s.id)}
                                disabled={!salarySet.has(s.id)}
                                onChange={(e) => {
                                    setSelected((prev) => e.target.checked ? [...prev, s.id] : prev.filter((id) => id !== s.id));
                                }}
                            />
                            <span className="flex-1">{s.name}</span>
                            {!salarySet.has(s.id) && <span className="text-xs text-warn-soft">salary set নেই</span>}
                        </label>
                    ))}
                </div>
                <div className="mt-5 flex justify-end gap-2">
                    <button className="btn-ghost" onClick={() => setGenOpen(false)}>Cancel</button>
                    <button className="btn-primary" disabled={busy || selected.length === 0} onClick={generate}>
                        {busy ? 'Generating…' : 'Generate'}
                    </button>
                </div>
            </Modal>
        </AppLayout>
    );
}