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

export function formatTime(value: string | null | undefined): string {
    if (!value) {
        return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleTimeString('en-GB', {
        timeZone: TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
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

/**
 * Converts a stored (UTC) date-time into the value expected by an
 * <input type="datetime-local"> in the company timezone, e.g. "2026-10-13T09:15".
 */
export function toLocalInput(value: string | null | undefined): string {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).formatToParts(date);

    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';

    return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}