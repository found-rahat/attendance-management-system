import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Icon } from '../../components/Icons';
import { Badge, EmptyRow, Field, Flash, Modal, PageHeader } from '../../components/ui';

type Designation = {
    id: number;
    name: string;
    is_active: boolean;
    users_count: number;
};

type Props = { designations: Designation[] };

export default function AdminDesignation({ designations }: Props) {
    const { flash, errors } = usePage().props;
    const [modal, setModal] = useState<null | { original: Designation | null }>(null);
    const [form, setForm] = useState({ name: '', is_active: true });
    const [busy, setBusy] = useState(false);

    const openAdd = () => {
        setForm({ name: '', is_active: true });
        setModal({ original: null });
    };
    const openEdit = (d: Designation) => {
        setForm({ name: d.name, is_active: d.is_active });
        setModal({ original: d });
    };
    const save = () => {
        setBusy(true);
        const url = modal?.original ? `/admin/designations/${modal.original.id}` : '/admin/designations';
        router[modal?.original ? 'put' : 'post'](url, form, {
            preserveScroll: true,
            onSuccess: () => setModal(null),
            onFinish: () => setBusy(false),
        });
    };
    const remove = (d: Designation) => {
        if (!window.confirm(`Delete designation "${d.name}"?`)) return;
        router.delete(`/admin/designations/${d.id}`, { preserveScroll: true });
    };

    return (
        <AppLayout>
            <Head title="Designations" />
            <PageHeader icon="admin" title="Designations" subtitle="Staff designation তৈরি ও ম্যানেজ করুন — Staff form ও Promotion-এ ব্যবহার হবে">
                <button className="btn-primary" onClick={openAdd}>
                    <Icon name="plus" size={18} /> Add Designation
                </button>
            </PageHeader>

            <Flash message={flash?.message} errors={errors} />

            <section className="card mt-5 overflow-x-auto">
                <table className="data-table min-w-[600px]">
                    <thead>
                        <tr>
                            <th className="text-left">Designation</th>
                            <th>Staff</th>
                            <th>Status</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {designations.map((d) => (
                            <tr key={d.id}>
                                <td className="text-left font-medium">{d.name}</td>
                                <td>{d.users_count}</td>
                                <td>{d.is_active ? <Badge tone="ok">Active</Badge> : <Badge tone="neutral">Inactive</Badge>}</td>
                                <td className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <button className="btn-ghost px-2.5 py-1.5" onClick={() => openEdit(d)}>
                                            <Icon name="edit" size={14} />
                                        </button>
                                        <button
                                            className="btn-ghost px-2.5 py-1.5 text-danger-soft hover:border-danger/50"
                                            onClick={() => remove(d)}
                                        >
                                            <Icon name="trash" size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {designations.length === 0 && (
                            <EmptyRow colSpan={4}>কোনো designation নেই। উপরে <b>Add Designation</b> চাপুন।</EmptyRow>
                        )}
                    </tbody>
                </table>
            </section>

            <Modal open={modal !== null} onClose={() => setModal(null)} title={modal?.original ? 'Edit Designation' : 'Add Designation'}>
                <div className="grid gap-4">
                    <Field label="Name *">
                        <input
                            type="text"
                            className="input"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. Teacher / Accountant / Manager"
                        />
                    </Field>
                    <Field label="Status">
                        <select className="input" value={String(form.is_active)} onChange={(e) => setForm({ ...form, is_active: e.target.value === 'true' })}>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </Field>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                    <button className="btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                    <button className="btn-primary" disabled={busy || !form.name} onClick={save}>{busy ? 'Saving…' : 'Save'}</button>
                </div>
            </Modal>
        </AppLayout>
    );
}