import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { PropsWithChildren } from 'react';
import { Icon } from '../components/Icons';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import type { Role } from '../types';

type NavItem = {
    href?: string;
    label: string;
    icon?: string;
    permission?: string;
    exact?: boolean;
    children?: NavItem[];
};

const NAV: Record<Role, NavItem[]> = {
    super_admin: [
        { href: '/super/dashboard', label: 'Dashboard', icon: 'dashboard', permission: 'dashboard.view' },
        { href: '/super/companies', label: 'Companies', icon: 'building', permission: 'companies.view' },
        { href: '/super/plans', label: 'Plans', icon: 'card', permission: 'plans.view' },
        { href: '/super/permissions', label: 'Permissions', icon: 'shield', permission: 'permissions.manage' },
        { href: '/super/messages', label: 'Messages', icon: 'mail', permission: 'messages.view' },
        {
            label: 'Website',
            icon: 'globe',
            permission: 'content.manage',
            children: [
                { href: '/super/site', label: 'Overview', icon: 'layout' },
                { href: '/super/site/general', label: 'General' },
                { href: '/super/site/hero', label: 'Hero Section' },
                { href: '/super/site/logos', label: 'Logos & Branding' },
                { href: '/super/site/features', label: 'Features' },
                { href: '/super/site/faqs', label: 'FAQs' },
            ],
        },
    ],
    admin: [
        { href: '/admin/attendance-report', label: 'Attendance', icon: 'calendar', permission: 'attendance.view', exact: true },
        { href: '/admin/attendance-report/map', label: 'Live Map', icon: 'track', permission: 'attendance.map' },
        { href: '/admin/staff', label: 'Staff', icon: 'users', permission: 'staff.view' },
        { href: '/admin/designations', label: 'Designations', icon: 'admin', permission: 'designation.view' },
        { href: '/admin/salary', label: 'Salary', icon: 'pay', permission: 'salary.view' },
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

    if (!item.href) {
        return false;
    }

    return path === item.href || path.startsWith(`${item.href}/`);
}

function hasActiveChild(path: string, item: NavItem): boolean {
    return !!item.children?.some((child) => isActive(path, child));
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
        (item) => {
            if (item.children) {
                return item.children.some(
                    (child) =>
                        !child.permission ||
                        isSuper ||
                        permissions.includes(child.permission),
                );
            }

            return !item.permission || isSuper || permissions.includes(item.permission);
        },
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
                        const active = item.children ? hasActiveChild(path, item) : isActive(path, item);

                        if (item.children) {
                            return (
                                <div key={item.label} className="mb-1">
                                    <button
                                        type="button"
                                        onClick={() => {}}
                                        className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl transition ${
                                            active ? 'bg-brand text-white' : 'bg-transparent text-ink-soft hover:bg-panel-3'
                                        }`}
                                    >
                                        {item.icon && <Icon name={item.icon} size={18} />}
                                        <span>{item.label}</span>
                                        <Icon
                                            name="chevron-down"
                                            size={14}
                                            className="ml-auto opacity-50"
                                        />
                                    </button>
                                    <div className="px-2 space-y-0.5">
                                        {item.children.map((child) => {
                                            const childActive = isActive(path, child);

                                            return (
                                                <Link
                                                    key={child.href}
                                                    href={child.href}
                                                    className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg transition ${
                                                        childActive ? 'bg-brand text-white' : 'bg-transparent text-ink-soft hover:bg-panel-3'
                                                    }`}
                                                    onClick={close}
                                                >
                                                    {child.icon && <Icon name={child.icon} size={16} />}
                                                    <span>{child.label}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl transition ${
                                    active ? 'bg-brand text-white' : 'bg-transparent text-ink-soft hover:bg-panel-3'
                                }`}
                                onClick={close}
                            >
                                {item.icon && <Icon name={item.icon} size={18} />}
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            <div className="flex-1 flex flex-col">
                <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-nav/95 backdrop-blur px-6 py-3">
                    <button
                        type="button"
                        className="text-brand-3 lg:hidden"
                        onClick={() => setOpen((o) => !o)}
                        aria-label="Toggle menu"
                    >
                        <Icon name="menu" size={22} />
                    </button>
                    <Logo size="sm" fallback={brand} />
                    <div className="ml-auto flex items-center gap-3">
                        {showExpiryWarning && (
                            <div className="px-3 py-1 rounded-md border border-warn bg-warn-bg text-warn text-xs">
                                Subscription expires in {daysLeft} day(s)
                            </div>
                        )}
                        <ThemeToggle />
                        <div className="flex items-center gap-2 rounded-xl border border-line bg-panel/60 px-3 py-1">
                            <span className="text-xs text-ink-soft">{roleLabel}</span>
                            <button
                                type="button"
                                className="text-xs text-brand-3 hover:underline"
                                onClick={logout}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
            </div>
        </div>
    );
}
