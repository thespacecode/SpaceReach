import { usePage } from '@inertiajs/react';
import { formatCurrency, formatDate, formatDateTime, getCurrencySymbol } from '@/lib/settings';

/**
 * Currency display component that reads settings from Inertia page props.
 * Usage: <Currency value={1000} /> => ₹1,000.00
 */
export function Currency({ value, className }) {
    const { props } = usePage();
    const settings = props.settings || {};
    return <span className={className}>{formatCurrency(value, settings)}</span>;
}

/**
 * Date display component that reads settings from Inertia page props.
 * Usage: <DateDisplay value="2026-08-14" /> => 14 Aug 2026
 */
export function DateDisplay({ value, className }) {
    const { props } = usePage();
    const settings = props.settings || {};
    return <span className={className}>{formatDate(value, settings)}</span>;
}

/**
 * DateTime display component.
 * Usage: <DateTimeDisplay value="2026-08-14T12:30:00" /> => 14 Aug 2026 12:30 PM
 */
export function DateTimeDisplay({ value, className }) {
    const { props } = usePage();
    const settings = props.settings || {};
    return <span className={className}>{formatDateTime(value, settings)}</span>;
}

/**
 * Hook: useSettings — quick access to portal settings.
 */
export function useSettings() {
    const { props } = usePage();
    return props.settings || {};
}

/**
 * Hook: useFormatters — returns bound format functions.
 */
export function useFormatters() {
    const settings = useSettings();
    return {
        currency: (v) => formatCurrency(v, settings),
        date: (v) => formatDate(v, settings),
        dateTime: (v) => formatDateTime(v, settings),
        currencySymbol: getCurrencySymbol(settings),
        settings,
    };
}
