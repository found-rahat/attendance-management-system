import { Link, usePage } from '@inertiajs/react';
import { Icon } from '../../../components/Icons';

type Tab = { href: string; label: string; icon: string };

const TABS: Tab[] = [
    { href: '/admin/salary', label: 'Staff Salary', icon: 'users' },
    { href: '/admin/salary/sheet', label: 'Salary Sheet', icon: 'pay' },
    { href: '/admin/salary/bonus', label: 'Bonus', icon: 'gift' },
    { href: '/admin/salary/deduction', label: 'Deduction', icon: 'minus' },
    { href: '/admin/salary/loan', label: 'Loan & Advance', icon: 'card' },
    { href: '/admin/salary/provident', label: 'Provident Fund', icon: 'shield' },
];

export default function SalaryNav() {
    const { url } = usePage();
    const path = url.split('?')[0];

    return (
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
            {TABS.map((tab) => {
                const active = tab.href === '/admin/salary'
                    ? path === tab.href
                    : path.startsWith(tab.href);

                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition ${
                            active
                                ? 'border-brand bg-brand/15 text-brand-soft'
                                : 'border-line bg-panel-2 text-ink-soft hover:border-brand/40'
                        }`}
                    >
                        <Icon name={tab.icon} size={15} />
                        {tab.label}
                    </Link>
                );
            })}
        </div>
    );
}