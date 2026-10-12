import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';

type Company = {
    id: number;
    name: string;
    office_name: string;
    is_active: boolean;
    created_at: string;
    staff_count: number;
    admins_count: number;
};

type Props = {
    stats: {
        companies: number;
        active_companies: number;
        admins: number;
        staff: number;
        attendance_today: number;
    };
    companies: Company[];
};

const cards: { key: keyof Props['stats']; label: string; icon: string }[] = [
    { key: 'companies', label: 'Total Companies', icon: '🏢' },
    { key: 'active_companies', label: 'Active', icon: '✅' },
    { key: 'admins', label: 'Company Admins', icon: '🧑‍💼' },
    { key: 'staff', label: 'Total Staff', icon: '👥' },
    { key: 'attendance_today', label: 'Check-ins Today', icon: '📍' },
];

export default function SuperAdminDashboard({ stats, companies }: Props) {
    return (
        <AppLayout>
            <Head title="Super Admin Dashboard" />

            <main className="mx-auto max-w-6xl space-y-5 p-4">
                <h1 className="text-2xl font-bold">Platform Overview</h1>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                    {cards.map((card) => (
                        <div key={card.key} className="rounded-xl border bg-white p-4 shadow-sm">
                            <p className="text-xs text-gray-500">
                                <span className="mr-1">{card.icon}</span>
                                {card.label}
                            </p>
                            <p className="mt-1 text-2xl font-bold">{stats[card.key]}</p>
                        </div>
                    ))}
                </div>

                <div className="rounded-xl border bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b p-4">
                        <h2 className="font-semibold">Recent companies</h2>
                        <Link
                            href="/super/companies"
                            className="text-sm font-medium text-indigo-600 hover:underline"
                        >
                            Manage all →
                        </Link>
                    </div>

                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3">Company</th>
                                <th className="p-3">Office</th>
                                <th className="p-3">Admins</th>
                                <th className="p-3">Staff</th>
                                <th className="p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {companies.map((company) => (
                                <tr key={company.id} className="border-t">
                                    <td className="p-3 font-medium">{company.name}</td>
                                    <td className="p-3 text-gray-600">{company.office_name}</td>
                                    <td className="p-3">{company.admins_count}</td>
                                    <td className="p-3">{company.staff_count}</td>
                                    <td className="p-3">
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                company.is_active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-200 text-gray-600'
                                            }`}
                                        >
                                            {company.is_active ? 'active' : 'inactive'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {companies.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-5 text-center text-gray-500">
                                        No companies yet.
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
