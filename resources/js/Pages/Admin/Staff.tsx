import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
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

const commonInput =
    'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none';

export default function AdminStaff({ staff, subscription }: Props) {
    const { errors, flash } = usePage().props;
    const [values, setValues] = useState({ name: '', email: '', password: '' });
    const [submitting, setSubmitting] = useState(false);

    const unlimited = subscription.staff_limit <= 0;
    const limitLabel = unlimited ? 'Unlimited' : subscription.staff_limit;
    const atLimit = subscription.at_limit;

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
        if (!confirm(`Remove ${member.name}? This will delete their attendance history.`)) {
            return;
        }

        router.delete(`/admin/staff/${member.id}`, { preserveScroll: true });
    }

    return (
        <AppLayout>
            <Head title="Staff Management" />

            <main className="mx-auto max-w-5xl space-y-5 p-4">
                <h1 className="text-2xl font-bold">Staff Management</h1>

                {flash?.message && (
                    <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
                        {flash.message}
                    </div>
                )}

                <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm text-gray-600">
                            Plan:{' '}
                            <span className="font-semibold text-gray-900">
                                {subscription.plan_name ?? 'No plan'}
                            </span>
                        </p>
                        <p className="text-sm text-gray-600">
                            Staff used:{' '}
                            <span className="font-semibold text-gray-900">
                                {subscription.staff_count} / {limitLabel}
                            </span>
                        </p>
                    </div>

                    {!unlimited && (
                        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                                className={`h-full rounded-full ${
                                    atLimit ? 'bg-red-500' : 'bg-indigo-600'
                                }`}
                                style={{
                                    width: `${Math.min(
                                        100,
                                        (subscription.staff_count /
                                            subscription.staff_limit) *
                                            100,
                                    )}%`,
                                }}
                            />
                        </div>
                    )}

                    {atLimit && (
                        <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                            আপনার plan-এর staff limit পূর্ণ হয়ে গেছে। আরও staff যোগ করতে
                            আপনার platform admin-এর সাথে যোগাযোগ করে plan upgrade করুন।
                        </p>
                    )}
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-4 rounded-xl border bg-white p-5 shadow-sm"
                >
                    <h2 className="font-semibold">Add a staff member</h2>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium">Name</label>
                            <input
                                type="text"
                                value={values.name}
                                onChange={(e) => update('name', e.target.value)}
                                className={commonInput}
                            />
                            {errors?.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Email</label>
                            <input
                                type="email"
                                value={values.email}
                                onChange={(e) => update('email', e.target.value)}
                                className={commonInput}
                            />
                            {errors?.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Password</label>
                            <input
                                type="text"
                                value={values.password}
                                onChange={(e) => update('password', e.target.value)}
                                className={commonInput}
                            />
                            {errors?.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || atLimit}
                        className="rounded-md bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {submitting ? 'Adding...' : 'Add staff'}
                    </button>
                </form>

                <div className="overflow-x-auto rounded-xl border bg-white">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3">Name</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Records</th>
                                <th className="p-3">Joined</th>
                                <th className="p-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.map((member) => (
                                <tr key={member.id} className="border-t">
                                    <td className="p-3 font-medium">{member.name}</td>
                                    <td className="p-3 text-gray-600">{member.email}</td>
                                    <td className="p-3">{member.attendances_count}</td>
                                    <td className="p-3">{formatDate(member.created_at)}</td>
                                    <td className="p-3 text-right">
                                        <button
                                            type="button"
                                            onClick={() => remove(member)}
                                            className="rounded-md border border-red-300 px-3 py-1 text-red-600 hover:bg-red-50"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {staff.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-5 text-center text-gray-500">
                                        No staff members yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </AppLayout>
    );
}
