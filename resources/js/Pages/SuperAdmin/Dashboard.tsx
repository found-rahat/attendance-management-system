import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { Icon } from '../../components/Icons';
import { Badge, EmptyRow, PageHeader, StatCard } from '../../components/ui';
import TrendChart from '../../components/TrendChart';

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
    trend: { label: string; value: number }[];
    companies: Company[];
};

export default function SuperAdminDashboard({ stats, trend, companies }: Props) {
    const peak = Math.max(1, ...trend.map((point) => point.value));

    return (
        <AppLayout>
            <Head title="Platform Dashboard" />

            <PageHeader
                icon="dashboard"
                title="Platform Overview"
                subtitle="Monitor every company, admin and staff account in one place."
            >
                <Link href="/super/companies" className="btn-primary">
                    <Icon name="building" size={18} />
                    Manage companies
                </Link>
            </PageHeader>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard tone="purple" icon="building" label="Total Companies" value={stats.companies} sub="All tenants" />
                <StatCard tone="green" icon="check" label="Active" value={stats.active_companies} sub="Enabled tenants" />
                <StatCard tone="blue" icon="admin" label="Company Admins" value={stats.admins} sub="Office managers" />
                <StatCard tone="cyan" icon="users" label="Total Staff" value={stats.staff} sub="Across companies" />
                <StatCard tone="gold" icon="location" label="Check-ins Today" value={stats.attendance_today} sub="Recorded today" />
            </section>

            <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_1fr]">
                <div className="card overflow-hidden">
                    <header className="flex items-center gap-3 border-b border-line px-6 py-4">
                        <Icon name="building" size={20} className="text-brand-3" />
                        <span className="font-medium">Recent companies</span>
                        <Link href="/super/companies" className="ml-auto text-sm text-brand-3 hover:underline">
                            Manage all →
                        </Link>
                    </header>
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Company</th>
                                    <th>Office</th>
                                    <th>Admins</th>
                                    <th>Staff</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companies.map((company) => (
                                    <tr key={company.id}>
                                        <td className="text-left font-medium">{company.name}</td>
                                        <td className="text-left text-muted">{company.office_name}</td>
                                        <td>{company.admins_count}</td>
                                        <td>{company.staff_count}</td>
                                        <td>
                                            <Badge tone={company.is_active ? 'ok' : 'neutral'}>
                                                {company.is_active ? 'active' : 'inactive'}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                                {companies.length === 0 && <EmptyRow colSpan={5}>No companies yet.</EmptyRow>}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card p-5">
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium">Check-in trend</span>
                        <span className="text-xs text-muted">Last 7 days</span>
                    </div>
                    <TrendChart data={trend} max={peak} suffix="" />
                </div>
            </section>
        </AppLayout>
    );
}
