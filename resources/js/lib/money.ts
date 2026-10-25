export function money(value: number | string | null | undefined): string {
    const n = Number(value ?? 0);

    if (!Number.isFinite(n)) {
        return '৳ 0';
    }

    return `৳ ${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}