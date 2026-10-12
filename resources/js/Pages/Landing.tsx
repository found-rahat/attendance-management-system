import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import PublicLayout from '../Layouts/PublicLayout';
import PlanCard from '../components/PlanCard';
import type { Plan, SiteSettings } from '../types';

const steps = [
    {
        step: '01',
        title: 'Office সেট করুন',
        text: 'Map-এ click করে অফিসের location ও geofence radius নির্ধারণ করুন।',
    },
    {
        step: '02',
        title: 'Staff যোগ করুন',
        text: 'Admin panel থেকে staff-এর account তৈরি করুন — email ও password দিলেই হবে।',
    },
    {
        step: '03',
        title: 'Attendance শুরু',
        text: 'Staff অফিসে পৌঁছে Check In করবে, বের হওয়ার সময় Check Out। Report স্বয়ংক্রিয়ভাবে তৈরি।',
    },
];

const roles = [
    {
        badge: 'Super Admin',
        title: 'Platform Owner',
        points: ['অসংখ্য company তৈরি করুন', 'Plan ও subscription নিয়ন্ত্রণ', 'সার্বিক dashboard ও statistics'],
    },
    {
        badge: 'Company Admin',
        title: 'Office Manager',
        points: ['Office ও geofence সেটিংস', 'Staff যোগ / remove', 'Report ও live map'],
        featured: true,
    },
    {
        badge: 'Staff',
        title: 'Team Member',
        points: ['GPS দিয়ে Check In / Out', 'নিজের attendance history', 'সময়ের accuracy ও distance'],
    },
];

type Props = {
    plans: Plan[];
    site: SiteSettings;
};

