import { usePage } from '@inertiajs/react';

/**
 * Renders the super-admin uploaded logo for the active colour theme,
 * falling back to the default "Staff7" text chip when none is set.
 */
export default function Logo({
    size = 'md',
    fallback,
}: {
    size?: 'sm' | 'md';
    fallback?: string;
}) {
    const { branding, theme } = usePage().props;
    const src = (theme === 'light' ? branding?.logo_light : branding?.logo_dark) ?? null;

    if (src) {
        return (
            <img
                src={src}
                alt={branding?.name ?? 'Logo'}
                className={size === 'sm' ? 'h-9 w-auto max-w-[180px] object-contain' : 'h-11 w-auto max-w-[200px] object-contain'}
            />
        );
    }

    if (fallback) {
        return (
            <span className={size === 'sm' ? 'text-lg font-bold' : 'text-xl font-bold'}>
                {fallback}
            </span>
        );
    }

    return (
        <span className={size === 'sm' ? 'logo-chip text-base' : 'logo-chip'}>
            Staff<b>7</b>
        </span>
    );
}
