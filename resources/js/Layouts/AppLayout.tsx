import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { Role } from '../types';

type NavItem = {
    href: string;
    label: string;
    icon: string;
    exact?: boolean;
};

const NAV: Record<Role, NavItem[]> = {
    super_admin: [
        { href: '/super/dashboard', label: 'Dashboard', icon: '📊' },
        { href: '/super/companies', label: 'Companies', icon: '🏢' },
        { href: '/super/plans', label: 'Plans', icon: '💳' },
        { href: '/super/messages', label: 'Messages', icon: '✉️' },
        { href: '/super/site', label: 'Website Content', icon: '🌐' },
    ],
    admin: [
        { href: '/admin/attendance-report', label: 'Attendance Report', icon: '📄', exact: true },
        { href: '/admin/attendance-report/map', label: 'Live Map', icon: '🗺️' },
        { href: '/admin/staff', label: 'Staff', icon: '👥' },
        { href: '/admin/subscription', label: 'Subscription', icon: '💳' },
        { href: '/admin/settings', label: 'Office Settings', icon: '⚙️' },
    ],
    staff: [
        { href: '/attendance', label: 'Check In / Out', icon: '📍', exact: true },
        { href: '/attendance/history', label: 'My History', icon: '🕘' },
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
    const items = NAV[role] ?? [];

    const subscription = user?.company?.subscription;
    const daysLeft = subscription?.days_left ?? null;
    const showExpiryWarning =
        subscription?.active === true &&
        daysLeft !== null &&
        daysLeft <= 14;

    const brand =
        role === 'super_admin'
            ? 'SaaS Control'
            : (user?.company?.name ?? 'Attendance');

    const close = () => setOpen(false);
    const logout = () => router.post('/logout');

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-30 bg-gray-900/50 lg:hidden"
                    onClick={close}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-gray-900 text-gray-200 transition-transform duration-200 lg:translate-x-0 ${
                    open ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-16 items-center gap-2 border-b border-gray-800 px-5">
                    <span className="text-xl">🕒</span>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                            {brand}
                        </p>
                        <p className="truncate text-xs text-gray-400 capitalize">
                            {role.replace('_', ' ')}
                        </p>
                    </div>
                </div>

                <nav className="flex flex-col gap-1 p-3">
                    {items.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={close}
                            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                                isActive(path, item)
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`}
                        >
                            <span aria-hidden="true">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="absolute inset-x-0 bottom-0 border-t border-gray-800 p-3">
                    <div className="mb-2 px-2">
                        <p className="truncate text-sm font-medium text-white">
                            {user?.name}
                        </p>
                        <p className="truncate text-xs text-gray-400">
                            {user?.email}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={logout}
                        className="w-full rounded-md bg-gray-800 px-3 py-2 text-sm font-medium text-gray-200 hover:bg-gray-700"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Content */}
            <div className="lg:pl-64">
                <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-gray-200 bg-white px-4 shadow-sm">
                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        className="rounded-md p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
                        aria-label="Toggle menu"
                    >
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>

                    <span className="font-semibold text-gray-800">
                        Staff Attendance System
                    </span>

                    {user?.company && (
                        <span className="ml-auto hidden rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 sm:inline">
                            {user.company.office_name}
                        </span>
                    )}
                </header>

                {showExpiryWarning && (
                    <div className="bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-900">
                        ⏳ আপনার সাবস্ক্রিপশন{' '}
                        {daysLeft === 0
                            ? 'আজ'
                            : `${daysLeft} দিনে`}{' '}
                        শেষ হবে।{' '}
                        {role === 'admin' ? (
                            <Link href="/admin/subscription" className="font-semibold underline">
                                বিস্তারিত দেখুন
                            </Link>
                        ) : (
                            <span>প্ল্যাটফর্ম admin-এর সাথে যোগাযোগ করুন।</span>
                        )}
                    </div>
                )}

                <main>{children}</main>
            </div>
        </div>
    );
}
