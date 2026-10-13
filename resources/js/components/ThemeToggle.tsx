import { router, usePage } from '@inertiajs/react';
import { Icon } from './Icons';

export default function ThemeToggle({ className = '' }: { className?: string }) {
    const { theme } = usePage().props;
    const current = theme ?? 'dark';
    const next = current === 'light' ? 'dark' : 'light';

    function toggle() {
        document.documentElement.classList.toggle('light', next === 'light');

        router.post('/theme', { theme: next }, { preserveScroll: true, preserveState: true });
    }

    return (
        <button
            type="button"
            onClick={toggle}
            className={`grid h-10 w-10 place-items-center rounded-xl border border-line bg-panel-2 text-ink-soft transition hover:border-brand/60 hover:text-brand-ink ${className}`}
            aria-label={next === 'light' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={next === 'light' ? 'Light theme' : 'Dark theme'}
        >
            <Icon name={current === 'light' ? 'moon' : 'sun'} size={18} />
        </button>
    );
}