export default function Landing({ plans, site }: Props) {
    const { flash, errors } = usePage().props;
    const [contact, setContact] = useState({ name: '', email: '', phone: '', message: '' });
    const [sending, setSending] = useState(false);

    const features = site.features ?? [];
    const faqs = site.faqs ?? [];

    function sendContact(e: React.FormEvent) {
        e.preventDefault();
        setSending(true);
        router.post('/contact', contact, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => setContact({ name: '', email: '', phone: '', message: '' }),
            onFinish: () => setSending(false),
        });
    }

    return (
        <PublicLayout site={site}>
            <Head title="GPS Staff Attendance System" />

            {/* Hero */}
            <section id="top" className="relative overflow-hidden pt-12 pb-20">
                <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-100 blur-3xl" />
                <div className="pointer-events-none absolute top-40 -left-24 h-80 w-80 rounded-full bg-emerald-100 blur-3xl" />

                <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            GPS-powered attendance
                        </span>

                        <h1 className="mt-5 text-4xl font-extrabold leading-tight text-gray-900 sm:text-5xl">
                            {site.hero_title}
                        </h1>

                        <p className="mt-5 max-w-xl text-lg text-gray-600">
                            {site.hero_subtitle}
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href="/login"
                                className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-indigo-700"
                            >
                                Get started
                            </Link>
                            <a
                                href="#pricing"
                                className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Pricing দেখুন
                            </a>
                        </div>

                        <div className="mt-10 grid grid-cols-3 gap-6 border-t border-gray-100 pt-6">
                            <div>
                                <p className="text-2xl font-bold text-gray-900">100m</p>
                                <p className="text-sm text-gray-500">Default geofence</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">3</p>
                                <p className="text-sm text-gray-500">Role based</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">∞</p>
                                <p className="text-sm text-gray-500">Companies</p>
                            </div>
                        </div>
                    </div>

                    {/* Mock preview */}
                    <div className="relative">
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
                            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                                <span className="h-3 w-3 rounded-full bg-red-400" />
                                <span className="h-3 w-3 rounded-full bg-amber-400" />
                                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                                <span className="ml-3 text-xs text-gray-400">
                                    app.attendly.local/attendance
                                </span>
                            </div>

                            <div className="mt-4 space-y-3">
                                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">
                                            Main Office
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Radius 100m · Gulshan, Dhaka
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                        inside ✓
                                    </span>
                                </div>

                                <div className="h-44 overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
                                    <div className="relative h-full w-full">
                                        <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-emerald-400/70 bg-emerald-400/10" />
                                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl">
                                            🏢
                                        </span>
                                        <span className="absolute left-[38%] top-[60%] text-lg">
                                            📍
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button className="rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white">
                                        Check In
                                    </button>
                                    <button className="rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white">
                                        Check Out
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg sm:block">
                            <p className="text-xs text-gray-500">Today</p>
                            <p className="text-sm font-bold text-gray-900">
                                <span className="text-emerald-600">18 present</span> · 3 late
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="border-t border-gray-100 bg-gray-50 py-20">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold text-gray-900">
                            যেকোনো office-এর জন্য যা যা দরকার
                        </h2>
                        <p className="mt-3 text-gray-600">
                            সরল, দ্রুত আর নির্ভুল attendance — যান-আসা থেকে রিপোর্ট
                            পর্যন্ত সবকিছু একসাথে।
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, index) => (
                            <div
                                key={`${feature.title}-${index}`}
                                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                            >
                                <span className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-50 text-2xl">
                                    {feature.icon}
                                </span>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                                    {feature.title}
                                </h3>
                                <p className="mt-2 text-sm text-gray-600">{feature.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-20">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold text-gray-900">
                            আপনার team-এর সাইজ অনুযায়ী plan
                        </h2>
                        <p className="mt-3 text-gray-600">
                            Staff সংখ্যা বাড়লে plan upgrade করুন — কোনো hidden charge নেই।
                        </p>
                    </div>

                    {plans.length > 0 ? (
                        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {plans.map((plan) => (
                                <PlanCard key={plan.id} plan={plan} />
                            ))}
                        </div>
                    ) : (
                        <p className="mt-10 text-center text-gray-500">
                            Pricing শীঘ্রই আসছে।
                        </p>
                    )}

                    <div className="mt-8 text-center">
                        <Link
                            href="/pricing"
                            className="text-sm font-semibold text-indigo-600 hover:underline"
                        >
                            বিস্তারিত plan comparison দেখুন →
                        </Link>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section id="how" className="border-t border-gray-100 bg-gray-50 py-20">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold text-gray-900">
                            মাত্র ৩ ধাপে শুরু
                        </h2>
                        <p className="mt-3 text-gray-600">
                            Setup থেকে attendance — কয়েক মিনিটেই।
                        </p>
                    </div>

                    <div className="mt-12 grid gap-8 md:grid-cols-3">
                        {steps.map((item) => (
                            <div key={item.step} className="relative">
                                <span className="text-4xl font-black text-indigo-100">
                                    {item.step}
                                </span>
                                <h3 className="mt-2 text-lg font-semibold text-gray-900">
                                    {item.title}
                                </h3>
                                <p className="mt-2 text-sm text-gray-600">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Roles */}
            <section id="roles" className="py-20">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold text-gray-900">
                            সবার জন্য আলাদা অভিজ্ঞতা
                        </h2>
                        <p className="mt-3 text-gray-600">
                            তিনটি role, তিনটি dedicated dashboard।
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 md:grid-cols-3">
                        {roles.map((role) => (
                            <div
                                key={role.badge}
                                className={`rounded-2xl border bg-white p-6 shadow-sm ${
                                    role.featured
                                        ? 'border-indigo-300 ring-2 ring-indigo-100'
                                        : 'border-gray-200'
                                }`}
                            >
                                <span
                                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                                        role.featured
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    {role.badge}
                                </span>
                                <h3 className="mt-4 text-xl font-bold text-gray-900">
                                    {role.title}
                                </h3>
                                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                                    {role.points.map((point) => (
                                        <li key={point} className="flex gap-2">
                                            <span className="text-emerald-500">✓</span>
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
                <section id="faq" className="border-t border-gray-100 bg-gray-50 py-20">
                    <div className="mx-auto max-w-3xl px-4">
                        <h2 className="text-center text-3xl font-bold text-gray-900">
                            সাধারণ প্রশ্ন (FAQ)
                        </h2>

                        <div className="mt-10 space-y-4">
                            {faqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="rounded-xl border border-gray-200 bg-white p-5"
                                >
                                    <p className="font-semibold text-gray-900">{faq.q}</p>
                                    <p className="mt-1 text-sm text-gray-600">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Contact */}
            <section id="contact" className="border-t border-gray-100 py-20">
                <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-2">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            সাথে যোগাযোগ করুন
                        </h2>
                        <p className="mt-3 text-gray-600">
                            যেকোনো প্রশ্ন, plan বা customization — লিখে জানান, আমরা শীঘ্রই
                            উত্তর দেব।
                        </p>

                        <div className="mt-8 space-y-3 text-gray-700">
                            <p>📧 {site.contact_email}</p>
                            <p>📞 {site.contact_phone}</p>
                            <p>📍 {site.contact_address}</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        {flash?.message && (
                            <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
                                {flash.message}
                            </div>
                        )}

                        <form onSubmit={sendContact} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium">আপনার নাম</label>
                                    <input
                                        type="text"
                                        required
                                        value={contact.name}
                                        onChange={(e) =>
                                            setContact((prev) => ({ ...prev, name: e.target.value }))
                                        }
                                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                                    />
                                    {errors?.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={contact.email}
                                        onChange={(e) =>
                                            setContact((prev) => ({ ...prev, email: e.target.value }))
                                        }
                                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                                    />
                                    {errors?.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Phone (ঐচ্ছিক)</label>
                                <input
                                    type="text"
                                    value={contact.phone}
                                    onChange={(e) =>
                                        setContact((prev) => ({ ...prev, phone: e.target.value }))
                                    }
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium">বার্তা</label>
                                <textarea
                                    rows={4}
                                    required
                                    value={contact.message}
                                    onChange={(e) =>
                                        setContact((prev) => ({ ...prev, message: e.target.value }))
                                    }
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                                />
                                {errors?.message && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.message}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {sending ? 'পাঠানো হচ্ছে...' : 'বার্তা পাঠান'}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="pb-24">
                <div className="mx-auto max-w-5xl px-4">
                    <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-indigo-800 px-8 py-14 text-center shadow-xl">
                        <h2 className="text-3xl font-bold text-white">
                            {site.cta_heading}
                        </h2>
                        <p className="mx-auto mt-3 max-w-xl text-indigo-100">
                            {site.cta_subtext}
                        </p>
                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            <Link
                                href="/login"
                                className="rounded-lg bg-white px-6 py-3 font-semibold text-indigo-700 hover:bg-indigo-50"
                            >
                                Login করুন
                            </Link>
                        </div>
                        <div className="mx-auto mt-8 max-w-md rounded-xl bg-white/10 p-4 text-left text-xs text-indigo-50">
                            <p className="font-semibold">Demo accounts (password: password)</p>
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
