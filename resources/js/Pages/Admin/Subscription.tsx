import { Head, usePage } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { Icon } from '../../components/Icons';
import { Badge, Flash, PageHeader } from '../../components/ui';
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

const statusTone: Record<string, 'ok' | 'info' | 'danger' | 'neutral'> = {
    active: 'ok',
    trialing: 'info',
    expired: 'danger',
    cancelled: 'neutral',
};

const statusLabel: Record<string, string> = {
    active: 'Active',
    trialing: 'Trialing',
    expired: 'Expired',
    cancelled: 'Cancelled',
};

export default function AdminSubscription({ company, plan, subscription }: Props) {
    const { flash, errors } = usePage().props;
    const tone = statusTone[subscription.status] ?? 'neutral';
    const unlimited = subscription.staff_limit <= 0;
    const usagePercent = unlimited ? 0 : Math.min(100, (subscription.staff_count / subscription.staff_limit) * 100);

    return (
        <AppLayout>
            <Head title="Subscription" />

            <PageHeader
                icon="card"
                title="Subscription"
                subtitle={`${company.name} · ${company.office_name}`}
            />

            <Flash message={flash?.message} errors={errors} />

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="card p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-sm text-muted">Status</p>
                            <div className="mt-1">
                                <Badge tone={tone}>{statusLabel[subscription.status] ?? subscription.status}</Badge>
                            </div>
                        </div>

                        {subscription.days_left !== null && subscription.active && (
                            <div className="rounded-xl border border-warn/40 bg-warn/10 px-4 py-2 text-sm text-warn-soft">
                                {subscription.days_left === 0
                                    ? 'সাবস্ক্রিপশন আজ শেষ হচ্ছে'
                                    : `সাবস্ক্রিপশন শেষ হতে ${subscription.days_left} দিন বাকি`}
                            </div>
                        )}
                    </div>

                    <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                            <dt className="text-xs text-muted">Starting date</dt>
                            <dd className="mt-1 font-semibold">{formatDateShort(subscription.starts_at)}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-muted">Ending date</dt>
                            <dd className="mt-1 font-semibold">{formatDateShort(subscription.ends_at)}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-muted">Plan</dt>
                            <dd className="mt-1 font-semibold">{plan?.name ?? 'No plan assigned'}</dd>
                        </div>
                    </dl>
                </div>

                <div className="card p-6">
                    <h2 className="font-semibold">Staff usage</h2>

                    <div className="mt-3 flex items-center justify-between text-sm text-muted">
                        <span>
                            Staff:{' '}
                            <span className="font-semibold text-ink">
                                {subscription.staff_count} / {staffLimitLabel(subscription.staff_limit)}
                            </span>
                        </span>
                        <span>{unlimited ? '' : `${Math.round(usagePercent)}%`}</span>
                    </div>

                    {!unlimited && (
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-panel-3">
                            <div
                                className={`h-full rounded-full ${usagePercent >= 100 ? 'bg-danger' : 'bg-brand'}`}
                                style={{ width: `${usagePercent}%` }}
                            />
                        </div>
                    )}

                    <p className="mt-4 rounded-xl border border-line-2 bg-panel-3 p-3 text-sm text-muted">
                        Limit পূর্ণ হলে নতুন staff যোগ করা বন্ধ হবে। আরও staff বা plan পরিবর্তন করতে platform
                        admin-এর সাথে যোগাযোগ করুন।
                    </p>
                </div>
            </div>

            <div className="card mt-5 p-6">
                <h2 className="font-semibold">Plan details</h2>

                {plan ? (
                    <>
                        <div className="mt-3 flex flex-wrap items-baseline gap-2">
                            <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
                            <span className="text-sm text-muted">/ {plan.billing_cycle}</span>
                        </div>

                        <ul className="mt-4 space-y-2 text-sm text-ink-soft">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex gap-2">
                                    <Icon name="check" size={16} className="mt-0.5 text-ok" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <p className="mt-3 text-sm text-muted">এই company-তে কোনো plan বরাদ্দ নেই।</p>
                )}
            </div>
        </AppLayout>
    );
}
