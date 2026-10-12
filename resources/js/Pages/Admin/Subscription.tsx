import { Head, usePage } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { formatDateShort, formatPrice, staffLimitLabel } from '../../lib/format';
import type { Subscription } from '../../types';

type PlanView = {
    id: number;
    name: string;
    price: number | string;
    billing_cycle: string;
    staff_limit: number;
    is_unlimited: boolean;
    features: string[];
};

type Props = {
    company: { id: number; name: string; office_name: string };
    plan: PlanView | null;
    subscription: Subscription;
};

const statusLabels: Record<string, { label: string; classes: string }> = {
    active: { label: 'Active', classes: 'bg-emerald-100 text-emerald-700' },
    trialing: { label: 'Trialing', classes: 'bg-sky-100 text-sky-700' },
    expired: { label: 'Expired', classes: 'bg-red-100 text-red-700' },
    cancelled: { label: 'Cancelled', classes: 'bg-gray-100 text-gray-600' },
};

export default function AdminSubscription({ company, plan, subscription }: Props) {
    const { flash } = usePage().props;
    const status = statusLabels[subscription.status] ?? statusLabels.active;
    const unlimited = subscription.staff_limit <= 0;
    const usagePercent = unlimited
        ? 0
        : Math.min(100, (subscription.staff_count / subscription.staff_limit) * 100);

    return (
        <AppLayout>
            <Head title="Subscription" />

            <main className="mx-auto max-w-3xl space-y-6 p-4">
                <h1 className="text-2xl font-bold">Subscription</h1>
                <p className="text-sm text-gray-600">
                    {company.name} · {company.office_name}
                </p>

                {flash?.message && (
                    <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
                        {flash.message}
                    </div>
                )}

                {/* Status + dates */}
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <span
                                className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-semibold ${status.classes}`}
                            >
                                {status.label}
                            </span>
                        </div>

                        {subscription.days_left !== null && subscription.active && (
                            <div className="rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
                                {subscription.days_left === 0
                                    ? 'সাবস্ক্রিপশন আজ শেষ হচ্ছে'
                                    : `সাবস্ক্রিপশন শেষ হতে ${subscription.days_left} দিন বাকি`}
                            </div>
                        )}
                    </div>

                    <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                            <dt className="text-xs text-gray-500">Starting date</dt>
                            <dd className="mt-1 font-semibold text-gray-900">
                                {formatDateShort(subscription.starts_at)}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs text-gray-500">Ending date</dt>
                            <dd className="mt-1 font-semibold text-gray-900">
                                {formatDateShort(subscription.ends_at)}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs text-gray-500">Plan</dt>
                            <dd className="mt-1 font-semibold text-gray-900">
                                {plan?.name ?? 'No plan assigned'}
                            </dd>
                        </div>
                    </dl>
                </div>

                {/* Usage */}
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="font-semibold text-gray-900">Staff usage</h2>

                    <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                        <span>
                            Staff:{' '}
                            <span className="font-semibold text-gray-900">
                                {subscription.staff_count} / {staffLimitLabel(subscription.staff_limit)}
                            </span>
                        </span>
                        <span>{unlimited ? '' : `${Math.round(usagePercent)}%`}</span>
                    </div>

                    {!unlimited && (
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                                className={`h-full rounded-full ${
                                    usagePercent >= 100 ? 'bg-red-500' : 'bg-indigo-600'
                                }`}
                                style={{ width: `${usagePercent}%` }}
                            />
                        </div>
                    )}

                    <p className="mt-4 rounded-md bg-gray-50 p-3 text-sm text-gray-600">
                        Limit পূর্ণ হলে নতুন staff যোগ করা বন্ধ হবে। আরও staff বা plan
                        পরিবর্তন করতে platform admin-এর সাথে যোগাযোগ করুন।
                    </p>
                </div>

                {/* Plan details */}
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="font-semibold text-gray-900">Plan details</h2>

                    {plan ? (
                        <>
                            <div className="mt-3 flex flex-wrap items-baseline gap-2">
                                <span className="text-3xl font-bold text-gray-900">
                                    {formatPrice(plan.price)}
                                </span>
                                <span className="text-sm text-gray-500">
                                    / {plan.billing_cycle}
                                </span>
                            </div>

                            <ul className="mt-4 space-y-2 text-sm text-gray-600">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex gap-2">
                                        <span className="text-emerald-500">✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <p className="mt-3 text-sm text-gray-500">
                            এই company-তে কোনো plan বরাদ্দ নেই।
                        </p>
                    )}
                </div>
            </main>
        </AppLayout>
    );
}