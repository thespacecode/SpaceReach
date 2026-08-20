import { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/Components/ui/popover';
import {
    // Icons for TheSpaceCode OS
    LayoutDashboard, TrendingUp, Users, FolderKanban, Briefcase, Megaphone, Landmark,
    BarChart4, CheckCircle, CheckSquare, FileText, Bell, Settings, HelpCircle, LogOut,
    ChevronDown, ChevronUp, ChevronRight, ChevronsLeft, ChevronsRight, Building2,
    Target, LineChart, FileSpreadsheet, Contact2, HeartPulse, UserCheck, RotateCcw,
    LifeBuoy, MessageSquare, BarChart3, Clock, Cpu, Store, ShoppingBag, Wallet,
    UserPlus, Award, GraduationCap, Server, Waypoints, ShieldCheck, Sparkles,
    Calendar, CheckSquare2, FileCheck, Layers, Share2, Receipt, ArrowUpRight, Folder,
    Laptop, Palette, Bot, HelpCircle as HelpIcon, UserCheck2, Search
} from 'lucide-react';

export const MULTI_ENTITIES = [
    { id: 'global', name: 'TheSpaceCode HQ', region: 'Worldwide HQ', revenue: '₹4.8Cr ARR', flag: '🌐' },
    { id: 'tech', name: 'TheSpaceCode Tech & AI', region: 'SaaS & Software Unit', revenue: '₹2.9Cr ARR', flag: '⚡' },
    { id: 'creative', name: 'TheSpaceCode Creative', region: 'Branding & Growth', revenue: '₹1.9Cr ARR', flag: '🎨' },
];

/* ── TheSpaceCode Role Profiles ── */
export const ENTERPRISE_ROLES = [
    { id: 'ceo', label: 'CEO / Super Admin', subtitle: 'Complete Visibility & Control' },
    { id: 'manager', label: 'Manager / Lead', subtitle: 'Projects & Workload' },
    { id: 'account_manager', label: 'Account Manager', subtitle: 'Clients & Retainers' },
    { id: 'sales', label: 'Sales Executive', subtitle: 'Leads & Pipeline' },
    { id: 'developer', label: 'Developer / Engineer', subtitle: 'Code & Technical Work' },
    { id: 'designer', label: 'Designer / Creative', subtitle: 'Design & Assets' },
    { id: 'freelancer', label: 'External Contractor', subtitle: 'Assigned Work Only' },
    { id: 'client', label: 'Client Portal', subtitle: 'Project & Invoice Access' },
];

/* ── Primary Operating Modules for TheSpaceCode OS ── */
export const ENTERPRISE_MODULE_GROUPS = [
    {
        id: 'prospect_enrich',
        title: 'Prospect & Enrich',
        icon: Search,
        items: [
            { label: 'Leads', icon: UserPlus, href: '/leads' },
        ]
    },
    {
        id: 'opportunity_deals',
        title: 'Opportunity & Deals',
        icon: TrendingUp,
        items: [
            { label: 'Opportunity', icon: TrendingUp, href: '/opportunity' },
            { label: 'Proposals & Quotes', icon: FileSpreadsheet, href: '/proposals' },
        ]
    },
    {
        id: 'clients',
        title: 'Clients',
        icon: Users,
        items: [
            { label: 'Accounts', icon: Users, href: '/clients' },
            { label: 'Contacts', icon: Contact2, href: '/contacts' },
            { label: 'Client Portal', icon: UserCheck2, href: '/customers/portal' },
        ]
    },
    {
        id: 'work',
        title: 'Work',
        icon: Briefcase,
        items: [
            { label: 'Projects', icon: FolderKanban, href: '/operations/projects' },
            { label: 'Tasks', icon: CheckSquare2, href: '/operations/tasks' },
            { label: 'Deliverables', icon: Layers, href: '/operations/delivery' },
            { label: 'Calendar', icon: Calendar, href: '/leadership/calendar' },
        ]
    },
    {
        id: 'services',
        title: 'Services',
        icon: Laptop,
        items: [
            { label: 'Website & Development', icon: Code2Icon, href: '/services/web-dev' },
            { label: 'Marketing', icon: Megaphone, href: '/marketing/campaigns' },
            { label: 'Creative', icon: Palette, href: '/services/creative' },
            { label: 'AI & Automation', icon: Bot, href: '/services/ai' },
            { label: 'Consulting', icon: Sparkles, href: '/services/consulting' },
        ]
    },
    {
        id: 'people',
        title: 'People',
        icon: UserPlus,
        items: [
            { label: 'Internal Team', icon: Users, href: '/employees' },
            { label: 'Freelancers', icon: UserCheck, href: '/people/freelancers' },
            { label: 'Partners', icon: Waypoints, href: '/people/partners' },
            { label: 'Workload', icon: Cpu, href: '/operations/resources' },
        ]
    },
    {
        id: 'finance',
        title: 'Finance',
        icon: Landmark,
        items: [
            { label: 'Revenue', icon: Landmark, href: '/finance' },
            { label: 'Invoices', icon: Receipt, href: '/finance/invoices' },
            { label: 'Expenses', icon: Wallet, href: '/finance/expenses' },
            { label: 'Profitability', icon: LineChart, href: '/finance/ledger' },
        ]
    },
    {
        id: 'reports',
        title: 'Reports',
        icon: BarChart4,
        items: [
            { label: 'Company', icon: BarChart4, href: '/reports' },
            { label: 'Sales', icon: TrendingUp, href: '/reports/sales' },
            { label: 'Clients', icon: Users, href: '/reports/clients' },
            { label: 'Projects', icon: FolderKanban, href: '/reports/projects' },
            { label: 'Team', icon: Cpu, href: '/reports/team' },
        ]
    },
    {
        id: 'approvals',
        title: 'Approvals',
        icon: CheckCircle,
        badge: 4,
        items: [
            { label: 'Deliverables', icon: Layers, href: '/procurement/requests?type=deliverable' },
            { label: 'Design & Creative', icon: Palette, href: '/procurement/requests?type=design' },
            { label: 'Proposals', icon: FileSpreadsheet, href: '/procurement/requests?type=proposal' },
            { label: 'Expenses', icon: Wallet, href: '/procurement/requests?type=expense' },
        ]
    }
];

function Code2Icon(props) {
    return <Server {...props} />;
}

export default function Sidebar({ collapsed, onToggle, activeRole = 'ceo', onRoleChange, onOpenSearch, onOpenNotifications }) {
    const { url, props } = usePage();
    const user = props.auth?.user;
    const settings = props.settings || {};

    const [expandedGroups, setExpandedGroups] = useState({});

    // Auto-expand the active parent group on URL change
    useEffect(() => {
        ENTERPRISE_MODULE_GROUPS.forEach(module => {
            const hasActiveChild = module.items.some(item =>
                url === item.href || (item.href !== '/dashboard' && url.startsWith(item.href))
            );
            if (hasActiveChild) {
                setExpandedGroups(prev => ({ ...prev, [module.id]: true }));
            }
        });
    }, [url]);

    const toggleGroup = (id) => {
        setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const getFaviconUrl = (url) => {
        if (!url) return null;
        try {
            const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
            return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;
        } catch {
            return `https://www.google.com/s2/favicons?domain=${url.replace(/^https?:\/\//i, '').split('/')[0]}&sz=64`;
        }
    };

    const getCompanyInitials = (name) => {
        if (!name) return 'CO';
        const words = name.trim().replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter(Boolean);
        if (words.length >= 2) {
            return `${words[0][0]}${words[1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const companyWebsite = settings.company_website || settings.website || null;
    const faviconUrl = getFaviconUrl(companyWebsite) || settings.workspaceLogo || settings.logo_url || null;
    const appName = settings.company_name || settings.workspaceName || settings.companyName || 'TheSpaceCode';

    const renderNavItem = (item, isNested = true) => {
        const Icon = item.icon;
        const isActive = url === item.href || (item.href !== '/dashboard' && url.startsWith(item.href));

        return (
            <Link
                key={item.label}
                href={item.href}
                className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-1 rounded-md text-[13px] leading-relaxed font-normal transition-all group relative",
                    isNested ? "pl-[35px]" : "",
                    isActive
                        ? "bg-[#EDEDED] text-[#000] font-semibold"
                        : "text-[#535347] hover:bg-[#EDEDED]/50 hover:text-[#000]"
                )}
            >
                {!isNested && Icon && (
                    <Icon className={cn("w-[17px] h-[17px] shrink-0 transition-colors", isActive ? "text-[#000] font-semibold" : "text-[#535347] group-hover:text-[#000]")} />
                )}
                {!collapsed && (
                    <span className="truncate flex-1 tracking-normal">{item.label}</span>
                )}
            </Link>
        );
    };

    return (
        <TooltipProvider delayDuration={150}>
            <aside
                className={cn(
                    "relative flex flex-col h-screen sticky top-0 bg-white dark:bg-card border-r border-sidebar-border transition-all duration-300 z-30 select-none shrink-0 font-sans",
                    collapsed ? "w-16" : "w-[240px]"
                )}
                style={{ backgroundColor: '#ffffff' }}
            >
                {/* ── 1. AUTOMATED WORKSPACE BRAND HEADER WITH DROPDOWN MENU & SEARCH ── */}
                <div className="h-14 pl-2.5 pr-1.5 flex items-center justify-between shrink-0 bg-white dark:bg-card border-b border-sidebar-border/40 gap-1">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 overflow-hidden py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-1.5 rounded-lg transition-colors cursor-pointer outline-hidden text-left min-w-0 flex-1 group">
                                <div className="w-5.5 h-5.5 rounded-[4px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold text-[10px] flex items-center justify-center shrink-0 overflow-hidden relative border border-indigo-200 dark:border-indigo-800/60 shadow-2xs">
                                    {faviconUrl ? (
                                        <img
                                            src={faviconUrl}
                                            alt={appName}
                                            className="w-5.5 h-5.5 object-contain rounded-[4px]"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div className={`items-center justify-center w-full h-full font-bold text-[9px] uppercase ${faviconUrl ? 'hidden' : 'flex'}`}>
                                        {getCompanyInitials(appName)}
                                    </div>
                                </div>

                                {!collapsed && appName ? (
                                    <div className="flex items-center gap-1 min-w-0 flex-1">
                                        <span className="text-[13px] font-normal tracking-tight text-[#000] dark:text-foreground truncate">
                                            {appName}
                                        </span>
                                        <ChevronDown className="w-3.5 h-3.5 text-[#535347] dark:text-muted-foreground group-hover:text-black dark:group-hover:text-foreground shrink-0 transition-colors" />
                                    </div>
                                ) : (
                                    <ChevronDown className="w-3 h-3 text-[#535347] dark:text-muted-foreground group-hover:text-black dark:group-hover:text-foreground shrink-0 transition-colors" />
                                )}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 text-xs shadow-xl z-50">
                            <DropdownMenuLabel className="font-bold text-foreground flex items-center gap-2">
                                <Avatar className="w-6 h-6 border border-border">
                                    <AvatarImage src={user?.avatar} />
                                    <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                                        {user?.name ? user.name.slice(0, 2).toUpperCase() : 'EX'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col min-w-0">
                                    <span className="truncate leading-tight font-bold">{user?.name || 'Executive User'}</span>
                                    <span className="text-[10px] font-mono font-normal text-muted-foreground truncate">{user?.email || 'admin@company.com'}</span>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            {/* Notifications Item */}
                            <DropdownMenuItem onClick={onOpenNotifications || (() => router.get('/notifications'))} className="cursor-pointer font-medium">
                                <Bell className="w-3.5 h-3.5 mr-2 text-blue-500" />
                                <span className="flex-1">Notifications</span>
                                <span className="px-1.5 py-0.2 rounded-full bg-blue-500/15 text-blue-600 font-mono text-[10px] font-bold">4</span>
                            </DropdownMenuItem>

                            {/* Admin Settings Item */}
                            <DropdownMenuItem onClick={() => router.get('/settings')} className="cursor-pointer font-medium">
                                <Settings className="w-3.5 h-3.5 mr-2 text-indigo-500" />
                                <span className="flex-1">Admin Settings</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {/* Sign Out Item */}
                            <DropdownMenuItem onClick={() => router.post('/logout')} className="cursor-pointer font-medium text-destructive focus:text-destructive">
                                <LogOut className="w-3.5 h-3.5 mr-2" />
                                <span>Sign Out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Right Action Icons: Search Icon + Collapse Icon (moved bit right) */}
                    <div className="flex items-center gap-0.5 shrink-0 ml-auto">
                        {/* Search Icon (opens search popup) */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    onClick={onOpenSearch}
                                    className="p-1.5 rounded-lg text-[#535347] hover:text-[#000] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                                >
                                    <Search className="w-4 h-4" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs font-semibold">
                                Search (⌘K)
                            </TooltipContent>
                        </Tooltip>

                        {/* Sidebar Collapse Toggle (positioned bit right) */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    onClick={onToggle}
                                    className="p-1.5 rounded-lg text-[#535347] hover:text-[#000] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0 cursor-pointer"
                                >
                                    {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs font-semibold">
                                {collapsed ? "Expand sidebar" : "Collapse sidebar"}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                {/* ── 2. MAIN NAVIGATION ACCORDION MODULES ── */}
                <ScrollArea className="flex-1 px-2.5 py-2 bg-white dark:bg-card">
                    <div className="space-y-1">
                        {/* ── 1ST NAVIGATION LINK: DASHBOARD ── */}
                        <div>
                            {!collapsed ? (
                                <Link
                                    href="/dashboard"
                                    className={cn(
                                        "flex items-center gap-2.5 px-2.5 py-1 rounded-md text-[13px] leading-relaxed font-normal transition-all group",
                                        url === '/dashboard' || url === '/'
                                            ? "bg-[#EDEDED] text-[#000] font-semibold"
                                            : "text-[#535347] hover:bg-[#EDEDED]/50 hover:text-[#000]"
                                    )}
                                >
                                    <LayoutDashboard className={cn("w-[17px] h-[17px] shrink-0 transition-colors", (url === '/dashboard' || url === '/') ? "text-[#000] font-semibold" : "text-[#535347] group-hover:text-[#000]")} />
                                    <span className="truncate flex-1 tracking-normal">Dashboard</span>
                                </Link>
                            ) : (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href="/dashboard"
                                            className={cn(
                                                "flex items-center justify-center p-1.5 rounded-lg transition-colors",
                                                (url === '/dashboard' || url === '/')
                                                    ? "bg-[#EDEDED] text-[#000] font-semibold"
                                                    : "text-[#535347] hover:bg-[#EDEDED]/50 hover:text-[#000]"
                                            )}
                                        >
                                            <LayoutDashboard className="w-[17px] h-[17px]" />
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="font-semibold text-[13px]">
                                        Dashboard
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>

                        {/* ── PRIMARY OPERATING MODULE GROUPS ── */}
                        {ENTERPRISE_MODULE_GROUPS.map((module) => {
                            const ModuleIcon = module.icon;
                            const isExpanded = expandedGroups[module.id];

                            if (collapsed) {
                                return (
                                    <Popover key={module.id}>
                                        <PopoverTrigger asChild>
                                            <button className="w-full flex items-center justify-center p-1.5 rounded-lg text-[#535347] hover:bg-sidebar-accent hover:text-[#000] transition-colors group relative">
                                                <ModuleIcon className="w-[17px] h-[17px] text-[#535347] group-hover:text-[#000]" />
                                                {module.badge && (
                                                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500" />
                                                )}
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent side="right" className="w-56 p-2 text-[13px] bg-white dark:bg-card border-sidebar-border shadow-xl">
                                            <div className="px-2 py-1 text-[13px] font-normal text-[#535347] border-b border-border/40 mb-1 flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <ModuleIcon className="w-[17px] h-[17px] text-[#535347]" />
                                                    <span>{module.title}</span>
                                                </div>
                                                {module.badge && (
                                                    <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-blue-500/10 text-blue-600 font-mono font-bold">
                                                        {module.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-0.5">
                                                {module.items.map((item) => renderNavItem(item, false))}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                );
                            }

                            return (
                                <div key={module.id} className="space-y-0.5">
                                    <button
                                        onClick={() => toggleGroup(module.id)}
                                        className="w-full flex items-center justify-between px-2.5 py-1 rounded-md text-[13px] leading-relaxed font-normal text-[#535347] hover:text-[#000] hover:bg-[#F6F6F6] transition-colors group"
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <ModuleIcon className="w-[17px] h-[17px] text-[#535347] group-hover:text-[#000]" />
                                            <span>{module.title}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {module.badge && (
                                                <span className="px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-600 font-mono text-[10px] font-bold">
                                                    {module.badge}
                                                </span>
                                            )}
                                            {isExpanded ? (
                                                <ChevronUp className="w-4 h-4 text-[#535347] group-hover:text-[#000]" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-[#535347] group-hover:text-[#000]" />
                                            )}
                                        </div>
                                    </button>

                                    {isExpanded && (
                                        <div className="space-y-0.5 animate-in fade-in-50 duration-150">
                                            {module.items.map((item) => renderNavItem(item))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* ── SECONDARY DIVIDER & MY WORK / NOTIFICATIONS / DOCUMENTS ── */}
                        <div className="pt-1.5 border-t border-sidebar-border space-y-0.5">
                            {/* My Work */}
                            <Link
                                href="/operations/tasks?filter=my_work"
                                className={cn(
                                    "flex items-center gap-2.5 px-2.5 py-1 rounded-md text-[13px] leading-relaxed font-normal transition-all group",
                                    url.includes('filter=my_work')
                                        ? "bg-[#EDEDED] text-[#000] font-semibold"
                                        : "text-[#535347] hover:bg-[#EDEDED]/50 hover:text-[#000]"
                                )}
                            >
                                <CheckSquare2 className={cn("w-[17px] h-[17px] shrink-0 transition-colors", url.includes('filter=my_work') ? "text-[#000] font-semibold" : "text-[#535347] group-hover:text-[#000]")} />
                                {!collapsed && <span className="truncate flex-1 tracking-normal">My Work</span>}
                            </Link>

                            {/* Notifications */}
                            <Link
                                href="/notifications"
                                className={cn(
                                    "flex items-center gap-2.5 px-2.5 py-1 rounded-md text-[13px] leading-relaxed font-normal transition-all group",
                                    url.startsWith('/notifications')
                                        ? "bg-[#EDEDED] text-[#000] font-semibold"
                                        : "text-[#535347] hover:bg-[#EDEDED]/50 hover:text-[#000]"
                                )}
                            >
                                <Bell className={cn("w-[17px] h-[17px] shrink-0 transition-colors", url.startsWith('/notifications') ? "text-[#000] font-semibold" : "text-[#535347] group-hover:text-[#000]")} />
                                {!collapsed && (
                                    <>
                                        <span className="truncate flex-1 tracking-normal">Notifications</span>
                                        <span className="px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-600 font-mono text-[10px] font-bold">
                                            3
                                        </span>
                                    </>
                                )}
                            </Link>

                            {/* Documents */}
                            <Link
                                href="/governance/legal"
                                className={cn(
                                    "flex items-center gap-2.5 px-2.5 py-1 rounded-md text-[13px] leading-relaxed font-normal transition-all group",
                                    url.startsWith('/governance/legal')
                                        ? "bg-[#EDEDED] text-[#000] font-semibold"
                                        : "text-[#535347] hover:bg-[#EDEDED]/50 hover:text-[#000]"
                                )}
                            >
                                <Folder className={cn("w-[17px] h-[17px] shrink-0 transition-colors", url.startsWith('/governance/legal') ? "text-[#000] font-semibold" : "text-[#535347] group-hover:text-[#000]")} />
                                {!collapsed && <span className="truncate flex-1 tracking-normal">Documents</span>}
                            </Link>
                        </div>
                    </div>
                </ScrollArea>
            </aside>
        </TooltipProvider>
    );
}
