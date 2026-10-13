import { Link } from '@inertiajs/react';
import type { Plan } from '../types';
import { formatPrice, staffLimitLabel } from '../lib/format';
import { Icon } from './Icons';

export default function PlanCard({ plan }: { plan: Plan }) {
    const featured = plan.is_featured;

    return (
        <div className={`card relative flex flex-col p-6 ${featured ? 'border-brand/60 ring-1 ring-brand/30' : ''}`}>
            {featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white shadow-[0_0_16px_rgba(139,44,245,0.6)]">
                    Most popular
                </span>
            )}

            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <p className="mt-1 text-sm text-muted">{staffLimitLabel(plan.staff_limit)}</p>

            <div className="mt-4 flex items-end gap-1">
                <span className="text-3xl font-extrabold">{formatPrice(plan.price)}</span>
                <span className="pb-1 text-sm text-muted">/ {plan.billing_cycle}</span>
            </div>

            <ul className="mt-6 flex-1 space-y-3 text-sm text-ink-soft">
                {(plan.features ?? []).map((feature) => (
                    <li key={feature} className="flex gap-2">
                        <Icon name="check" size={16} className="mt-0.5 text-ok" />
                        {feature}
                    </li>
                ))}
            </ul>

            <Link
                href="/login"
                className={`mt-6 rounded-xl px-4 py-2 text-center font-semibold transition ${
                    featured
                        ? 'bg-linear-to-r from-brand-2 to-brand text-white shadow-[0_0_20px_rgba(139,44,245,0.45)] hover:brightness-110'
                        : 'border border-line bg-panel-2 text-ink-soft hover:border-brand/60 hover:text-ink'
                }`}
            >
                Get started
            </Link>
        </div>
    );
}
