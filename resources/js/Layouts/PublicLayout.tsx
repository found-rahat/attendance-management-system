import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { SiteSettings } from '../types';

type Props = PropsWithChildren<{
    site: SiteSettings;
}>;

export default function PublicLayout({ site, children }: Props) {
    const { auth } = usePage().props;
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        onScroll();
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const brand = site.brand_name || 'Attendly';

    return (
        <div className="min-h-screen bg-white text-gray-800">
            <header
                className={`fixed inset-x-0 top-0 z-50 transition ${
                    scrolled
                        ? 'border-b border-gray-200 bg-white/90 backdrop-blur'
                        : 'bg-transparent'
                }`}
            >
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-600 text-lg text-white">
                            🕒
                        </span>
                        <span className="text-lg font-bold text-gray-900">{brand}</span>
                    </Link>

                    <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
                        <a href="/#features" className="text-gray-600 hover:text-indigo-600">
                            Features
                        </a>
                        <a href="/#how" className="text-gray-600 hover:text-indigo-600">
                            How it works
                        </a>
                        <a href="/#faq" className="text-gray-600 hover:text-indigo-600">
                            FAQ
                        </a>
                        <a href="/#contact" className="text-gray-600 hover:text-indigo-600">
                            Contact
                        </a>
                        <Link href="/pricing" className="text-gray-600 hover:text-indigo-600">
                            Pricing
                        </Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        {auth.user ? (
                            <Link
                                href="/"
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="pt-20">{children}</main>

            <footer className="border-t border-gray-100 py-10">
                <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:flex-row sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">
                                🕒
                            </span>
                            <span className="font-bold text-gray-900">{brand}</span>
                        </div>
                        <p className="mt-3 max-w-xs text-sm text-gray-500">
                            {site.footer_text}
                        </p>
                    </div>

                    <div className="text-sm text-gray-600">
                        <p className="font-semibold text-gray-800">Contact</p>
                        <p className="mt-2">{site.contact_email}</p>
                        <p>{site.contact_phone}</p>
                        <p>{site.contact_address}</p>
                    </div>

                    <div className="text-sm text-gray-600">
                        <p className="font-semibold text-gray-800">Company</p>
                        <Link href="/pricing" className="mt-2 block hover:text-indigo-600">
                            Pricing
                        </Link>
                        <a href="/#faq" className="mt-0 block hover:text-indigo-600">
                            FAQ
                        </a>
                        <a href="/#contact" className="block hover:text-indigo-600">
                            Contact
                        </a>
                        <Link href="/login" className="block hover:text-indigo-600">
                            Login
                        </Link>
                    </div>
                </div>

                <div className="mx-auto mt-8 max-w-6xl border-t border-gray-100 px-4 pt-6 text-center text-sm text-gray-500 sm:text-left">
                    © {new Date().getFullYear()} {brand}. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
