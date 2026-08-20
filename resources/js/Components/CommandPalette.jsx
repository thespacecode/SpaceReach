import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { 
    Search, Command, LayoutDashboard, BarChart3, Users, Contact, HandCoins, 
    Receipt, FileText, Bot, Settings, ShieldAlert, Sparkles, Plus, FileSpreadsheet, 
    ArrowRight, X, UserPlus, CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CommandPalette({ open, onClose }) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);

    const COMMAND_GROUPS = [
        {
            group: 'Navigation',
            items: [
                { label: 'Overview Dashboard', icon: LayoutDashboard, href: '/dashboard', shortcut: 'G D' },
                { label: 'Revenue Analytics', icon: BarChart3, href: '/analytics', shortcut: 'G A' },
                { label: 'Leads & Contacts', icon: Contact, href: '/contacts', shortcut: 'G C' },

                { label: 'Opportunity Pipeline', icon: HandCoins, href: '/opportunity', shortcut: 'G P' },
                { label: 'Proposals Management', icon: FileSpreadsheet, href: '/proposals', shortcut: 'G R' },
                { label: 'Financial Invoices', icon: Receipt, href: '/finance/invoices', shortcut: 'G F' },
                { label: 'System Settings', icon: Settings, href: '/settings', shortcut: 'G S' },
            ]
        },
        {
            group: 'Quick Actions',
            items: [
                { label: 'Create New Lead / Contact', icon: UserPlus, action: () => { onClose(); router.get('/contacts?action=create'); }, shortcut: 'C L' },
                { label: 'New Opportunity Entry', icon: Plus, action: () => { onClose(); router.get('/opportunity?action=create'); }, shortcut: 'C D' },
                { label: 'Create Financial Invoice', icon: CreditCard, action: () => { onClose(); router.get('/finance/invoices?action=create'); }, shortcut: 'C I' },
                { label: 'Generate AI Revenue Report', icon: FileSpreadsheet, action: () => { onClose(); router.get('/reports?action=generate'); }, shortcut: 'C R' },
            ]
        }
    ];

    const allItems = COMMAND_GROUPS.flatMap(g => g.items).filter(item => 
        item.label.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                if (open) onClose();
                else setQuery('');
            }
            if (!open) return;

            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % (allItems.length || 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + allItems.length) % (allItems.length || 1));
            } else if (e.key === 'Enter' && allItems[selectedIndex]) {
                e.preventDefault();
                executeItem(allItems[selectedIndex]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, selectedIndex, allItems]);

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setSelectedIndex(0);
        }
    }, [open]);

    const executeItem = (item) => {
        onClose();
        if (item.href) {
            router.get(item.href);
        } else if (item.action) {
            item.action();
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in" onClick={onClose}>
            <div 
                className="w-full max-w-xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col divide-y divide-border"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Header */}
                <div className="flex items-center px-4 py-3 gap-3">
                    <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type a command or search workspace..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        className="flex-1 bg-transparent text-sm text-foreground outline-hidden placeholder:text-muted-foreground font-medium"
                    />
                    <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                        ESC
                    </kbd>
                    <button 
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Command List */}
                <div className="max-h-80 overflow-y-auto p-2 divide-y divide-border/50">
                    {allItems.length === 0 ? (
                        <div className="py-8 text-center text-xs text-muted-foreground">
                            No commands matching "{query}"
                        </div>
                    ) : (
                        COMMAND_GROUPS.map((group) => {
                            const groupItems = group.items.filter(i => i.label.toLowerCase().includes(query.toLowerCase()));
                            if (groupItems.length === 0) return null;

                            return (
                                <div key={group.group} className="py-1">
                                    <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        {group.group}
                                    </div>
                                    {groupItems.map((item) => {
                                        const globalIdx = allItems.indexOf(item);
                                        const isSelected = globalIdx === selectedIndex;
                                        const Icon = item.icon;

                                        return (
                                            <button
                                                key={item.label}
                                                onClick={() => executeItem(item)}
                                                onMouseEnter={() => setSelectedIndex(globalIdx)}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left",
                                                    isSelected ? "bg-accent text-accent-foreground font-semibold" : "text-foreground hover:bg-muted"
                                                )}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <Icon className={cn("w-4 h-4", isSelected ? "text-primary-foreground font-bold" : "text-muted-foreground")} />
                                                    <span>{item.label}</span>
                                                </div>
                                                {item.shortcut && (
                                                    <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border">
                                                        {item.shortcut}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer hints */}
                <div className="px-4 py-2 bg-muted/30 flex items-center justify-between text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <span><kbd className="font-mono">↑↓</kbd> navigate</span>
                        <span><kbd className="font-mono">↵</kbd> select</span>
                    </div>
                    <span className="font-medium text-foreground">AppLead System</span>
                </div>
            </div>
        </div>
    );
}
