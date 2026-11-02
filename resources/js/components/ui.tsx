import type { ReactNode } from 'react';
import { Icon } from './Icons';

/* -------------------------------------------------------------------------- */
/* Flash message                                                              */
/* -------------------------------------------------------------------------- */

export function Flash({ message, errors }: { message?: string; errors?: Record<string, string> }) {
    const firstError = errors ? Object.values(errors)[0] : undefined;

    if (!message && !firstError) {
        return null;
    }

    return (
        <div className="space-y-2">
            {message && (
                <div className="flex items-center gap-2 rounded-xl border border-ok/40 bg-ok/10 px-4 py-3 text-sm text-ok-soft">
                    <Icon name="check" size={16} className="text-ok" />
                    {message}
                </div>
            )}
            {firstError && (
                <div className="flex items-center gap-2 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger-soft">
                    <Icon name="close" size={16} className="text-danger" />
                    {firstError}
                </div>
            )}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Page header                                                                */
/* -------------------------------------------------------------------------- */

export function PageHeader({
    icon,
    title,
    subtitle,
    children,
}: {
    icon: string;
    title: string;
    subtitle?: string;
    children?: ReactNode;
}) {
    return (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-xl border border-brand/40 bg-brand/15 text-brand-3">
                    <Icon name={icon} size={22} />
                </div>
                <div>
                    <h1 className="text-xl font-semibold sm:text-2xl">{title}</h1>
                    {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
                </div>
            </div>
            {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Stat card                                                                  */
/* -------------------------------------------------------------------------- */

const TONES: Record<string, { wrap: string; ic: string; bar: string }> = {
    purple: {
        wrap: 'from-stat-purple to-panel-deep',
        ic: 'from-[#7a2be8] to-[#5b1fc4] shadow-[0_0_16px_rgba(139,44,245,0.55)]',
        bar: 'bg-brand',
    },
    blue: {
        wrap: 'from-stat-blue to-panel-deep',
        ic: 'from-[#1e5aa8] to-[#123f7c] border border-info/70',
        bar: 'bg-[#2b7de0]',
    },
    orange: {
        wrap: 'from-stat-orange to-panel-deep',
        ic: 'from-[#f2561a] to-[#c43a0c] shadow-[0_0_16px_rgba(249,115,22,0.45)]',
        bar: 'bg-[#c2410c]',
    },
    gold: {
        wrap: 'from-stat-gold to-panel-deep',
        ic: 'from-[#e0a21b] to-[#b87a0a] shadow-[0_0_16px_rgba(245,165,36,0.4)]',
        bar: 'bg-[#a8780f]',
    },
    cyan: {
        wrap: 'from-stat-cyan to-panel-deep',
        ic: 'from-[#0e7490] to-[#155e75] shadow-[0_0_16px_rgba(34,211,238,0.4)]',
        bar: 'bg-cy',
    },
    green: {
        wrap: 'from-stat-green to-panel-deep',
        ic: 'from-[#15803d] to-[#166534] shadow-[0_0_16px_rgba(34,197,94,0.4)]',
        bar: 'bg-ok',
    },
};

const BAR_HEIGHTS = [14, 30, 22, 38, 30, 52];

export function StatCard({
    tone = 'purple',
    icon,
    label,
    value,
    sub,
}: {
    tone?: keyof typeof TONES;
    icon: string;
    label: string;
    value: ReactNode;
    sub?: ReactNode;
}) {
    const t = TONES[tone] ?? TONES.purple;

    return (
        <div
            className={`card relative flex h-[112px] items-center gap-4 overflow-hidden bg-linear-to-br px-5 ${t.wrap}`}
        >
            <div
                className={`grid h-13 w-13 shrink-0 place-items-center rounded-xl bg-linear-to-br text-white ${t.ic}`}
                style={{ width: 52, height: 52 }}
            >
                <Icon name={icon} size={24} />
            </div>
            <div className="z-1">
                <div className="text-sm text-ink-soft">{label}</div>
                <div className="text-2xl font-semibold leading-tight">{value}</div>
                {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
            </div>
            <div className="absolute right-4 bottom-3 flex h-14 items-end gap-1.5">
                {BAR_HEIGHTS.map((h, i) => (
                    <i
                        key={i}
                        className={`block w-1.5 rounded-sm opacity-80 ${t.bar}`}
                        style={{ height: h }}
                    />
                ))}
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Badge / tag                                                                */
/* -------------------------------------------------------------------------- */

type Tone = 'neutral' | 'ok' | 'danger' | 'warn' | 'info' | 'brand' | 'gold' | 'cyan';

const BADGE_TONES: Record<Tone, string> = {
    neutral: 'border-line text-ink-soft bg-panel-3',
    ok: 'border-ok bg-ok-bg text-ok-soft',
    danger: 'border-danger bg-danger-bg text-danger-soft',
    warn: 'border-warn bg-warn-bg text-warn-soft',
    info: 'border-info bg-info-bg text-info-soft',
    brand: 'border-brand-2 bg-brand/15 text-brand-soft',
    gold: 'border-gold bg-warn-bg text-warn-soft',
    cyan: 'border-cy/60 bg-cy/10 text-cy',
};

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
    return <span className={`tag ${BADGE_TONES[tone]}`}>{children}</span>;
}

/* -------------------------------------------------------------------------- */
/* Field wrapper                                                              */
/* -------------------------------------------------------------------------- */

export function Field({
    label,
    icon,
    children,
    className = '',
}: {
    label?: string;
    icon?: string;
    children: ReactNode;
    className?: string;
}) {
    if (icon) {
        return (
            <div className={className}>
                {label && <label className="label">{label}</label>}
                <div className="field">
                    <Icon name={icon} size={16} className="text-muted" />
                    {children}
                </div>
            </div>
        );
    }

    return (
        <div className={className}>
            {label && <label className="label">{label}</label>}
            {children}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Empty state                                                                */
/* -------------------------------------------------------------------------- */

export function EmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
    return (
        <tr>
            <td colSpan={colSpan} className="py-8 text-center text-sm text-muted">
                {children}
            </td>
        </tr>
    );
}

/* -------------------------------------------------------------------------- */
/* Modal                                                                      */
/* -------------------------------------------------------------------------- */

export function Modal({
    open,
    onClose,
    title,
    children,
    className = 'max-w-2xl',
}: {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    className?: string;
}) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />
            <div className={`relative z-10 w-full ${className} overflow-visible rounded-2xl border border-line bg-panel p-5 shadow-[0_0_40px_rgba(0,0,0,0.6)]`}>
                <div className="mb-4 flex items-center justify-between gap-4">
                    <h3 className="font-semibold">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-panel-2 text-muted transition hover:border-danger/50 hover:text-danger"
                        aria-label="Close"
                    >
                        <Icon name="close" size={18} />
                    </button>
                </div>
                <div className="overflow-visible">{children}</div>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Pagination                                                                 */
/* -------------------------------------------------------------------------- */

export function Pagination({
    currentPage,
    lastPage,
    prevUrl,
    nextUrl,
}: {
    currentPage: number;
    lastPage: number;
    prevUrl: string | null;
    nextUrl: string | null;
}) {
    return (
        <div className="flex flex-wrap items-center gap-4">
            {prevUrl ? (
                <a href={prevUrl} className="btn-ghost px-4 py-2">
                    ← Previous
                </a>
            ) : (
                <span className="btn-ghost px-4 py-2 opacity-40">← Previous</span>
            )}
            <span className="text-sm text-muted">
                Page {currentPage} of {lastPage}
            </span>
            {nextUrl ? (
                <a href={nextUrl} className="btn-ghost px-4 py-2">
                    Next →
                </a>
            ) : (
                <span className="btn-ghost px-4 py-2 opacity-40">Next →</span>
            )}
        </div>
    );
}
