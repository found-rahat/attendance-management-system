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

            <section className="py-16">
                <div className="mx-auto max-w-6xl px-4 text-center">
                    <span className="inline-block rounded-lg border border-brand/40 bg-brand/15 px-3 py-1 text-xs font-semibold text-brand-3">
                        Pricing
                    </span>
                    <h1 className="mt-4 text-4xl font-extrabold">আপনার team-এর জন্য সঠিক plan</h1>
                    <p className="mx-auto mt-4 max-w-2xl text-muted">
                        Employee সংখ্যা অনুযায়ী সহজ package। কোনো hidden cost নেই — যতজন staff, ততটুকু plan।
                    </p>
                    <p className="mt-4 text-sm text-muted">
                        {stats.companies} company ও {stats.staff} staff ইতিমধ্যে ব্যবহার করছে
                    </p>
                </div>
            </section>

            <section className="pb-16">
                <div className="mx-auto max-w-6xl px-4">
                    {plans.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {plans.map((plan) => (
                                <PlanCard key={plan.id} plan={plan} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted">Pricing শীঘ্রই আসছে।</p>
                    )}
                </div>
            </section>

            {plans.length > 0 && (
                <section className="border-t border-line py-16">
                    <div className="mx-auto max-w-6xl px-4">
                        <h2 className="text-center text-2xl font-bold">Plan comparison</h2>

                        <div className="card mt-10 overflow-x-auto p-0">
                            <table className="data-table min-w-[640px]">
                                <thead>
                                    <tr>
                                        <th className="text-left">Feature</th>
                                        {plans.map((plan) => (
                                            <th key={plan.id}>{plan.name}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="text-left text-muted">Monthly price</td>
                                        {plans.map((plan) => (
                                            <td key={plan.id} className="font-bold">
                                                {formatPrice(plan.price)}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="text-left text-muted">Staff limit</td>
                                        {plans.map((plan) => (
                                            <td key={plan.id}>{staffLimitLabel(plan.staff_limit)}</td>
                                        ))}
                                    </tr>

                                    {featureRows(plans).map((row) => (
                                        <tr key={row}>
                                            <td className="text-left text-muted">{row}</td>
                                            {plans.map((plan) => (
                                                <td key={plan.id}>
                                                    {(plan.features ?? []).includes(row) ? (
                                                        <span className="text-ok">✓</span>
                                                    ) : (
                                                        <span className="text-muted">—</span>
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

            <section className="border-t border-line py-16">
                <div className="mx-auto max-w-3xl px-4">
                    <h2 className="text-center text-2xl font-bold">সাধারণ প্রশ্ন (FAQ)</h2>

                    <div className="mt-8 space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="card p-5">
                                <p className="font-semibold">{faq.q}</p>
                                <p className="mt-1 text-sm text-muted">{faq.a}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 text-center">
                        <Link href="/login" className="btn-primary px-6 py-3">
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
