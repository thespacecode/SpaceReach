import { useState, useMemo, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { usePage, router } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import {
    User, Settings as SettingsIcon, Bell, Lock, Globe, Palette, Plug, 
    Building2, Users as UsersIcon, Shield, CreditCard, Cpu, Database, 
    FileText, AlertTriangle, Search, Check, Save, Plus, Trash2, Key, 
    RefreshCw, Send, CheckCircle2, X, Laptop, Smartphone, Zap, Download, Upload, Copy
} from 'lucide-react';

// Essential Settings Navigation Structure
const SETTINGS_CATEGORIES = [
    {
        group: 'ACCOUNT',
        items: [
            { id: 'profile', label: 'Profile', icon: User, desc: 'Personal information, avatar, and account identity' },
            { id: 'preferences', label: 'Preferences', icon: Globe, desc: 'Regional formats, timezone, and default density' },
            { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Email digests, push, and in-app alerts' },
            { id: 'security', label: 'Security & Sessions', icon: Lock, desc: 'Password, 2FA, and active device sessions' },
        ]
    },
    {
        group: 'WORKSPACE',
        items: [
            { id: 'general', label: 'General', icon: SettingsIcon, desc: 'Workspace name, URL slug, and domain' },
            { id: 'members', label: 'Members & Roles', icon: UsersIcon, desc: 'Team members, roles, and invitations' },
            { id: 'branding', label: 'Branding', icon: Building2, desc: 'Logos, favicon, and brand color palette' },
            { id: 'billing', label: 'Billing & Usage', icon: CreditCard, desc: 'Plan telemetry, usage limits, and invoices' },
        ]
    },
    {
        group: 'PRODUCT',
        items: [
            { id: 'appearance', label: 'Appearance', icon: Palette, desc: 'Theme modes, display density, and motion' },
            { id: 'integrations', label: 'Integrations & GA4', icon: Plug, desc: 'Google Analytics (GTM-N783921) & integrations' },
            { id: 'data', label: 'Data & Backup', icon: Database, desc: 'Data import, export, backup, and retention' },
        ]
    },
    {
        group: 'DEVELOPER',
        items: [
            { id: 'api', label: 'API Keys', icon: Key, desc: 'REST API tokens and developer credentials' },
            { id: 'webhooks', label: 'Webhooks', icon: Cpu, desc: 'Real-time event payload listeners' },
            { id: 'audit', label: 'Audit Logs', icon: FileText, desc: 'Enterprise security audit trail' },
        ]
    },
    {
        group: 'ADVANCED',
        items: [
            { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, desc: 'Workspace transfer and permanent deletion' },
        ]
    }
];

// Helper Toggle Switch Component
function ToggleSwitch({ checked, onChange, label, disabled = false }) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-hidden",
                checked ? "bg-foreground" : "bg-muted",
                disabled && "opacity-50 cursor-not-allowed"
            )}
        >
            <span
                className={cn(
                    "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow-xs ring-0 transition duration-200 ease-in-out",
                    checked ? "translate-x-4" : "translate-x-0"
                )}
            />
        </button>
    );
}

// Reusable Setting Field Component
function SettingField({ label, description, children, inline = false }) {
    return (
        <div className={cn("py-3.5 first:pt-0 last:pb-0 border-b border-border/40 last:border-b-0", inline ? "flex items-center justify-between gap-4" : "grid grid-cols-1 md:grid-cols-3 gap-3 items-start")}>
            <div>
                <label className="text-xs font-semibold text-foreground">{label}</label>
                {description && <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{description}</p>}
            </div>
            <div className={cn(inline ? "" : "md:col-span-2")}>
                {children}
            </div>
        </div>
    );
}

