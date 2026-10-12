import { Link } from '@inertiajs/react';
import type { Plan } from '../types';
import { formatPrice, staffLimitLabel } from '../lib/format';

export default function PlanCard({ plan }: { plan: Plan }) {
    const featured = plan.is_featured;

    return (
        <div
            className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm ${
                featured ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-gray-200'
            }`}
        >
            {featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                    Most popular
                </span>
            )}

            <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{staffLimitLabel(plan.staff_limit)}</p>

            <div className="mt-4 flex items-end gap-1">
                <span className="text-3xl font-extrabold text-gray-900">
                    {formatPrice(plan.price)}
                </span>
                <span className="pb-1 text-sm text-gray-500">/ {plan.billing_cycle}</span>
            </div>

            <ul className="mt-6 flex-1 space-y-3 text-sm text-gray-600">
                {(plan.features ?? []).map((feature) => (
                    <li key={feature} className="flex gap-2">
                        <span className="text-emerald-500">✓</span>
                        {feature}
                    </li>
                ))}
            </ul>

            <Link
                href="/login"
                className={`mt-6 rounded-lg px-4 py-2 text-center font-semibold ${
                    featured
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
                Get started
            </Link>
        </div>
    );
}
