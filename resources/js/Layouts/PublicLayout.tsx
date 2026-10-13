import { Link, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import type { PropsWithChildren } from "react";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import type { SiteSettings } from "../types";

type Props = PropsWithChildren<{
    site: SiteSettings;
}>;

export default function PublicLayout({ site, children }: Props) {
    const { auth } = usePage().props;
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        onScroll();
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const brand = site.brand_name || "";

    const dashboardHref =
        auth.user?.role === "super_admin"
            ? "/super/dashboard"
            : auth.user?.role === "admin"
              ? "/admin/attendance-report"
              : "/dashboard";

    return (
        <div className="min-h-screen text-ink">
            <header
                className={`fixed inset-x-0 top-0 z-50 transition ${
                    scrolled
                        ? "border-b border-line bg-bg/85 backdrop-blur"
                        : "bg-transparent"
                }`}
            >
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                    <Link href="/" className="flex items-center gap-2">
                        <Logo size="sm" fallback={brand} />
                    </Link>

                    <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
                        <a
                            href="/#features"
                            className="text-muted transition hover:text-brand-3"
                        >
                            Features
                        </a>
                        <a
                            href="/#how"
                            className="text-muted transition hover:text-brand-3"
                        >
                            How it works
                        </a>
                        <a
                            href="/#faq"
                            className="text-muted transition hover:text-brand-3"
                        >
                            FAQ
                        </a>
                        <a
                            href="/#contact"
                            className="text-muted transition hover:text-brand-3"
                        >
                            Contact
                        </a>
                        <Link
                            href="/pricing"
                            className="text-muted transition hover:text-brand-3"
                        >
                            Pricing
                        </Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        {auth.user ? (
                            <Link
                                href={dashboardHref}
                                className="btn-primary px-4 py-2"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="btn-primary px-4 py-2"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="pt-20">{children}</main>

            <footer className="mt-10 border-t border-line py-10">
                <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:flex-row sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Logo size="sm" fallback={brand} />
                        </div>
                        <p className="mt-3 max-w-xs text-sm text-muted">
                            {site.footer_text}
                        </p>
                    </div>

                    <div className="text-sm text-muted">
                        <p className="font-semibold text-ink-soft">Contact</p>
                        <p className="mt-2">{site.contact_email}</p>
                        <p>{site.contact_phone}</p>
                        <p>{site.contact_address}</p>
                    </div>

                    <div className="text-sm text-muted">
                        <p className="font-semibold text-ink-soft">Company</p>
                        <Link
                            href="/pricing"
                            className="mt-2 block transition hover:text-brand-3"
                        >
                            Pricing
                        </Link>
                        <a
                            href="/#faq"
                            className="block transition hover:text-brand-3"
                        >
                            FAQ
                        </a>
                        <a
                            href="/#contact"
                            className="block transition hover:text-brand-3"
                        >
                            Contact
                        </a>
                        <Link
                            href="/login"
                            className="block transition hover:text-brand-3"
                        >
                            Login
                        </Link>
                    </div>
                </div>

                <div className="mx-auto mt-8 max-w-6xl border-t border-line px-4 pt-6 text-center text-sm text-muted sm:text-left">
                    © {new Date().getFullYear()} {brand}. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
