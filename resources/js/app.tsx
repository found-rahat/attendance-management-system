import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import type { ComponentType } from 'react';

import 'leaflet/dist/leaflet.css';

type ResolvedPage = { default: ComponentType<any> } | ComponentType<any>;

createInertiaApp({
    title: (title) => (title ? `${title} — Attendance` : 'Attendance'),
    resolve: (name) => {
        const pages = import.meta.glob<ResolvedPage>('./Pages/**/*.tsx', {
            eager: true,
        });
        return pages[`./Pages/${name}.tsx`];
    },
    setup({ el, App, props }) {
        if (!el) {
            return;
        }
        createRoot(el).render(<App {...props} />);
    },
});