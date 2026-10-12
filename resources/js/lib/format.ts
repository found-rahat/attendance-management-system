export function formatPrice(value: number | string): string {
    const n = typeof value === 'number' ? value : parseFloat(String(value));

    if (!Number.isFinite(n)) {
        return '—';
    }

    if (n === 0) {
        return 'Free';
    }

    return `৳${n.toLocaleString('en-US')}`;
}

export function staffLimitLabel(limit: number): string {
    if (limit <= 0) {
        return 'Unlimited staff';
    }

    return `Up to ${limit.toLocaleString('en-US')} staff`;
}

export function formatDateShort(value: string | null | undefined): string {
    if (!value) {
        return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
