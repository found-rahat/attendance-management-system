import { Head, Link, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import PublicLayout from "../Layouts/PublicLayout";
import PlanCard from "../components/PlanCard";
import { Icon } from "../components/Icons";
import { Field } from "../components/ui";
import type { Plan, SiteSettings } from "../types";

const steps = [
    {
        step: "01",
        title: "Office সেট করুন",
        text: "Map-এ click করে অফিসের location ও geofence radius নির্ধারণ করুন।",
    },
    {
        step: "02",
        title: "Staff যোগ করুন",
        text: "Admin panel থেকে staff-এর account তৈরি করুন — email ও password দিলেই হবে।",
    },
    {
        step: "03",
        title: "Attendance শুরু",
        text: "Staff অফিসে পৌঁছে Check In করবে, বের হওয়ার সময় Check Out। Report স্বয়ংক্রিয়ভাবে তৈরি।",
    },
];

const roles = [
    {
        badge: "Super Admin",
        title: "Platform Owner",
        points: [
            "অসংখ্য company তৈরি করুন",
            "Plan ও subscription নিয়ন্ত্রণ",
            "সার্বিক dashboard ও statistics",
        ],
    },
    {
        badge: "Company Admin",
        title: "Office Manager",
        points: [
            "Office ও geofence সেটিংস",
            "Staff যোগ / remove",
            "Report ও live map",
        ],
        featured: true,
    },
    {
        badge: "Staff",
        title: "Team Member",
        points: [
            "GPS দিয়ে Check In / Out",
            "নিজের attendance history",
            "সময়ের accuracy ও distance",
        ],
    },
];

type Props = {
    plans: Plan[];
    site: SiteSettings;
};

export default function Landing({ plans, site }: Props) {
    const { flash, errors } = usePage().props;
    const [contact, setContact] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    });
    const [sending, setSending] = useState(false);

    const features = site.features ?? [];
    const faqs = site.faqs ?? [];

    function sendContact(e: React.FormEvent) {
        e.preventDefault();
        setSending(true);
        router.post("/contact", contact, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () =>
                setContact({ name: "", email: "", phone: "", message: "" }),
            onFinish: () => setSending(false),
        });
    }

    return (
        <PublicLayout site={site}>
            <Head title="GPS Staff Attendance System" />

            {/* Hero */}
            <section id="top" className="relative overflow-hidden pt-12 pb-20">
                <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
                <div className="pointer-events-none absolute top-40 -left-24 h-80 w-80 rounded-full bg-cyan/10 blur-3xl" />

                <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-ok/40 bg-ok/10 px-3 py-1 text-xs font-semibold text-ok-soft">
                            <span className="h-2 w-2 rounded-full bg-ok" />
                            GPS-powered attendance
                        </span>

                        <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">
                            {site.hero_title}
                        </h1>

                        <p className="mt-5 max-w-xl text-lg text-muted">
                            {site.hero_subtitle}
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href="/login"
                                className="btn-primary px-6 py-3"
                            >
                                Get started
                            </Link>
                            <a href="#pricing" className="btn-ghost px-6 py-3">
                                Pricing দেখুন
                            </a>
                        </div>

                        <div className="mt-10 grid grid-cols-3 gap-6 border-t border-line pt-6">
                            <div>
                                <p className="text-2xl font-bold">100m</p>
                                <p className="text-sm text-muted">
                                    Default geofence
                                </p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">3</p>
                                <p className="text-sm text-muted">Role based</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">∞</p>
                                <p className="text-sm text-muted">Companies</p>
                            </div>
                        </div>
                    </div>

                    {/* Mock preview */}
                    <div className="relative">
                        <div className="card p-4">
                            <div className="flex items-center gap-2 border-b border-line pb-3">
                                <span className="h-3 w-3 rounded-full bg-danger/70" />
                                <span className="h-3 w-3 rounded-full bg-warn/70" />
                                <span className="h-3 w-3 rounded-full bg-ok/70" />
                                <span className="ml-3 text-xs text-muted">
                                    app.attendly.local/attendance
                                </span>
                            </div>

                            <div className="mt-4 space-y-3">
                                <div className="flex items-center justify-between rounded-xl border border-line-2 bg-panel-3 p-3">
                                    <div>
                                        <p className="text-sm font-semibold">
                                            Main Office
                                        </p>
                                        <p className="text-xs text-muted">
                                            Radius 100m · Gulshan, Dhaka
                                        </p>
                                    </div>
                                    <span className="tag border-ok bg-ok-bg text-ok-soft">
                                        inside ✓
                                    </span>
                                </div>

                                <div className="relative h-44 overflow-hidden rounded-xl border border-line-2 bg-linear-to-br from-panel-2 via-panel to-stat-green">
                                    <div className="relative h-full w-full">
                                        <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ok/60 bg-ok/10" />
                                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl">
                                            🏢
                                        </span>
                                        <span className="absolute left-[38%] top-[60%] text-lg">
                                            📍
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button className="rounded-xl border border-ok/50 bg-ok/15 py-2 text-sm font-semibold text-ok-soft">
                                        Check In
                                    </button>
                                    <button className="rounded-xl border border-info/50 bg-info/15 py-2 text-sm font-semibold text-info-soft">
                                        Check Out
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-line bg-panel px-4 py-3 shadow-lg sm:block">
                            <p className="text-xs text-muted">Today</p>
                            <p className="text-sm font-bold">
                                <span className="text-ok">18 present</span> · 3
                                late
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="border-t border-line py-20">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold">
                            যেকোনো office-এর জন্য যা যা দরকার
                        </h2>
                        <p className="mt-3 text-muted">
                            সরল, দ্রুত আর নির্ভুল attendance — যান-আসা থেকে
                            রিপোর্ট পর্যন্ত সবকিছু একসাথে।
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, index) => (
                            <div
                                key={`${feature.title}-${index}`}
                                className="card p-6 transition hover:-translate-y-1 hover:border-brand/50"
                            >
                                <span className="grid h-12 w-12 place-items-center rounded-xl border border-brand/40 bg-brand/15 text-2xl">
                                    {feature.icon}
                                </span>
                                <h3 className="mt-4 text-lg font-semibold">
                                    {feature.title}
                                </h3>
                                <p className="mt-2 text-sm text-muted">
                                    {feature.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-20">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold">
                            আপনার team-এর সাইজ অনুযায়ী plan
                        </h2>
                        <p className="mt-3 text-muted">
                            Staff সংখ্যা বাড়লে plan upgrade করুন — কোনো hidden
                            charge নেই।
                        </p>
                    </div>

                    {plans.length > 0 ? (
                        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {plans.map((plan) => (
                                <PlanCard key={plan.id} plan={plan} />
                            ))}
                        </div>
                    ) : (
                        <p className="mt-10 text-center text-muted">
                            Pricing শীঘ্রই আসছে।
                        </p>
                    )}

                    <div className="mt-8 text-center">
                        <Link
                            href="/pricing"
                            className="text-sm font-semibold text-brand-3 hover:underline"
                        >
                            বিস্তারিত plan comparison দেখুন →
                        </Link>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section id="how" className="border-t border-line py-20">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold">
                            মাত্র ৩ ধাপে শুরু
                        </h2>
                        <p className="mt-3 text-muted">
                            Setup থেকে attendance — কয়েক মিনিটেই।
                        </p>
                    </div>

                    <div className="mt-12 grid gap-8 md:grid-cols-3">
                        {steps.map((item) => (
                            <div key={item.step} className="relative">
                                <span className="text-4xl font-black text-brand/40">
                                    {item.step}
                                </span>
                                <h3 className="mt-2 text-lg font-semibold">
                                    {item.title}
                                </h3>
                                <p className="mt-2 text-sm text-muted">
                                    {item.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Roles */}
            <section id="roles" className="py-20">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold">
                            সবার জন্য আলাদা অভিজ্ঞতা
                        </h2>
                        <p className="mt-3 text-muted">
                            তিনটি role, তিনটি dedicated dashboard।
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 md:grid-cols-3">
                        {roles.map((role) => (
                            <div
                                key={role.badge}
                                className={`card p-6 ${role.featured ? "border-brand/60 ring-1 ring-brand/30" : ""}`}
                            >
                                <span
                                    className={`inline-block rounded-lg px-3 py-1 text-xs font-semibold ${role.featured ? "bg-brand text-white" : "border border-line bg-panel-3 text-ink-soft"}`}
                                >
                                    {role.badge}
                                </span>
                                <h3 className="mt-4 text-xl font-bold">
                                    {role.title}
                                </h3>
                                <ul className="mt-4 space-y-2 text-sm text-muted">
                                    {role.points.map((point) => (
                                        <li key={point} className="flex gap-2">
                                            <Icon
                                                name="check"
                                                size={16}
                                                className="mt-0.5 text-ok"
                                            />
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            {faqs.length > 0 && (
                <section id="faq" className="border-t border-line py-20">
                    <div className="mx-auto max-w-3xl px-4">
                        <h2 className="text-center text-3xl font-bold">
                            সাধারণ প্রশ্ন (FAQ)
                        </h2>

                        <div className="mt-10 space-y-4">
                            {faqs.map((faq, index) => (
                                <div key={index} className="card p-5">
                                    <p className="font-semibold">{faq.q}</p>
                                    <p className="mt-1 text-sm text-muted">
                                        {faq.a}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Contact */}
            <section id="contact" className="border-t border-line py-20">
                <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-2">
                    <div>
                        <h2 className="text-3xl font-bold">
                            সাথে যোগাযোগ করুন
                        </h2>
                        <p className="mt-3 text-muted">
                            যেকোনো প্রশ্ন, plan বা customization — লিখে জানান,
                            আমরা শীঘ্রই উত্তর দেব।
                        </p>

                        <div className="mt-8 space-y-3 text-ink-soft">
                            <p>📧 {site.contact_email}</p>
                            <p>📞 {site.contact_phone}</p>
                            <p>📍 {site.contact_address}</p>
                        </div>
                    </div>

                    <div className="card p-6">
                        {flash?.message && (
                            <div className="mb-4 rounded-xl border border-ok/40 bg-ok/10 p-3 text-sm text-ok-soft">
                                {flash.message}
                            </div>
                        )}

                        <form onSubmit={sendContact} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Field label="আপনার নাম">
                                    <input
                                        type="text"
                                        required
                                        value={contact.name}
                                        onChange={(e) =>
                                            setContact((prev) => ({
                                                ...prev,
                                                name: e.target.value,
                                            }))
                                        }
                                        className="input"
                                    />
                                </Field>
                                <Field label="Email">
                                    <input
                                        type="email"
                                        required
                                        value={contact.email}
                                        onChange={(e) =>
                                            setContact((prev) => ({
                                                ...prev,
                                                email: e.target.value,
                                            }))
                                        }
                                        className="input"
                                    />
                                </Field>
                            </div>

                            <Field label="Phone (ঐচ্ছিক)">
                                <input
                                    type="text"
                                    value={contact.phone}
                                    onChange={(e) =>
                                        setContact((prev) => ({
                                            ...prev,
                                            phone: e.target.value,
                                        }))
                                    }
                                    className="input"
                                />
                            </Field>

                            <Field label="বার্তা">
                                <textarea
                                    rows={4}
                                    required
                                    value={contact.message}
                                    onChange={(e) =>
                                        setContact((prev) => ({
                                            ...prev,
                                            message: e.target.value,
                                        }))
                                    }
                                    className="input"
                                />
                            </Field>

                            <button
                                type="submit"
                                disabled={sending}
                                className="btn-primary w-full py-3"
                            >
                                {sending ? "পাঠানো হচ্ছে..." : "বার্তা পাঠান"}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="pb-24">
                <div className="mx-auto max-w-5xl px-4">
                    <div className="card overflow-hidden border-brand/40 bg-linear-to-r from-brand-2/40 to-brand/30 px-8 py-14 text-center">
                        <h2 className="text-3xl font-bold text-ink">
                            {site.cta_heading}
                        </h2>
                        <p className="mx-auto mt-3 max-w-xl text-ink-soft">
                            {site.cta_subtext}
                        </p>
                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            <Link
                                href="/login"
                                className="btn-primary px-6 py-3"
                            >
                                Login করুন
                            </Link>
                        </div>
                        <div className="mx-auto mt-8 max-w-md rounded-xl border border-line bg-ink/5 p-4 text-left text-xs text-ink-soft">
                            <p className="font-semibold">
                                Demo accounts (password: password)
                            </p>
                            <p>super@platform.com — Super admin</p>
                            <p>admin@company.com — Company admin</p>
                            <p>rahim@company.com — Staff</p>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
