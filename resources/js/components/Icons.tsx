import type { ReactNode, SVGProps } from 'react';

const ICONS: Record<string, ReactNode> = {
    home: (
        <>
            <path d="M3 11l9-8 9 8" />
            <path d="M5 10v10h5v-6h4v6h5V10" />
        </>
    ),
    dashboard: (
        <>
            <rect x="3" y="3" width="8" height="8" rx="2" />
            <rect x="13" y="3" width="8" height="5" rx="2" />
            <rect x="13" y="10" width="8" height="11" rx="2" />
            <rect x="3" y="13" width="8" height="8" rx="2" />
        </>
    ),
    eye: (
        <>
            <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
        </>
    ),
    screen: (
        <>
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M3 9h18" />
        </>
    ),
    track: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
        </>
    ),
    admin: (
        <>
            <circle cx="10" cy="8" r="4" />
            <path d="M3 21c0-4 3-7 7-7M16 17l2 2 4-4" />
        </>
    ),
    calendar: (
        <>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M8 3v4M16 3v4M3 10h18" />
        </>
    ),
    pay: (
        <>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="12" cy="12" r="3" />
        </>
    ),
    cloud: <path d="M7 18a4 4 0 010-8 5 5 0 019.6-1A4.5 4.5 0 0117 18z" />,
    pdf: (
        <>
            <path d="M6 3h8l5 5v13H6z" />
            <path d="M14 3v5h5M9 14h6M9 17h4" />
        </>
    ),
    clock: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </>
    ),
    userOk: (
        <>
            <circle cx="9" cy="8" r="4" />
            <path d="M2 21c0-4 3-7 7-7M15 15l2 2 4-4" />
        </>
    ),
    userX: (
        <>
            <circle cx="9" cy="8" r="4" />
            <path d="M2 21c0-4 3-7 7-7M16 15l5 5M21 15l-5 5" />
        </>
    ),
    users: (
        <>
            <circle cx="9" cy="8" r="3.5" />
            <path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6" />
            <path d="M16 4.5a3.5 3.5 0 010 7M21.5 20c0-2.7-1.7-4.9-4-5.7" />
        </>
    ),
    filter: <path d="M3 4h18l-7 9v6l-4 2v-8z" />,
    search: (
        <>
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-5-5" />
        </>
    ),
    chevron: <path d="M6 9l6 6 6-6" />,
    shield: (
        <>
            <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
            <path d="M9 12l2 2 4-4" />
        </>
    ),
    building: (
        <>
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01M10 21v-3h4v3" />
        </>
    ),
    card: (
        <>
            <rect x="2.5" y="5" width="19" height="14" rx="2" />
            <path d="M2.5 10h19" />
        </>
    ),
    mail: (
        <>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M4 7l8 6 8-6" />
        </>
    ),
    globe: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
        </>
    ),
    settings: (
        <>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1A1.7 1.7 0 008 19.4a1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H2a2 2 0 110-4h.1A1.7 1.7 0 004.6 8a1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.5V2a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.5 1H22a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
        </>
    ),
    logout: (
        <>
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <path d="M16 17l5-5-5-5M21 12H9" />
        </>
    ),
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    close: <path d="M6 6l12 12M18 6L6 18" />,
    location: (
        <>
            <path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z" />
            <circle cx="12" cy="10" r="2.5" />
        </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    trash: (
        <>
            <path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M6 7l1 13h10l1-13" />
        </>
    ),
    edit: (
        <>
            <path d="M4 20h4l10-10-4-4L4 16z" />
            <path d="M13.5 6.5l4 4" />
        </>
    ),
    download: (
        <>
            <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
        </>
    ),
    check: <path d="M5 12l4 4 10-10" />,
    sun: (
        <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </>
    ),
    moon: <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />,
};

export type IconName = keyof typeof ICONS;

export function Icon({
    name,
    size = 20,
    className,
    ...props
}: { name: string; size?: number; className?: string } & SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
            {...props}
        >
            {ICONS[name] ?? ICONS.dashboard}
        </svg>
    );
}
