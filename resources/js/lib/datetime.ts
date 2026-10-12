const TIMEZONE = 'Asia/Dhaka';

export function formatDate(value: string | null | undefined): string {
    if (!value) {
        return '—';
    }

    const clean = value.length > 10 ? value.slice(0, 10) : value;
    const date = new Date(`${clean}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return clean;
    }

    return date.toLocaleDateString('en-GB', {
        timeZone: TIMEZONE,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function formatDateTime(value: string | null | undefined): string {
    if (!value) {
        return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString('en-GB', {
        timeZone: TIMEZONE,
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}