import { useState, useEffect, createContext, useContext } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import Sidebar, { ENTERPRISE_ROLES } from '@/Components/Sidebar';
import CommandPalette from '@/Components/CommandPalette';
import NotificationCenter from '@/Components/NotificationCenter';
import { Button } from '@/Components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { cn } from '@/lib/utils';
import {
    Bell, Search, Settings, LogOut, ChevronDown, Plus, 
    UserCheck, HandCoins, Receipt, LayoutDashboard, ChevronRight, Menu, X, Shield,
    CheckSquare2, CheckCircle, FolderKanban, ShoppingBag, Wallet, UserPlus, Megaphone, Home
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';

const LayoutContext = createContext(null);

export function useLayoutConfig() {
    return useContext(LayoutContext);
}

export default function AppLayout({ children, title, breadcrumbs: customBreadcrumbs, headerActions }) {
    const parentLayout = useContext(LayoutContext);

    // If already inside the root persistent AppLayout shell, update configuration and render children directly
    if (parentLayout) {
        useEffect(() => {
            parentLayout.setConfig({ title, breadcrumbs: customBreadcrumbs, headerActions });
        }, [title, customBreadcrumbs, headerActions]);

        return <>{children}</>;
    }

    // Root Persistent Shell
    return (
        <AppLayoutInner title={title} customBreadcrumbs={customBreadcrumbs} headerActions={headerActions}>
            {children}
        </AppLayoutInner>
    );
}

function AppLayoutInner({ children, title: initialTitle, customBreadcrumbs: initialBreadcrumbs, headerActions: initialHeaderActions }) {
    const { props, url } = usePage();
    const user = props.auth?.user;
    const settings = props.settings || {};

    const [pageConfig, setPageConfig] = useState({
        title: initialTitle,
        breadcrumbs: initialBreadcrumbs,
        headerActions: initialHeaderActions
    });

    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        try {
            return localStorage.getItem('sidebar_collapsed') === 'true';
        } catch (e) {
            return false;
        }
    });

    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [activeRole, setActiveRole] = useState('ceo');
    const [commandOpen, setCommandOpen] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [notifOpen, setNotifOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarCollapsed(prev => {
            const next = !prev;
            try {
                localStorage.setItem('sidebar_collapsed', String(next));
            } catch (e) {}
            return next;
        });
    };

    // Keyboard shortcut for Command Palette (⌘K or Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setCommandOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Apply Live Branding Settings to DOM
    useEffect(() => {
        if (settings.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else if (settings.theme === 'light') {
            document.documentElement.classList.remove('dark');
        }

        const brandColor = settings.primaryBrandColor || settings.primary_color;
        if (brandColor && brandColor.startsWith('#')) {
            document.documentElement.style.setProperty('--primary', brandColor);
            document.documentElement.style.setProperty('--ring', brandColor);
        }
    }, [settings]);

    // Dynamic Breadcrumb Generator
    const getBreadcrumbs = () => {
        if (pageConfig.breadcrumbs && pageConfig.breadcrumbs.length > 0) {
            return pageConfig.breadcrumbs;
        }
        const path = url.split('?')[0];
        const segments = path.split('/').filter(Boolean);
        if (segments.length === 0 || segments[0] === 'dashboard') {
            return [{ label: 'Home', href: '/dashboard' }];
        }
        return segments.map((seg, idx) => ({
            label: seg.charAt(0).toUpperCase() + seg.slice(1).replace('-', ' '),
            href: '/' + segments.slice(0, idx + 1).join('/')
        }));
    };

    const breadcrumbs = getBreadcrumbs();
    const displayTitle = pageConfig.title;
    const displayHeaderActions = pageConfig.headerActions;

    const isDashboard = url === '/dashboard' || url === '/' || url.startsWith('/dashboard?');
    const activeRoleObj = ENTERPRISE_ROLES.find(r => r.id === activeRole) || ENTERPRISE_ROLES[0];

    return (
        <LayoutContext.Provider value={{ setConfig: setPageConfig }}>
            <div className="h-screen w-screen overflow-hidden flex bg-background text-foreground font-sans antialiased select-none">
                <Head title={displayTitle ? `${displayTitle} — AppLead` : 'AppLead Enterprise OS'} />

                {/* Desktop Fixed Sidebar */}
                <div className="hidden md:block">
                    <Sidebar
                        collapsed={sidebarCollapsed}
                        onToggle={toggleSidebar}
                        activeRole={activeRole}
                        onRoleChange={setActiveRole}
                        onOpenSearch={() => setCommandOpen(true)}
                        onOpenNotifications={() => setNotifOpen(true)}
                    />
                </div>

                {/* Mobile Responsive Overlay Drawer Navigation */}
                {mobileDrawerOpen && (
                    <div className="fixed inset-0 z-50 flex md:hidden">
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setMobileDrawerOpen(false)} />
                        <div className="relative flex flex-col w-72 max-w-[80vw] bg-sidebar border-r border-sidebar-border h-full shadow-2xl z-10">
                            <div className="p-3 border-b border-sidebar-border flex items-center justify-between">
                                <span className="text-xs font-bold text-foreground">Navigation Menu</span>
                                <button onClick={() => setMobileDrawerOpen(false)} className="p-1 rounded text-muted-foreground hover:text-foreground">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <Sidebar
                                    collapsed={false}
                                    onToggle={() => setMobileDrawerOpen(false)}
                                    activeRole={activeRole}
                                    onRoleChange={setActiveRole}
                                    onOpenSearch={() => { setMobileDrawerOpen(false); setCommandOpen(true); }}
                                    onOpenNotifications={() => { setMobileDrawerOpen(false); setNotifOpen(true); }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Shell with Scrollable Body */}
                <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-background">
                    {/* Mobile Only Header Bar for Menu Toggle */}
                    <div className="md:hidden h-12 px-4 border-b border-border bg-card flex items-center justify-between shrink-0">
                        <button
                            onClick={() => setMobileDrawerOpen(true)}
                            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                            <Menu className="w-4 h-4" />
                        </button>
                        <span className="font-extrabold text-xs text-foreground">AppLead</span>
                        <button
                            onClick={() => setCommandOpen(true)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
                        >
                            <Search className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Dynamic Modular Content View Container */}
                    <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
                        {displayHeaderActions && (
                            <div className="mb-4 flex items-center justify-end gap-2">
                                {displayHeaderActions}
                            </div>
                        )}

                        {/* Page Content Body */}
                        {children}
                    </main>
                </div>

                {/* Global Command Palette */}
                <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />

                {/* Global Notification Center */}
                <NotificationCenter open={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>
        </LayoutContext.Provider>
    );
}
