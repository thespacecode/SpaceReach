import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import AppLayout from './Layouts/AppLayout';
import '../css/app.css';

createInertiaApp({
    title: (title) => title ? `${title} — AppLead` : 'AppLead Enterprise OS',
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        const pageMod = pages[`./Pages/${name}.jsx`];
        const page = pageMod ? (pageMod.default || pageMod) : null;
        if (page && !page.layout && !name.startsWith('Auth/')) {
            page.layout = (pageContent) => <AppLayout>{pageContent}</AppLayout>;
        }
        return page;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#6366f1',
        showSpinner: false,
    },
});
