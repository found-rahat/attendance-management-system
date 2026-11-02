import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from './Icons';

type Props = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function toISO(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function parseDate(value: string): Date | null {
    if (!value) return null;
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
}

export default function DatePicker({ value, onChange, placeholder = 'Select date' }: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const initial = parseDate(value) ?? new Date();
    const [view, setView] = useState<Date>(initial);

    useEffect(() => {
        const d = parseDate(value);
        if (d) setView(d);
    }, [value]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const days = useMemo(() => {
        const year = view.getFullYear();
        const month = view.getMonth();
        const first = new Date(year, month, 1);
        const startWeekday = first.getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const cells: (Date | null)[] = [];
        for (let i = 0; i < startWeekday; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
        return cells;
    }, [view]);

    const selected = parseDate(value);
    const todayISO = toISO(new Date());

    function select(d: Date) {
        onChange(toISO(d));
        setOpen(false);
    }

    const display = selected
        ? selected.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : placeholder;

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="input flex items-center justify-between gap-2 text-left"
            >
                <span className={selected ? 'text-ink' : 'text-muted'}>{display}</span>
                <Icon name="calendar" size={16} className="text-muted" />
            </button>
            {open && (
                <div className="absolute left-0 z-60 mt-2 w-64 rounded-xl border border-line bg-panel p-3 shadow-lg">
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <button
                            type="button"
                            onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
                            className="btn-ghost px-2 py-1 text-xs"
                        >
                            ‹
                        </button>
                        <div className="flex flex-1 items-center justify-center gap-1">
                            <select
                                className="input px-1 py-0.5 text-xs"
                                value={view.getMonth()}
                                onChange={(e) => setView(new Date(view.getFullYear(), Number(e.target.value), 1))}
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i} value={i}>
                                        {new Date(2000, i, 1).toLocaleDateString('en-GB', { month: 'short' })}
                                    </option>
                                ))}
                            </select>
                            <select
                                className="input px-1 py-0.5 text-xs"
                                value={view.getFullYear()}
                                onChange={(e) => setView(new Date(Number(e.target.value), view.getMonth(), 1))}
                            >
                                {Array.from({ length: 151 }, (_, i) => 2000 + i).map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
                            className="btn-ghost px-2 py-1 text-xs"
                        >
                            ›
                        </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted">
                        {WEEKDAYS.map((w) => (
                            <span key={w} className="py-1">{w}</span>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((d, i) => {
                            if (!d) return <span key={i} />;
                            const iso = toISO(d);
                            const isSelected = selected && iso === toISO(selected);
                            const isToday = iso === todayISO;
                            return (
                                <button
                                    key={iso}
                                    type="button"
                                    onClick={() => select(d)}
                                    className={`rounded-lg py-1.5 text-xs transition ${
                                        isSelected
                                            ? 'bg-brand text-white'
                                            : isToday
                                              ? 'border border-brand text-brand-3'
                                              : 'hover:bg-panel-3'
                                    }`}
                                >
                                    {d.getDate()}
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-2 flex justify-between">
                        <button
                            type="button"
                            onClick={() => {
                                const t = new Date();
                                onChange(toISO(t));
                                setView(t);
                                setOpen(false);
                            }}
                            className="btn-ghost px-2 py-1 text-xs"
                        >
                            Today
                        </button>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="btn-ghost px-2 py-1 text-xs"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
