import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
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
                { href: '/super/site', label: 'Overview', icon: 'layout', exact: true },
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
    const [open, setOpen] = useState(() =>
        typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : false,
    );
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

    const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    const subscription = user?.company?.subscription;
    const daysLeft = subscription?.days_left ?? null;
    const EXPIRY_WARNING_DAYS = 5;
    const showExpiryWarning = subscription?.active === true && daysLeft !== null && daysLeft <= EXPIRY_WARNING_DAYS;

    const brand = 'Staff7';
    const roleLabel = role.replace('_', ' ');
    const setup = user?.company?.name ?? (isSuper ? 'Platform Control' : roleLabel);

    const close = () => setOpen(false);
    const csrfToken =
        typeof document !== 'undefined'
            ? document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? ''
            : '';
    const logout = () => {
        setProfileOpen(false);
        router.post('/logout', { _token: csrfToken }, {
            onSuccess: () => window.location.assign('/'),
            onError: () => window.location.assign('/'),
        });
    };
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);
    const toggleDropdown = (label: string) => {
        setOpenDropdowns((prev) => {
            const next = new Set(prev);
            if (next.has(label)) {
                next.delete(label);
            } else {
                next.add(label);
            }
            return next;
        });
    };

    return (
        <div className="relative min-h-screen flex flex-col">
            {/* Sidebar - full height on desktop, slide-in from left on mobile */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-[288px] flex-col border-r border-line bg-linear-to-b from-aside-top to-bg transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
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
                        const dropdownOpen = item.children ? (openDropdowns.has(item.label) || hasActiveChild(path, item)) : false;

                        if (item.children) {
                            return (
                                <div key={item.label} className="mb-1">
                                    <button
                                        type="button"
                                        onClick={() => toggleDropdown(item.label)}
                                        className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl transition ${
                                            active || dropdownOpen ? 'bg-brand text-white' : 'bg-transparent text-ink-soft hover:bg-panel-3'
                                        }`}
                                    >
                                        {item.icon && <Icon name={item.icon} size={18} />}
                                        <span>{item.label}</span>
                                        <Icon
                                            name="chevron-down"
                                            size={14}
                                            className={`ml-auto opacity-50 transition-transform duration-200 ${
                                                dropdownOpen ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </button>
                                    {dropdownOpen && (
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
                                    )}
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

            {/* Mobile overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={close}
                    aria-hidden="true"
                />
            )}

            {/* Header - desktop: to the right of sidebar; mobile: full width */}
            <header className={`sticky top-0 z-40 flex items-center justify-between border-b border-line bg-nav/95 backdrop-blur px-6 py-3 ${open && typeof window !== 'undefined' && !window.matchMedia('(min-width: 1024px)').matches ? 'blur-sm' : ''} lg:ml-[288px] lg:sticky lg:top-0`}>
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
                    <div className="relative" ref={profileRef}>
                        <button
                            type="button"
                            onClick={() => setProfileOpen((o) => !o)}
                            className="flex items-center gap-2 rounded-xl border border-line bg-panel/60 px-3 py-1.5"
                        >
                            <span className="grid h-7 w-7 place-items-center rounded-full bg-brand/20 text-xs font-bold text-brand-3">
                                {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                            </span>
                            <span className="text-xs text-ink-soft">{roleLabel}</span>
                            <Icon name="chevron-down" size={12} className={`text-muted transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {profileOpen && (
                            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-panel shadow-lg">
                                <div className="border-b border-line px-3 py-2">
                                    <p className="text-sm font-semibold text-ink">{user?.name}</p>
                                    <p className="truncate text-xs text-muted">{user?.email}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={logout}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink-soft transition hover:bg-panel-3"
                                >
                                    <Icon name="logout" size={16} />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main content */}
            <div className="flex-1 flex flex-col lg:ml-[288px] pt-16 min-h-[calc(100vh-64px)]">
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
            </div>
        </div>
    );
}
