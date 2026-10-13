import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { PropsWithChildren } from 'react';
import { Icon } from '../components/Icons';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import type { Role } from '../types';

type NavItem = {
    href: string;
    label: string;
    icon: string;
    permission?: string;
    exact?: boolean;
};

const NAV: Record<Role, NavItem[]> = {
    super_admin: [
        { href: '/super/dashboard', label: 'Dashboard', icon: 'dashboard', permission: 'dashboard.view' },
        { href: '/super/companies', label: 'Companies', icon: 'building', permission: 'companies.view' },
        { href: '/super/plans', label: 'Plans', icon: 'card', permission: 'plans.view' },
        { href: '/super/permissions', label: 'Permissions', icon: 'shield', permission: 'permissions.manage' },
        { href: '/super/messages', label: 'Messages', icon: 'mail', permission: 'messages.view' },
        { href: '/super/site', label: 'Website', icon: 'globe', permission: 'content.manage' },
    ],
    admin: [
        { href: '/admin/attendance-report', label: 'Attendance', icon: 'calendar', permission: 'attendance.view', exact: true },
        { href: '/admin/attendance-report/map', label: 'Live Map', icon: 'track', permission: 'attendance.map' },
        { href: '/admin/staff', label: 'Staff', icon: 'users', permission: 'staff.view' },
        { href: '/admin/subscription', label: 'Subscription', icon: 'card', permission: 'subscription.view' },
        { href: '/admin/settings', label: 'Office Settings', icon: 'settings', permission: 'office.settings' },
    ],
    staff: [
        { href: '/dashboard', label: 'Dashboard', icon: 'dashboard', permission: 'dashboard.view', exact: true },
        { href: '/attendance', label: 'Check In / Out', icon: 'location', permission: 'attendance.checkin', exact: true },
        { href: '/attendance/history', label: 'My History', icon: 'clock', permission: 'attendance.history' },
    ],
};

function useCurrentPath(): string {
    const { url } = usePage();

    return url.split('?')[0];
}

function isActive(path: string, item: NavItem): boolean {
    if (item.exact) {
        return path === item.href;
    }

    return path === item.href || path.startsWith(`${item.href}/`);
}

export default function AppLayout({ children }: PropsWithChildren) {
    const { auth } = usePage().props;
    const [open, setOpen] = useState(false);
    const path = useCurrentPath();

    const user = auth.user;
    const role: Role = user?.role ?? 'staff';
    const permissions = user?.permissions ?? [];
    const isSuper = user?.is_super_admin ?? false;

    const items = (NAV[role] ?? []).filter(
        (item) => !item.permission || isSuper || permissions.includes(item.permission),
    );

    const subscription = user?.company?.subscription;
    const daysLeft = subscription?.days_left ?? null;
    const EXPIRY_WARNING_DAYS = 5;
    const showExpiryWarning = subscription?.active === true && daysLeft !== null && daysLeft <= EXPIRY_WARNING_DAYS;

    const brand = 'Staff7';
    const roleLabel = role.replace('_', ' ');
    const setup = user?.company?.name ?? (isSuper ? 'Platform Control' : roleLabel);

    const close = () => setOpen(false);
    const logout = () => router.post('/logout');

    return (
        <div className="flex min-h-screen">
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={close}
                    aria-hidden="true"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-[288px] flex-col border-r border-line bg-linear-to-b from-aside-top to-bg transition-transform duration-200 lg:translate-x-0 ${
                    open ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex items-center justify-between gap-2 px-5 pt-5 pb-6">
                    <Logo />
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <button
                            type="button"
                            onClick={close}
                            className="text-brand-3 lg:hidden"
                            aria-label="Close menu"
                        >
                            <Icon name="close" size={22} />
                        </button>
                    </div>
                </div>

                <nav className="mx-3 flex-1 overflow-y-auto rounded-2xl border border-line bg-nav">
                    {items.map((item) => {
                        const active = isActive(path, item);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={close}
                                className={`flex items-center gap-4 border-b border-line-2 px-5 py-4 text-[15px] transition last:border-b-0 ${
                                    active
                                        ? 'mx-1.5 my-1.5 rounded-xl border border-brand bg-linear-to-r from-active-from to-active-to text-white shadow-[0_0_22px_rgba(139,44,245,0.5)]'
                                        : 'text-ink-soft hover:bg-hover'
                                }`}
                            >
                                <Icon
                                    name={item.icon}
                                    size={21}
                                    className={active ? 'text-brand-soft' : 'text-brand-ink'}
                                />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-line p-4">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-full border-2 border-brand-2 bg-linear-to-br from-avatar-from to-avatar-to text-sm font-semibold text-white">
                            {initials(user?.name ?? '?')}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-ink">{user?.name}</p>
                            <p className="truncate text-xs text-muted capitalize">{setup}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={logout}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-panel-2 px-3 py-2.5 text-sm font-medium text-ink-soft transition hover:border-danger/50 hover:text-danger"
                    >
                        <Icon name="logout" size={17} />
                        Logout
                    </button>
                </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col lg:pl-[288px]">
                <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-bg/85 px-4 py-3 backdrop-blur lg:hidden">
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-panel-2 text-ink"
                        aria-label="Open menu"
                    >
                        <Icon name="menu" size={22} />
                    </button>
                    <Logo size="sm" />
                    <ThemeToggle className="ml-auto" />
                </header>

                {showExpiryWarning && (
                    <div className="border-b border-gold/40 bg-gold/10 px-4 py-2 text-center text-sm font-medium text-warn-soft">
                        ⏳ সাবস্ক্রিপশন {daysLeft === 0 ? 'আজ' : `${daysLeft} দিনে`} শেষ হবে।{' '}
                        {role === 'admin' ? (
                            <Link href="/admin/subscription" className="font-semibold underline">
                                বিস্তারিত দেখুন
                            </Link>
                        ) : (
                            <span>প্ল্যাটফর্ম admin-এর সাথে যোগাযোগ করুন।</span>
                        )}
                    </div>
                )}

                <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
}

function initials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
}