export default function Settings({ settings: initialSettings, auth }) {
    const { props } = usePage();
    const currentUser = auth?.user || props.auth?.user || {};
    const globalSettings = props.settings || initialSettings || {};

    const [activeCategory, setActiveCategory] = useState(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            return params.get('tab') || 'profile';
        } catch (e) {
            return 'profile';
        }
    });

    const handleTabChange = (tabId) => {
        setActiveCategory(tabId);
        try {
            const url = new URL(window.location.href);
            url.searchParams.set('tab', tabId);
            window.history.replaceState({ path: url.toString() }, '', url.toString());
        } catch (e) {}
    };

    useEffect(() => {
        const syncTabFromUrl = () => {
            const params = new URLSearchParams(window.location.search);
            const tab = params.get('tab');
            if (tab) {
                setActiveCategory(tab);
            }
        };

        window.addEventListener('popstate', syncTabFromUrl);
        return () => window.removeEventListener('popstate', syncTabFromUrl);
    }, []);

    const [searchQuery, setSearchQuery] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [saveSuccessToast, setSaveSuccessToast] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(currentUser.avatar_url || globalSettings.avatar || null);
    const [brandLogoPreview, setBrandLogoPreview] = useState(globalSettings.workspaceLogo || globalSettings.logo_url || null);


    // State for setting inputs with live database sync
    const [formData, setFormData] = useState({
        // Profile
        name: currentUser.name || globalSettings.name || 'Gourav Mohanty',
        email: currentUser.email || globalSettings.email || 'gourav@applead.io',
        company_name: globalSettings.company_name || globalSettings.workspaceName || 'Thespacecode App',
        company_website: globalSettings.company_website || globalSettings.website || 'https://thespacecode.com',
        jobTitle: globalSettings.jobTitle || 'Head of Revenue Operations',
        phone: globalSettings.phone || '+1 (555) 234-8900',
        bio: globalSettings.bio || 'Managing enterprise lead acquisition & revenue telemetry for AppLead OS.',
        location: globalSettings.location || 'Bhubaneswar, India',

        // Preferences
        language: globalSettings.language || 'en-US',
        timeZone: globalSettings.timeZone || 'Asia/Kolkata',
        dateFormat: globalSettings.dateFormat || 'DD/MM/YYYY',
        currency: globalSettings.currency || 'USD ($)',
        defaultLanding: globalSettings.defaultLanding || '/dashboard',
        tableDensity: globalSettings.tableDensity || 'compact',

        // Appearance
        theme: globalSettings.theme || 'light',
        reducedMotion: globalSettings.reducedMotion === 'true' || globalSettings.reducedMotion === true,

        // Notifications
        inAppImportant: globalSettings.inAppImportant !== 'false',
        inAppMentions: globalSettings.inAppMentions !== 'false',
        emailDailyDigest: globalSettings.emailDailyDigest !== 'false',
        emailWeeklyReport: globalSettings.emailWeeklyReport !== 'false',

        // Workspace & Branding
        workspaceName: globalSettings.workspaceName !== undefined ? globalSettings.workspaceName : (globalSettings.company_name || 'Thespacecode App'),
        workspaceLogo: globalSettings.workspaceLogo || globalSettings.logo_url || null,
        logoWidth: globalSettings.logoWidth || 120,
        workspaceSlug: globalSettings.workspaceSlug || 'applead-enterprise',
        customDomain: globalSettings.customDomain || 'telemetry.applead.io',
        primaryBrandColor: globalSettings.primaryBrandColor || globalSettings.primary_color || '#EAF212',



        // Webhooks & Integrations
        webhookUrl: globalSettings.webhookUrl || 'https://api.applead.io/v1/telemetry-hook',
        webhookSecret: globalSettings.webhookSecret || 'whsec_982348923489238492834',

        // Google Analytics 4 & Tag Manager Integration
        gaMeasurementId: globalSettings.gaMeasurementId || 'G-8923489234',
        gtmContainerId: globalSettings.gtmContainerId || 'GTM-N783921',
        gaApiSecret: globalSettings.gaApiSecret || 'sec_ga4_live_8923',
        gaEnabled: globalSettings.gaEnabled !== 'false',

        // Microsoft Clarity & Bing Search Tag Integration
        msClarityId: globalSettings.msClarityId || 'MS-8923419',
        msUetTagId: globalSettings.msUetTagId || 'MS-UET-90234',
        msEnabled: globalSettings.msEnabled !== 'false',
    });


    const updateField = (key, val) => {
        setFormData(prev => ({ ...prev, [key]: val }));
        setHasUnsavedChanges(true);
    };

    const handleSaveChanges = () => {
        router.post('/settings', formData, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setHasUnsavedChanges(false);
                setSaveSuccessToast(true);
                setTimeout(() => setSaveSuccessToast(false), 3000);
            }
        });
    };

    const handleDiscardChanges = () => {
        setHasUnsavedChanges(false);
    };

    // Filter categories via search query
    const filteredCategories = useMemo(() => {
        if (!searchQuery) return SETTINGS_CATEGORIES;
        const q = searchQuery.toLowerCase();

        return SETTINGS_CATEGORIES.map(group => ({
            ...group,
            items: group.items.filter(i => 
                i.label.toLowerCase().includes(q) || 
                i.desc.toLowerCase().includes(q) ||
                group.group.toLowerCase().includes(q)
            )
        })).filter(g => g.items.length > 0);
    }, [searchQuery]);

    // Active Category Descriptor
    const activeMeta = useMemo(() => {
        for (const g of SETTINGS_CATEGORIES) {
            const found = g.items.find(i => i.id === activeCategory);
            if (found) return found;
        }
        return SETTINGS_CATEGORIES[0].items[0];
    }, [activeCategory]);

    return (
        <AppLayout title="System Settings">
            <div className="max-w-7xl mx-auto space-y-5 animate-fade-in relative pb-16">
                {/* Settings Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-border">
                    <div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-0.5">
                            <span>Settings</span>
                            <span>/</span>
                            <span className="font-semibold text-foreground">{activeMeta.label}</span>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">{activeMeta.label}</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">{activeMeta.desc}</p>
                    </div>

                    {/* Global Settings Search Input */}
                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search settings (e.g. GA4, 2FA, Billing)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-8 py-1.5 bg-card border border-border rounded-lg text-xs font-medium text-foreground outline-hidden focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Two-Column Settings Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    {/* Fixed Sidebar Navigation */}
                    <div className="md:col-span-3 bg-card border border-border rounded-xl p-2 space-y-4 shadow-xs">
                        {filteredCategories.length === 0 ? (
                            <div className="py-6 text-center text-xs text-muted-foreground">
                                No settings found matching "{searchQuery}"
                            </div>
                        ) : (
                            filteredCategories.map((group) => (
                                <div key={group.group} className="space-y-1">
                                    <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                        {group.group}
                                    </div>
                                    {group.items.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = activeCategory === item.id;

                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => handleTabChange(item.id)}
                                                className={cn(
                                                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors text-left group",
                                                    isActive 
                                                        ? "bg-foreground text-background font-semibold shadow-xs" 
                                                        : "text-foreground hover:bg-muted"
                                                )}
                                            >
                                                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-background" : "text-muted-foreground group-hover:text-foreground")} />
                                                <span className="truncate flex-1">{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Content Section Panel */}
                    <div className="md:col-span-9 space-y-5">
                        {/* 1. PROFILE */}
                        {activeCategory === 'profile' && (
                            <Card className="shadow-xs border-border">
                                <CardHeader className="pb-3 border-b border-border/60">
                                    <CardTitle className="text-sm font-bold text-foreground">Personal Profile & Identity</CardTitle>
                                    <CardDescription className="text-xs text-muted-foreground">Manage your avatar, personal contact details, and account metadata.</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4 text-xs">
                                    {/* Profile Avatar (Auto-fetched from Company Website Favicon) */}
                                    <SettingField label="Profile Avatar / Logo" description="Auto-fetched from Company Website favicon URL or custom upload.">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-[4px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs flex items-center justify-center border border-indigo-200 dark:border-indigo-800 shrink-0 overflow-hidden relative shadow-2xs">
                                                {formData.company_website ? (
                                                    <img
                                                        src={`https://www.google.com/s2/favicons?domain=${formData.company_website.replace(/^https?:\/\//i, '').split('/')[0]}&sz=64`}
                                                        alt={formData.company_name}
                                                        className="w-full h-full object-contain rounded-[4px]"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                ) : null}
                                                <div className={`items-center justify-center w-full h-full font-bold text-xs uppercase ${formData.company_website ? 'hidden' : 'flex'}`}>
                                                    {(formData.company_name || 'CO').slice(0, 2).toUpperCase()}
                                                </div>
                                            </div>
                                            <div className="text-xs space-y-0.5">
                                                <span className="font-bold text-foreground block">Favicon Logo Avatar</span>
                                                <span className="text-[11px] text-muted-foreground block font-mono">
                                                    {formData.company_website || 'Enter website URL below'}
                                                </span>
                                            </div>
                                        </div>
                                    </SettingField>

                                    <SettingField label="Company Name" description="Displayed next to the logo across the entire application portal.">
                                        <Input 
                                            value={formData.company_name} 
                                            onChange={(e) => {
                                                updateField('company_name', e.target.value);
                                                updateField('workspaceName', e.target.value);
                                            }} 
                                            className="h-9 text-xs font-bold" 
                                            placeholder="e.g. TheSpaceCode" 
                                        />
                                    </SettingField>

                                    <SettingField label="Company Website" description="Website URL used to auto-fetch the logo favicon icon.">
                                        <Input 
                                            value={formData.company_website} 
                                            onChange={(e) => {
                                                updateField('company_website', e.target.value);
                                                updateField('website', e.target.value);
                                            }} 
                                            className="h-9 text-xs font-mono" 
                                            placeholder="https://thespacecode.com" 
                                        />
                                    </SettingField>

                                    <SettingField label="Full Name" description="Your display name visible across team workspaces.">
                                        <Input value={formData.name} onChange={(e) => updateField('name', e.target.value)} className="h-9 text-xs font-semibold" />
                                    </SettingField>

                                    <SettingField label="Email Address" description="Primary email address used for login and notifications.">
                                        <Input value={formData.email} onChange={(e) => updateField('email', e.target.value)} className="h-9 text-xs font-mono" />
                                    </SettingField>

                                    <SettingField label="Job Title / Role">
                                        <Input value={formData.jobTitle} onChange={(e) => updateField('jobTitle', e.target.value)} className="h-9 text-xs" />
                                    </SettingField>

                                    <SettingField label="Phone Number">
                                        <Input value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} className="h-9 text-xs font-mono" />
                                    </SettingField>

                                    <SettingField label="Personal Bio" description="Short background summary.">
                                        <textarea
                                            rows={3}
                                            value={formData.bio}
                                            onChange={(e) => updateField('bio', e.target.value)}
                                            className="w-full p-2.5 bg-background border border-border rounded-lg text-xs font-medium outline-hidden focus:ring-1 focus:ring-ring"
                                        />
                                    </SettingField>

                                    <SettingField label="Location">
                                        <Input value={formData.location} onChange={(e) => updateField('location', e.target.value)} className="h-9 text-xs" />
                                    </SettingField>

                                    <SettingField label="Account Identity Metadata">
                                        <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                                            <div className="p-2.5 border border-border rounded-lg bg-muted/20">
                                                <span className="text-[10px] text-muted-foreground block font-sans">Account ID</span>
                                                <span className="font-bold text-foreground">USR-{currentUser.id || '89234'}</span>
                                            </div>
                                            <div className="p-2.5 border border-border rounded-lg bg-muted/20">
                                                <span className="text-[10px] text-muted-foreground block font-sans">Member Since</span>
                                                <span className="font-bold text-foreground font-sans">Aug 2026</span>
                                            </div>
                                            <div className="p-2.5 border border-border rounded-lg bg-muted/20">
                                                <span className="text-[10px] text-muted-foreground block font-sans">Role Level</span>
                                                <span className="font-bold text-emerald-600 font-sans">Active Owner</span>
                                            </div>
                                        </div>
                                    </SettingField>
                                </CardContent>
                            </Card>
                        )}


                        {/* 2. PREFERENCES */}
                        {activeCategory === 'preferences' && (
                            <Card className="shadow-xs border-border">
                                <CardHeader className="pb-3 border-b border-border/60">
                                    <CardTitle className="text-sm font-bold text-foreground">Regional Formats & Default Behavior</CardTitle>
                                    <CardDescription className="text-xs text-muted-foreground">Configure date formats, timezones, and table density.</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4 text-xs">
                                    <SettingField label="Language">
                                        <select 
                                            value={formData.language} 
                                            onChange={(e) => updateField('language', e.target.value)}
                                            className="w-full p-2 bg-background border border-border rounded-lg text-xs font-medium text-foreground outline-hidden"
                                        >
                                            <option value="en-US">English (United States)</option>
                                            <option value="en-GB">English (United Kingdom)</option>
                                            <option value="de-DE">Deutsch (Germany)</option>
                                        </select>
                                    </SettingField>

                                    <SettingField label="Time Zone">
                                        <select 
                                            value={formData.timeZone} 
                                            onChange={(e) => updateField('timeZone', e.target.value)}
                                            className="w-full p-2 bg-background border border-border rounded-lg text-xs font-medium text-foreground outline-hidden font-mono"
                                        >
                                            <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+5:30)</option>
                                            <option value="America/New_York">America/New_York (EST - UTC-5:00)</option>
                                            <option value="Europe/London">Europe/London (GMT - UTC+0:00)</option>
                                        </select>
                                    </SettingField>

                                    <SettingField label="Date Format">
                                        <select 
                                            value={formData.dateFormat} 
                                            onChange={(e) => updateField('dateFormat', e.target.value)}
                                            className="w-full p-2 bg-background border border-border rounded-lg text-xs font-mono text-foreground outline-hidden"
                                        >
                                            <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 18/08/2026)</option>
                                            <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 08/18/2026)</option>
                                            <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
                                        </select>
                                    </SettingField>

                                    <SettingField label="Default Data Table Density">
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => updateField('tableDensity', 'compact')}
                                                className={cn(
                                                    "p-2.5 border rounded-lg text-left transition-all text-xs font-medium",
                                                    formData.tableDensity === 'compact' ? "border-foreground bg-muted font-bold" : "border-border hover:bg-muted/30"
                                                )}
                                            >
                                                <span>Compact (High Density)</span>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">Maximum rows per screen.</p>
                                            </button>
                                            <button
                                                onClick={() => updateField('tableDensity', 'comfortable')}
                                                className={cn(
                                                    "p-2.5 border rounded-lg text-left transition-all text-xs font-medium",
                                                    formData.tableDensity === 'comfortable' ? "border-foreground bg-muted font-bold" : "border-border hover:bg-muted/30"
                                                )}
                                            >
                                                <span>Comfortable</span>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">Spacious cell padding.</p>
                                            </button>
                                        </div>
                                    </SettingField>
                                </CardContent>
                            </Card>
                        )}

                        {/* 3. NOTIFICATIONS */}
                        {activeCategory === 'notifications' && (
                            <Card className="shadow-xs border-border">
                                <CardHeader className="pb-3 border-b border-border/60">
                                    <CardTitle className="text-sm font-bold text-foreground">Notification Preferences</CardTitle>
                                    <CardDescription className="text-xs text-muted-foreground">Manage in-app alerts, email digests, and security notifications.</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4 text-xs">
                                    <SettingField label="Important System & AI Alerts" description="Notify when high-value leads or revenue anomalies occur." inline>
                                        <ToggleSwitch checked={formData.inAppImportant} onChange={(val) => updateField('inAppImportant', val)} />
                                    </SettingField>

                                    <SettingField label="Mentions & Assignments" description="Notify when a teammate assigns a deal or mentions you." inline>
                                        <ToggleSwitch checked={formData.inAppMentions} onChange={(val) => updateField('inAppMentions', val)} />
                                    </SettingField>

                                    <SettingField label="Daily Telemetry Digest" description="Receive a daily summary of lead conversions at 8:00 AM." inline>
                                        <ToggleSwitch checked={formData.emailDailyDigest} onChange={(val) => updateField('emailDailyDigest', val)} />
                                    </SettingField>

                                    <SettingField label="Weekly Executive Revenue Report" description="Summary report of quarterly pipeline velocity every Monday." inline>
                                        <ToggleSwitch checked={formData.emailWeeklyReport} onChange={(val) => updateField('emailWeeklyReport', val)} />
                                    </SettingField>
                                </CardContent>
                            </Card>
                        )}

                        {/* 4. SECURITY & SESSIONS */}
                        {activeCategory === 'security' && (
                            <div className="space-y-5">
                                <Card className="shadow-xs border-border">
                                    <CardHeader className="pb-3 border-b border-border/60">
                                        <CardTitle className="text-sm font-bold text-foreground">Password & Two-Factor Authentication</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-4 text-xs">
                                        <SettingField label="Two-Factor Authentication (2FA)" description="Protect your account with TOTP authenticator apps." inline>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                                    2FA Active
                                                </span>
                                                <Button size="sm" variant="outline" className="h-7 text-xs font-semibold">Manage 2FA</Button>
                                            </div>
                                        </SettingField>

                                        <SettingField label="Change Password">
                                            <div className="space-y-2">
                                                <Input type="password" placeholder="Current Password" className="h-8 text-xs" />
                                                <Input type="password" placeholder="New Password (min 8 chars)" className="h-8 text-xs" />
                                                <Button size="sm" variant="outline" className="h-7 text-xs font-semibold">Update Password</Button>
                                            </div>
                                        </SettingField>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-xs border-border">
                                    <CardHeader className="pb-3 border-b border-border/60">
                                        <CardTitle className="text-sm font-bold text-foreground">Active Device Sessions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-3 text-xs">
                                        <div className="p-3 border border-border rounded-lg bg-muted/20 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Laptop className="w-5 h-5 text-foreground shrink-0" />
                                                <div>
                                                    <span className="font-bold text-foreground block">MacBook Pro · macOS</span>
                                                    <span className="text-[10px] font-mono text-muted-foreground">Chrome · Bhubaneswar, India</span>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                                Current Session
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* 5. GENERAL WORKSPACE */}
                        {activeCategory === 'general' && (
                            <Card className="shadow-xs border-border">
                                <CardHeader className="pb-3 border-b border-border/60">
                                    <CardTitle className="text-sm font-bold text-foreground">Workspace Details</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4 text-xs">
                                    <SettingField label="Workspace Name">
                                        <Input value={formData.workspaceName} onChange={(e) => updateField('workspaceName', e.target.value)} className="h-9 text-xs" />
                                    </SettingField>

                                    <SettingField label="Workspace URL Slug" description="Your unique workspace portal URL.">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-muted-foreground text-xs">applead.io/</span>
                                                <Input value={formData.workspaceSlug} onChange={(e) => updateField('workspaceSlug', e.target.value)} className="h-9 text-xs font-mono" />
                                            </div>
                                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                                <Check className="w-3 h-3" /> URL Available
                                            </span>
                                        </div>
                                    </SettingField>

                                    <SettingField label="Custom CNAME Domain">
                                        <Input value={formData.customDomain} onChange={(e) => updateField('customDomain', e.target.value)} className="h-9 text-xs font-mono" />
                                    </SettingField>
                                </CardContent>
                            </Card>
                        )}

                        {/* 6. MEMBERS & ROLES */}
                        {activeCategory === 'members' && (
                            <Card className="shadow-xs border-border">
                                <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-sm font-bold text-foreground">Team Members & Access</CardTitle>
                                    </div>
                                    <Button size="sm" className="h-8 text-xs font-semibold gap-1.5 bg-foreground text-background">
                                        <Plus className="w-3.5 h-3.5" /> Invite Member
                                    </Button>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-3 text-xs">
                                    <div className="border border-border rounded-lg overflow-hidden">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-border bg-muted/30 text-[10px] font-bold text-muted-foreground uppercase">
                                                    <th className="py-2.5 px-3">Member</th>
                                                    <th className="py-2.5 px-3">Role</th>
                                                    <th className="py-2.5 px-3">Status</th>
                                                    <th className="py-2.5 px-3 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/60">
                                                {[
                                                    { name: 'Gourav Mohanty', email: 'gourav@applead.io', role: 'Owner', status: 'Active' },
                                                    { name: 'Rahul Sharma', email: 'rahul@applead.io', role: 'Manager', status: 'Active' },
                                                    { name: 'Priya Patel', email: 'priya@applead.io', role: 'Analyst', status: 'Active' }
                                                ].map((m, i) => (
                                                    <tr key={i} className="hover:bg-muted/20">
                                                        <td className="py-2.5 px-3">
                                                            <span className="font-semibold text-foreground block">{m.name}</span>
                                                            <span className="text-[10px] text-muted-foreground font-mono">{m.email}</span>
                                                        </td>
                                                        <td className="py-2.5 px-3">
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-foreground border border-border">
                                                                {m.role}
                                                            </span>
                                                        </td>
                                                        <td className="py-2.5 px-3 font-semibold text-emerald-600">{m.status}</td>
                                                        <td className="py-2.5 px-3 text-right">
                                                            <button className="text-muted-foreground hover:text-foreground font-medium">Edit</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* 7. BRANDING */}
                        {activeCategory === 'branding' && (
                            <Card className="shadow-xs border-border">
                                <CardHeader className="pb-3 border-b border-border/60">
                                    <CardTitle className="text-sm font-bold text-foreground">Workspace Branding & Palette</CardTitle>
                                    <CardDescription className="text-xs text-muted-foreground">Upload organization logo, workspace title, and primary brand color.</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4 text-xs">
                                    {/* Workspace Title */}
                                    <SettingField label="Workspace Title" description="Main brand title displayed in sidebar header and portal navigation.">
                                        <Input 
                                            value={formData.workspaceName} 
                                            onChange={(e) => updateField('workspaceName', e.target.value)} 
                                            className="h-9 text-xs font-semibold" 
                                            placeholder="Thespacecode App"
                                        />
                                    </SettingField>
                                    {/* Primary Brand Logo */}
                                    <SettingField label="Primary Brand Logo" description="PNG, SVG, or WebP logo displayed at top of sidebar.">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-foreground text-background font-bold text-sm flex items-center justify-center border border-border shadow-xs overflow-hidden shrink-0">
                                                {brandLogoPreview ? (
                                                    <img src={brandLogoPreview} alt="Logo" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{(formData.workspaceName || 'A').charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="file" 
                                                    id="brand-logo-input" 
                                                    className="hidden" 
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onload = (event) => {
                                                                setBrandLogoPreview(event.target.result);
                                                                updateField('workspaceLogo', event.target.result);
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="h-8 text-xs font-semibold"
                                                    onClick={() => document.getElementById('brand-logo-input')?.click()}
                                                >
                                                    Upload Logo
                                                </Button>
                                                {brandLogoPreview && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        className="h-8 text-xs text-muted-foreground hover:text-destructive"
                                                        onClick={() => {
                                                            setBrandLogoPreview(null);
                                                            updateField('workspaceLogo', null);
                                                        }}
                                                    >
                                                        Remove Logo
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Live Logo Width Adjuster Slider */}
                                        <div className="mt-3 p-3 border border-border/80 rounded-lg bg-muted/20 space-y-2 max-w-sm">
                                            <div className="flex items-center justify-between text-xs font-medium">
                                                <span className="text-foreground font-semibold">Sidebar Logo Width</span>
                                                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-background border border-border text-foreground font-bold">
                                                    {formData.logoWidth || 120}px
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] text-muted-foreground font-mono">60px</span>
                                                <input 
                                                    type="range"
                                                    min="60"
                                                    max="240"
                                                    step="2"
                                                    value={formData.logoWidth || 120}
                                                    onChange={(e) => updateField('logoWidth', Number(e.target.value))}
                                                    className="flex-1 accent-foreground cursor-pointer h-1.5 bg-muted rounded-lg"
                                                />
                                                <span className="text-[10px] text-muted-foreground font-mono">240px</span>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">Adjusts logo display width live in sidebar header.</p>
                                        </div>
                                    </SettingField>




                                    <SettingField label="Primary Accent Color" description="Hex accent color used for primary CTA highlights.">
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="color" 
                                                value={formData.primaryBrandColor} 
                                                onChange={(e) => updateField('primaryBrandColor', e.target.value)}
                                                className="w-8 h-8 rounded border border-border cursor-pointer p-0.5"
                                            />
                                            <Input 
                                                value={formData.primaryBrandColor} 
                                                onChange={(e) => updateField('primaryBrandColor', e.target.value)}
                                                className="w-32 h-8 text-xs font-mono"
                                            />
                                        </div>
                                    </SettingField>
                                </CardContent>
                            </Card>
                        )}


                        {/* 8. BILLING & USAGE */}
                        {activeCategory === 'billing' && (
                            <Card className="shadow-xs border-border">
                                <CardHeader className="pb-3 border-b border-border/60">
                                    <CardTitle className="text-sm font-bold text-foreground">Subscription Plan & Telemetry Usage</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4 text-xs">
                                    <div className="p-4 border border-border rounded-xl bg-muted/20 flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Active Plan</span>
                                            <span className="text-base font-bold text-foreground">Enterprise Revenue OS Plan</span>
                                            <span className="text-[10px] text-muted-foreground block font-mono">$499/mo • Renews Sep 1, 2026</span>
                                        </div>
                                        <Button size="sm" className="h-8 text-xs font-semibold bg-foreground text-background">Manage Subscription</Button>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <h4 className="font-bold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">Usage Telemetry</h4>
                                        
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs font-medium">
                                                <span>Active User Seats</span>
                                                <span className="font-mono text-muted-foreground">4 / 25 Seats</span>
                                            </div>
                                            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-foreground h-full w-[16%]" />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs font-medium">
                                                <span>Monthly API Requests</span>
                                                <span className="font-mono text-muted-foreground">124,500 / 1,000,000</span>
                                            </div>
                                            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-foreground h-full w-[12%]" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* 9. APPEARANCE */}
                        {activeCategory === 'appearance' && (
                            <Card className="shadow-xs border-border">
                                <CardHeader className="pb-3 border-b border-border/60">
                                    <CardTitle className="text-sm font-bold text-foreground">Theme & Display Options</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4 text-xs">
                                    <SettingField label="Interface Theme Mode">
                                        <div className="grid grid-cols-3 gap-2">
                                            {['light', 'dark', 'system'].map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={() => updateField('theme', t)}
                                                    className={cn(
                                                        "p-2.5 border rounded-lg text-center capitalize font-semibold transition-all text-xs",
                                                        formData.theme === t ? "border-foreground bg-foreground text-background shadow-xs" : "border-border hover:bg-muted/30"
                                                    )}
                                                >
                                                    {t} Mode
                                                </button>
                                            ))}
                                        </div>
                                    </SettingField>

                                    <SettingField label="Reduced UI Motion" description="Minimize decorative animations across dashboard." inline>
                                        <ToggleSwitch checked={formData.reducedMotion} onChange={(val) => updateField('reducedMotion', val)} />
                                    </SettingField>
                                </CardContent>
                            </Card>
                        )}

                        {/* 10. INTEGRATIONS & GA4 TAG */}
                        {activeCategory === 'integrations' && (
                            <div className="space-y-5">
                                <Card className="shadow-xs border-border">
                                    <CardHeader className="pb-3 border-b border-border/60">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 border border-amber-500/20 font-bold text-xs flex items-center justify-center font-mono">
                                                    GA4
                                                </div>
                                                <div>
                                                    <CardTitle className="text-sm font-bold text-foreground">Google Analytics 4 (GA4) Tag Configuration</CardTitle>
                                                    <CardDescription className="text-xs text-muted-foreground">Specify your active GA4 Container Tag ID. Real telemetry data will be fetched into the Analytics section based on this Tag.</CardDescription>
                                                </div>
                                            </div>
                                            <span className={cn(
                                                "text-[10px] font-bold px-2.5 py-0.5 rounded border font-mono",
                                                formData.gaEnabled ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-muted text-muted-foreground border-border"
                                            )}>
                                                {formData.gaEnabled ? `GA4 Tag Active (${formData.gtmContainerId || 'GTM-N783921'})` : "Telemetry Disabled"}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-4 text-xs">
                                        <SettingField label="Google Tag Manager (GTM) / GA4 Tag ID" description="Official GA4 Web Container Tag ID embedded live on application shell (e.g. GTM-N783921).">
                                            <Input 
                                                value={formData.gtmContainerId} 
                                                onChange={(e) => updateField('gtmContainerId', e.target.value)} 
                                                className="h-9 text-xs font-mono font-bold" 
                                                placeholder="GTM-N783921" 
                                            />
                                        </SettingField>

                                        <SettingField label="GA4 Web Stream Measurement ID" description="GA4 Stream Measurement ID for client & server event telemetry stream.">
                                            <Input 
                                                value={formData.gaMeasurementId} 
                                                onChange={(e) => updateField('gaMeasurementId', e.target.value)} 
                                                className="h-9 text-xs font-mono" 
                                                placeholder="G-XXXXXXXXXX" 
                                            />
                                        </SettingField>

                                        <SettingField label="Enable Real Data Fetching from GA4 Tag" description="Fetch live GA4 active visitors, acquisition channels, and conversion funnel data into Analytics page." inline>
                                            <ToggleSwitch checked={formData.gaEnabled} onChange={(val) => updateField('gaEnabled', val)} />
                                        </SettingField>

                                        <div className="p-3 bg-muted/30 border border-border rounded-lg space-y-1 font-mono text-[11px]">
                                            <div className="flex items-center justify-between text-muted-foreground">
                                                <span>Active GA4 Tag Target:</span>
                                                <span className="font-bold text-foreground">{formData.gtmContainerId || 'GTM-N783921'}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-muted-foreground">
                                                <span>Data Fetching Endpoint:</span>
                                                <span className="text-emerald-600 font-semibold">https://www.googletagmanager.com/gtm.js?id={formData.gtmContainerId || 'GTM-N783921'}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Microsoft Clarity & Bing Search Tag Card */}
                                <Card className="shadow-xs border-border">
                                    <CardHeader className="pb-3 border-b border-border/60">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-700 font-mono font-bold text-xs flex items-center justify-center border border-blue-500/20 shrink-0">
                                                    MS
                                                </div>
                                                <div>
                                                    <CardTitle className="text-sm font-bold text-foreground">Microsoft Clarity & Bing Search Tag</CardTitle>
                                                    <CardDescription className="text-xs text-muted-foreground">Specify your active Microsoft Clarity Tag ID and Bing UET Tag to fetch Bing search engine results into Analytics.</CardDescription>
                                                </div>
                                            </div>
                                            <span className={cn(
                                                "text-[10px] font-bold px-2.5 py-0.5 rounded border font-mono",
                                                formData.msEnabled ? "bg-blue-500/10 text-blue-600 border-blue-500/20" : "bg-muted text-muted-foreground border-border"
                                            )}>
                                                {formData.msEnabled ? `MS Tag Active (${formData.msClarityId || 'MS-8923419'})` : "Disabled"}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-4 text-xs">
                                        <SettingField label="Microsoft Clarity Project Tag ID" description="Official Microsoft Clarity Project Tag ID for heatmaps & session analytics (e.g. MS-8923419).">
                                            <Input 
                                                value={formData.msClarityId} 
                                                onChange={(e) => updateField('msClarityId', e.target.value)} 
                                                className="h-9 text-xs font-mono font-bold" 
                                                placeholder="MS-8923419" 
                                            />
                                        </SettingField>

                                        <SettingField label="Bing Advertising UET Tag ID" description="Microsoft Bing UET Tag ID for search engine conversion tracking.">
                                            <Input 
                                                value={formData.msUetTagId} 
                                                onChange={(e) => updateField('msUetTagId', e.target.value)} 
                                                className="h-9 text-xs font-mono" 
                                                placeholder="MS-UET-90234" 
                                            />
                                        </SettingField>

                                        <SettingField label="Enable Microsoft Bing Telemetry Fetching" description="Fetch live Bing search queries, impressions, and Clarity session analytics into Analytics page." inline>
                                            <ToggleSwitch checked={formData.msEnabled} onChange={(val) => updateField('msEnabled', val)} />
                                        </SettingField>
                                    </CardContent>
                                </Card>
                            </div>
                        )}




                        {/* 11. DATA & BACKUP */}
                        {activeCategory === 'data' && (
                            <Card className="shadow-xs border-border">
                                <CardHeader className="pb-3 border-b border-border/60">
                                    <CardTitle className="text-sm font-bold text-foreground">Data Management & Backup Telemetry</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4 text-xs">
                                    <SettingField label="Import Lead Data" description="Import contacts via CSV or Excel dataset.">
                                        <Button size="sm" variant="outline" className="h-8 text-xs font-semibold gap-1.5">
                                            <Upload className="w-3.5 h-3.5" /> Import CSV File
                                        </Button>
                                    </SettingField>

                                    <SettingField label="Full Workspace Data Export" description="Download a full archive of leads, deals, invoices, and settings.">
                                        <Button size="sm" variant="outline" className="h-8 text-xs font-semibold gap-1.5">
                                            <Download className="w-3.5 h-3.5" /> Export JSON Archive
                                        </Button>
                                    </SettingField>
                                </CardContent>
                            </Card>
                        )}

                        {/* 12. API KEYS */}
                        {activeCategory === 'api' && (
                            <Card className="shadow-xs border-border">
                                <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-sm font-bold text-foreground">Developer API Keys</CardTitle>
                                    </div>
                                    <Button size="sm" className="h-8 text-xs font-semibold gap-1.5 bg-foreground text-background">
                                        <Plus className="w-3.5 h-3.5" /> Create API Key
                                    </Button>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4 text-xs">
                                    <div className="border border-border rounded-lg overflow-hidden font-mono">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-border bg-muted/40 text-[10px] font-bold text-muted-foreground uppercase">
                                                    <th className="py-2.5 px-3">Key Name</th>
                                                    <th className="py-2.5 px-3">Token Mask</th>
                                                    <th className="py-2.5 px-3">Last Used</th>
                                                    <th className="py-2.5 px-3 text-right">Revoke</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/60 text-xs">
                                                <tr className="hover:bg-muted/20">
                                                    <td className="py-2.5 px-3 font-semibold text-foreground font-sans">Production Telemetry API</td>
                                                    <td className="py-2.5 px-3 text-muted-foreground">apl_live_••••••••8923</td>
                                                    <td className="py-2.5 px-3 text-muted-foreground">4m ago</td>
                                                    <td className="py-2.5 px-3 text-right font-sans">
                                                        <button className="text-destructive font-medium hover:underline">Revoke</button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* 13. WEBHOOKS */}
                        {activeCategory === 'webhooks' && (
                            <Card className="shadow-xs border-border">
                                <CardHeader className="pb-3 border-b border-border/60">
                                    <CardTitle className="text-sm font-bold text-foreground">Webhook Listener Configuration</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4 text-xs">
                                    <SettingField label="Webhook Endpoint URL">
                                        <Input value={formData.webhookUrl} onChange={(e) => updateField('webhookUrl', e.target.value)} className="h-9 text-xs font-mono" />
                                    </SettingField>

                                    <SettingField label="Signing Secret">
                                        <Input type="password" value={formData.webhookSecret} onChange={(e) => updateField('webhookSecret', e.target.value)} className="h-9 text-xs font-mono" />
                                    </SettingField>
                                </CardContent>
                            </Card>
                        )}

                        {/* 14. AUDIT LOGS */}
                        {activeCategory === 'audit' && (
                            <Card className="shadow-xs border-border">
                                <CardHeader className="pb-3 border-b border-border/60">
                                    <CardTitle className="text-sm font-bold text-foreground">Security Audit Trail</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-3 text-xs">
                                    <div className="border border-border rounded-lg overflow-hidden font-mono text-[11px]">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-border bg-muted/40 text-[10px] font-bold text-muted-foreground uppercase">
                                                    <th className="py-2.5 px-3">Timestamp</th>
                                                    <th className="py-2.5 px-3">User</th>
                                                    <th className="py-2.5 px-3">Action</th>
                                                    <th className="py-2.5 px-3">Target Resource</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/60">
                                                {[
                                                    { time: '22:41:09', user: 'Gourav', action: 'Updated RBAC Role', target: 'Rahul Sharma' },
                                                    { time: '21:13:42', user: 'Priya', action: 'Exported Telemetry', target: 'Analytics Q3' },
                                                    { time: '19:04:15', user: 'Rahul', action: 'Created Lead', target: 'CyberShield Systems' }
                                                ].map((log, i) => (
                                                    <tr key={i} className="hover:bg-muted/20">
                                                        <td className="py-2.5 px-3 text-muted-foreground">{log.time}</td>
                                                        <td className="py-2.5 px-3 font-bold text-foreground font-sans">{log.user}</td>
                                                        <td className="py-2.5 px-3 font-semibold text-foreground font-sans">{log.action}</td>
                                                        <td className="py-2.5 px-3 text-muted-foreground font-sans">{log.target}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* 15. DANGER ZONE */}
                        {activeCategory === 'danger' && (
                            <Card className="shadow-xs border-destructive/40 bg-destructive/5">
                                <CardHeader className="pb-3 border-b border-destructive/20">
                                    <CardTitle className="text-sm font-bold text-destructive flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" /> Danger Zone Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4 text-xs">
                                    <SettingField label="Permanently Delete Workspace" description="Deletes all leads, deals, telemetry, and account settings." inline>
                                        <Button 
                                            size="sm" 
                                            onClick={() => setShowDeleteModal(true)} 
                                            className="h-8 text-xs font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            Delete Workspace...
                                        </Button>
                                    </SettingField>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* High-Contrast Unsaved Changes Action Bar */}
                {hasUnsavedChanges && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-5 animate-fade-in border border-slate-700/80">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-xs font-bold tracking-tight text-white">Careful — You have unsaved changes!</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <button 
                                type="button" 
                                onClick={handleDiscardChanges} 
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-colors shadow-xs"
                            >
                                Discard
                            </button>
                            <button 
                                type="button" 
                                onClick={handleSaveChanges} 
                                className="px-3.5 py-1.5 rounded-lg text-xs font-extrabold text-black bg-[#EAF212] hover:bg-[#d9e110] transition-colors shadow-md border border-[#c5cd0e] flex items-center gap-1.5"
                            >
                                <Save className="w-3.5 h-3.5" />
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}


                {/* Save Toast */}
                {saveSuccessToast && (
                    <div className="fixed bottom-6 right-6 z-50 bg-card border border-emerald-500/30 text-foreground px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-fade-in">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-semibold">Settings saved successfully</span>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
