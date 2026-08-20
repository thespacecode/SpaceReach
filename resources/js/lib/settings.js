/**
 * Portal Settings Helpers
 * Use these helpers everywhere in the frontend to respect portal settings.
 */

/**
 * Format a currency value using portal settings.
 * @param {number} amount
 * @param {object} settings - props.settings from usePage()
 * @returns {string}
 */
export function formatCurrency(amount, settings = {}) {
    const currency = settings.currency || 'INR';
    const position = settings.currency_position || 'before';
    const numberFormat = settings.number_format || 'indian';

    const symbols = {
        INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ',
        SGD: 'S$', AUD: 'A$', CAD: 'C$', JPY: '¥',
    };
    const symbol = symbols[currency] || currency;

    let formatted;
    const num = Number(amount || 0);

    if (numberFormat === 'indian') {
        formatted = num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (numberFormat === 'european') {
        formatted = num.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
        formatted = num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    return position === 'after' ? `${formatted}${symbol}` : `${symbol}${formatted}`;
}

/**
 * Format a date string using portal settings.
 * @param {string|Date} dateStr
 * @param {object} settings - props.settings from usePage()
 * @returns {string}
 */
export function formatDate(dateStr, settings = {}) {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';

    const format = settings.date_format || 'd M Y';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const d = date.getDate();
    const dd = String(d).padStart(2, '0');
    const m = date.getMonth() + 1;
    const mm = String(m).padStart(2, '0');
    const M = months[date.getMonth()];
    const F = monthsFull[date.getMonth()];
    const Y = date.getFullYear();
    const yy = String(Y).slice(-2);

    switch (format) {
        case 'Y-m-d': return `${Y}-${mm}-${dd}`;
        case 'm/d/Y': return `${mm}/${dd}/${Y}`;
        case 'd/m/Y': return `${dd}/${mm}/${Y}`;
        case 'M d, Y': return `${M} ${d}, ${Y}`;
        case 'd M Y':
        default: return `${d} ${M} ${Y}`;
    }
}

/**
 * Format a time string using portal settings.
 * @param {string|Date} dateStr
 * @param {object} settings
 * @returns {string}
 */
export function formatTime(dateStr, settings = {}) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';

    const timeFormat = settings.time_format || '12h';
    if (timeFormat === '24h') {
        return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

/**
 * Format a date + time string.
 */
export function formatDateTime(dateStr, settings = {}) {
    if (!dateStr) return '—';
    return `${formatDate(dateStr, settings)} ${formatTime(dateStr, settings)}`.trim();
}

/**
 * Get the currency symbol for the portal.
 */
export function getCurrencySymbol(settings = {}) {
    const currency = settings.currency || 'INR';
    const symbols = {
        INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ',
        SGD: 'S$', AUD: 'A$', CAD: 'C$', JPY: '¥',
    };
    return symbols[currency] || currency;
}
