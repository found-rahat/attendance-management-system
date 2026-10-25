import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../../Layouts/AppLayout';
import { Icon } from '../../../components/Icons';
import { Badge, EmptyRow, Field, Flash, Modal, PageHeader } from '../../../components/ui';
import { money } from '../../../lib/money';
import SalaryNav from './SalaryNav';

type Staff = { id: number; name: string; email: string; designation: string | null };
type Salary = {
    id: number;
    basic_salary: number | string;
    house_rent: number | string;
    medical_allowance: number | string;
    transport_allowance: number | string;
    special_allowance: number | string;
    effective_from: string;
    note: string | null;
};
type Promotion = {
    id: number;
    old_designation: string | null;
    new_designation: string | null;
    old_salary: number | string | null;
    new_salary: number | string | null;
    effective_from: string;
    note: string | null;
    staff: Staff | null;
};

type Props = {
    staff: Staff[];
    designations: { id: number; name: string }[];
    salaries: Record<number, Salary[]>;
    promotions: Promotion[];
    today: string;
};

function gross(s: Salary): number {
    return Number(s.basic_salary) + Number(s.house_rent) + Number(s.medical_allowance) + Number(s.transport_allowance) + Number(s.special_allowance);
}

export default function SalaryIndex({ staff, designations, salaries, promotions, today }: Props) {
    const { flash, errors } = usePage().props;

    const [setOpen, setSetOpen] = useState(false);
    const [incOpen, setIncOpen] = useState(false);
    const [promOpen, setPromOpen] = useState(false);
    const [setForm, setSetForm] = useState({
        staff_id: '', basic_salary: '', house_rent: '0', medical_allowance: '0',
        transport_allowance: '0', special_allowance: '0', effective_from: today, note: '',
    });
    const [incForm, setIncForm] = useState({ staff_id: '', type: 'amount', value: '', effective_from: today, note: '' });
    const [promForm, setPromForm] = useState({ staff_id: '', designation_id: '', new_salary: '', effective_from: today, note: '' });
    const [busy, setBusy] = useState(false);

    const submit = (url: string, data: Record<string, unknown>) => {
        setBusy(true);
        router.post(url, data, {
            preserveScroll: true,
            onSuccess: () => {
                setSetOpen(false);
                setIncOpen(false);
                setPromOpen(false);
            },
            onFinish: () => setBusy(false),
        });
    };

    return (
        <AppLayout>
            <Head title="Staff Salary" />
            <PageHeader icon="pay" title="Staff Salary" subtitle="Payroll structure, increment & promotion per staff">
                <button className="btn-primary" onClick={() => setSetOpen(true)}>
                    <Icon name="plus" size={18} /> Set Salary
                </button>
                <button className="btn-ghost" onClick={() => setIncOpen(true)}>
                    <Icon name="edit" size={16} /> Increment
                </button>
                <button className="btn-ghost" onClick={() => setPromOpen(true)}>
                    <Icon name="shield" size={16} /> Promotion
                </button>
            </PageHeader>

            <SalaryNav />

            <Flash message={flash?.message} errors={errors} />

            <section className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table min-w-[980px]">
                        <thead>
                            <tr>
                                <th>Staff</th>
                                <th>Designation</th>
                                <th className="text-right">Basic</th>
                                <th className="text-right">House Rent</th>
                                <th className="text-right">Medical</th>
                                <th className="text-right">Transport</th>
                                <th className="text-right">Special</th>
                                <th className="text-right">Gross</th>
                                <th>Effective</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.length === 0 && <EmptyRow colSpan={9}>No staff yet. প্রথমে Staff page থেকে staff যোগ করুন।</EmptyRow>}
                            {staff.map((s) => {
                                const list = salaries[s.id] ?? [];
                                const latest = list[0];
                                const grossAmount = latest ? gross(latest) : 0;

                                return (
                                    <tr key={s.id}>
                                        <td>
                                            <p className="font-medium text-ink">{s.name}</p>
                                            <p className="text-xs text-muted">{s.email}</p>
                                        </td>
                                        <td>{s.designation ? <Badge tone="brand">{s.designation}</Badge> : <span className="text-muted">—</span>}</td>
                                        <td className="text-right">{latest ? money(latest.basic_salary) : '—'}</td>
                                        <td className="text-right">{latest ? money(latest.house_rent) : '—'}</td>
                                        <td className="text-right">{latest ? money(latest.medical_allowance) : '—'}</td>
                                        <td className="text-right">{latest ? money(latest.transport_allowance) : '—'}</td>
                                        <td className="text-right">{latest ? money(latest.special_allowance) : '—'}</td>
                                        <td className="text-right font-semibold">{latest ? money(grossAmount) : <span className="text-warn-soft">Not set</span>}</td>
                                        <td className="text-xs text-muted">{latest ? latest.effective_from : '—'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            {promotions.length > 0 && (
                <section className="card mt-5 overflow-hidden">
                    <h3 className="px-5 pt-4 pb-2 font-semibold">Promotion History</h3>
                    <div className="overflow-x-auto">
                        <table className="data-table min-w-[980px]">
                            <thead>
                                <tr>
                                    <th>Staff</th>
                                    <th>From</th>
                                    <th>To</th>
                                    <th className="text-right">Old Salary</th>
                                    <th className="text-right">New Salary</th>
                                    <th>Effective</th>
                                </tr>
                            </thead>
                            <tbody>
                                {promotions.map((p) => (
                                    <tr key={p.id}>
                                        <td className="font-medium text-ink">{p.staff?.name}</td>
                                        <td>{p.old_designation ?? '—'}</td>
                                        <td>{p.new_designation ? <Badge tone="ok">{p.new_designation}</Badge> : '—'}</td>
                                        <td className="text-right">{p.old_salary !== null ? money(p.old_salary) : '—'}</td>
                                        <td className="text-right font-medium text-ok-soft">{p.new_salary !== null ? money(p.new_salary) : '—'}</td>
                                        <td className="text-xs text-muted">{p.effective_from}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            <Modal open={setOpen} onClose={() => setSetOpen(false)} title="Set / Update Salary">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Staff *" className="sm:col-span-2">
                        <select className="input" value={setForm.staff_id} onChange={(e) => setSetForm({ ...setForm, staff_id: e.target.value })}>
                            <option value="">Select staff</option>
                            {staff.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Basic Salary (৳) *">
                        <input type="number" className="input" value={setForm.basic_salary} onChange={(e) => setSetForm({ ...setForm, basic_salary: e.target.value })} />
                    </Field>
                    <Field label="House Rent (৳)">
                        <input type="number" className="input" value={setForm.house_rent} onChange={(e) => setSetForm({ ...setForm, house_rent: e.target.value })} />
                    </Field>
                    <Field label="Medical Allowance (৳)">
                        <input type="number" className="input" value={setForm.medical_allowance} onChange={(e) => setSetForm({ ...setForm, medical_allowance: e.target.value })} />
                    </Field>
                    <Field label="Transport Allowance (৳)">
                        <input type="number" className="input" value={setForm.transport_allowance} onChange={(e) => setSetForm({ ...setForm, transport_allowance: e.target.value })} />
                    </Field>
                    <Field label="Special Allowance (৳)">
                        <input type="number" className="input" value={setForm.special_allowance} onChange={(e) => setSetForm({ ...setForm, special_allowance: e.target.value })} />
                    </Field>
                    <Field label="Effective From *">
                        <input type="date" className="input" value={setForm.effective_from} onChange={(e) => setSetForm({ ...setForm, effective_from: e.target.value })} />
                    </Field>
                    <Field label="Note" className="sm:col-span-2">
                        <input type="text" className="input" value={setForm.note} onChange={(e) => setSetForm({ ...setForm, note: e.target.value })} placeholder="অপশনাল" />
                    </Field>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                    <button className="btn-ghost" onClick={() => setSetOpen(false)}>Cancel</button>
                    <button className="btn-primary" disabled={busy} onClick={() => submit('/admin/salary', setForm)}>
                        {busy ? 'Saving…' : 'Save'}
                    </button>
                </div>
            </Modal>

            <Modal open={incOpen} onClose={() => setIncOpen(false)} title="Salary Increment">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Staff *" className="sm:col-span-2">
                        <select className="input" value={incForm.staff_id} onChange={(e) => setIncForm({ ...incForm, staff_id: e.target.value })}>
                            <option value="">Select staff</option>
                            {staff.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Type *">
                        <select className="input" value={incForm.type} onChange={(e) => setIncForm({ ...incForm, type: e.target.value })}>
                            <option value="amount">Fixed amount (৳)</option>
                            <option value="percent">Percentage of basic (%)</option>
                        </select>
                    </Field>
                    <Field label="Value *">
                        <input type="number" className="input" value={incForm.value} onChange={(e) => setIncForm({ ...incForm, value: e.target.value })} />
                    </Field>
                    <Field label="Effective From *">
                        <input type="date" className="input" value={incForm.effective_from} onChange={(e) => setIncForm({ ...incForm, effective_from: e.target.value })} />
                    </Field>
                    <Field label="Note">
                        <input type="text" className="input" value={incForm.note} onChange={(e) => setIncForm({ ...incForm, note: e.target.value })} placeholder="অপশনাল" />
                    </Field>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                    <button className="btn-ghost" onClick={() => setIncOpen(false)}>Cancel</button>
                    <button className="btn-primary" disabled={busy} onClick={() => submit('/admin/salary/increment', incForm)}>
                        {busy ? 'Applying…' : 'Apply Increment'}
                    </button>
                </div>
            </Modal>

            <Modal open={promOpen} onClose={() => setPromOpen(false)} title="Staff Promotion">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Staff *" className="sm:col-span-2">
                        <select className="input" value={promForm.staff_id} onChange={(e) => setPromForm({ ...promForm, staff_id: e.target.value })}>
                            <option value="">Select staff</option>
                            {staff.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}{s.designation ? ` · ${s.designation}` : ''}</option>
                            ))}
                        </select>
                    </Field>
                    <Field label="New Designation *">
                        <select className="input" value={promForm.designation_id} onChange={(e) => setPromForm({ ...promForm, designation_id: e.target.value })}>
                            <option value="">{designations.length === 0 ? 'কোনো designation নেই' : 'Select designation'}</option>
                            {designations.map((d) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </Field>
                    <Field label="New Salary (gross ৳) *">
                        <input type="number" className="input" value={promForm.new_salary} onChange={(e) => setPromForm({ ...promForm, new_salary: e.target.value })} />
                    </Field>
                    <Field label="Effective From *">
                        <input type="date" className="input" value={promForm.effective_from} onChange={(e) => setPromForm({ ...promForm, effective_from: e.target.value })} />
                    </Field>
                    <Field label="Note">
                        <input type="text" className="input" value={promForm.note} onChange={(e) => setPromForm({ ...promForm, note: e.target.value })} placeholder="অপশনাল" />
                    </Field>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                    <button className="btn-ghost" onClick={() => setPromOpen(false)}>Cancel</button>
                    <button className="btn-primary" disabled={busy} onClick={() => submit('/admin/salary/promote', promForm)}>
                        {busy ? 'Saving…' : 'Promote'}
                    </button>
                </div>
            </Modal>
        </AppLayout>
    );
}