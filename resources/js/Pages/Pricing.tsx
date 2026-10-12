import { Head, Link } from '@inertiajs/react';
import PublicLayout from '../Layouts/PublicLayout';
import PlanCard from '../components/PlanCard';
import { formatPrice, staffLimitLabel } from '../lib/format';
import type { Plan, SiteSettings } from '../types';

type Props = {
    plans: Plan[];
    site: SiteSettings;
    stats: { companies: number; staff: number };
};

export default function Pricing({ plans, site, stats }: Props) {
    const faqs = site.faqs ?? [];
    return (
        <PublicLayout site={site}>
            <Head title="Pricing" />

            <section className="bg-gray-50 py-16">
                <div className="mx-auto max-w-6xl px-4 text-center">
                    <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                        Pricing
                    </span>
                    <h1 className="mt-4 text-4xl font-extrabold text-gray-900">
                        আপনার team-এর জন্য সঠিক plan
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-gray-600">
                        Employee সংখ্যা অনুযায়ী সহজ package। কোনো hidden cost নেই —
                        যতজন staff, ততটুকু plan।
                    </p>
                    <p className="mt-4 text-sm text-gray-500">
                        {stats.companies} company ও {stats.staff} staff ইতিমধ্যে ব্যবহার করছে
                    </p>
                </div>
            </section>

            <section className="py-16">
                <div className="mx-auto max-w-6xl px-4">
                    {plans.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {plans.map((plan) => (
                                <PlanCard key={plan.id} plan={plan} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">Pricing শীঘ্রই আসছে।</p>
                    )}
                </div>
            </section>

            {plans.length > 0 && (
                <section className="border-t border-gray-100 py-16">
                    <div className="mx-auto max-w-6xl px-4">
                        <h2 className="text-center text-2xl font-bold text-gray-900">
                            Plan comparison
                        </h2>

                        <div className="mt-10 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
                            <table className="w-full min-w-[640px] text-left text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-4 font-semibold text-gray-700">
                                            Feature
                                        </th>
                                        {plans.map((plan) => (
                                            <th
                                                key={plan.id}
                                                className="p-4 text-center font-semibold text-gray-700"
                                            >
                                                {plan.name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-t">
                                        <td className="p-4 text-gray-600">Monthly price</td>
                                        {plans.map((plan) => (
                                            <td
                                                key={plan.id}
                                                className="p-4 text-center font-bold text-gray-900"
                                            >
                                                {formatPrice(plan.price)}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="border-t">
                                        <td className="p-4 text-gray-600">Staff limit</td>
                                        {plans.map((plan) => (
                                            <td key={plan.id} className="p-4 text-center">
                                                {staffLimitLabel(plan.staff_limit)}
                                            </td>
                                        ))}
                                    </tr>

                                    {featureRows(plans).map((row) => (
                                        <tr key={row} className="border-t">
                                            <td className="p-4 text-gray-600">{row}</td>
                                            {plans.map((plan) => (
                                                <td key={plan.id} className="p-4 text-center">
                                                    {(plan.features ?? []).includes(row) ? (
                                                        <span className="text-emerald-500">
                                                            ✓
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300">—</span>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            )}

            <section className="bg-gray-50 py-16">
                <div className="mx-auto max-w-3xl px-4">
                    <h2 className="text-center text-2xl font-bold text-gray-900">
                        সাধারণ প্রশ্ন (FAQ)
                    </h2>

                    <div className="mt-8 space-y-4">
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

                    <div className="mt-10 text-center">
                        <Link
                            href="/login"
                            className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
                        >
                            Login করে শুরু করুন
                        </Link>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}

function featureRows(plans: Plan[]): string[] {
    const rows = new Set<string>();

    plans.forEach((plan) => {
        (plan.features ?? []).forEach((feature) => rows.add(feature));
    });

    return Array.from(rows);
}
