import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Sidebar, { ENTERPRISE_ROLES, MULTI_ENTITIES, ENTERPRISE_MODULE_GROUPS } from '@/Components/Sidebar';
import ContextualNav, { CONTEXTUAL_TABS_PRESETS } from '@/Components/ContextualNav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';
import {
    Compass, Gauge, Shield, Users, Building2, Eye, Filter, CheckCircle2, 
    Layers, Cpu, Sparkles, ArrowRight, Smartphone, Monitor, ChevronRight, HelpCircle
} from 'lucide-react';

export default function NavigationDemo() {
    const [collapsed, setCollapsed] = useState(false);
    const [activeRole, setActiveRole] = useState('ceo');
    const [contextualPreset, setContextualPreset] = useState('customer');

    const activeRoleObj = ENTERPRISE_ROLES.find(r => r.id === activeRole) || ENTERPRISE_ROLES[0];
    const visibleModules = ENTERPRISE_MODULE_GROUPS.filter(mod => !mod.roles || mod.roles.includes(activeRole));

    return (
        <AppLayout title="Enterprise Navigation Architecture">
            <div className="space-y-6 max-w-7xl mx-auto">
                {/* ── HEADER BANNER ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-card border border-border rounded-2xl shadow-xs">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                Enterprise Information Architecture
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground">
                                $100M+ ARR Operating Platform
                            </span>
                        </div>
                        <h1 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight">
                            Unified Company Operating System Sidebar
                        </h1>
                        <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
                            Connecting Leadership, Revenue, Customers, Marketing, Operations, Finance, People, Procurement, Supply Chain, Intelligence, Governance, and Technology into one source of truth.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant={collapsed ? "default" : "outline"}
                            onClick={() => setCollapsed(!collapsed)}
                            className="text-xs font-semibold gap-1.5"
                        >
                            <Monitor className="w-3.5 h-3.5" />
                            <span>{collapsed ? "Expand Sidebar (260px)" : "Collapse Sidebar (64px)"}</span>
                        </Button>
                    </div>
                </div>

                {/* ── INTERACTIVE ROLE & PERSPECTIVE SIMULATOR BAR ── */}
                <Card className="border-border">
                    <CardHeader className="py-3 px-4 border-b border-border bg-muted/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-muted-foreground" />
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                                    Role-Based Navigation Simulator
                                </CardTitle>
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground">
                                Active Filter: <strong className="text-foreground">{activeRoleObj.label}</strong> ({visibleModules.length} Modules Visible)
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                            {ENTERPRISE_ROLES.map((role) => {
                                const isSelected = activeRole === role.id;
                                return (
                                    <button
                                        key={role.id}
                                        onClick={() => setActiveRole(role.id)}
                                        className={cn(
                                            "flex flex-col items-start p-2.5 rounded-xl border text-left transition-all",
                                            isSelected
                                                ? "bg-foreground text-background border-foreground shadow-xs font-semibold"
                                                : "bg-muted/30 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                                        )}
                                    >
                                        <span className="text-xs font-bold truncate w-full">{role.label}</span>
                                        <span className={cn("text-[9px] font-mono mt-1 opacity-80 truncate w-full")}>
                                            {role.subtitle}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* ── CONTEXTUAL NAVIGATION DEMO SECTION ── */}
                <Card className="border-border">
                    <CardHeader className="py-3 px-4 border-b border-border bg-muted/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-muted-foreground" />
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                                    Contextual Page Sub-Navigation Preview
                                </CardTitle>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {['customer', 'project', 'employee'].map((presetKey) => (
                                    <button
                                        key={presetKey}
                                        onClick={() => setContextualPreset(presetKey)}
                                        className={cn(
                                            "px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold uppercase transition-colors border",
                                            contextualPreset === presetKey
                                                ? "bg-foreground text-background border-foreground shadow-xs"
                                                : "bg-muted/40 text-muted-foreground border-border hover:text-foreground"
                                        )}
                                    >
                                        {presetKey} Tabs
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-3">
                            To maintain a compact global sidebar, deep page actions are rendered contextually inside the active view:
                        </p>
                        <ContextualNav preset={contextualPreset} />
                    </CardContent>
                </Card>

                {/* ── ENTERPRISE INFORMATION ARCHITECTURE MAP ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Column 1: Core Leadership & Revenue */}
                    <Card className="border-border">
                        <CardHeader className="py-3 px-4 border-b border-border bg-muted/10">
                            <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                                <Compass className="w-3.5 h-3.5 text-amber-400" />
                                Leadership & Revenue Architecture
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 space-y-3 text-xs">
                            <div className="space-y-1">
                                <div className="font-bold text-foreground text-[11px] uppercase tracking-tight">00. Command Center</div>
                                <div className="text-muted-foreground text-[11px]">Executive Overview, Revenue, Profit, Cash, Risks, Approvals, AI Insights.</div>
                            </div>
                            <div className="space-y-1 pt-2 border-t border-border/40">
                                <div className="font-bold text-foreground text-[11px] uppercase tracking-tight">01. Company Leadership</div>
                                <div className="text-muted-foreground text-[11px]">Strategy, Goals, OKRs, Performance, Executive Reporting, Initiatives.</div>
                            </div>
                            <div className="space-y-1 pt-2 border-t border-border/40">
                                <div className="font-bold text-foreground text-[11px] uppercase tracking-tight">02. Revenue & Sales</div>
                                <div className="text-muted-foreground text-[11px]">CRM, Pipeline ($14.2M), Forecast, Territories, Commissions, Quotes.</div>
                            </div>
                            <div className="space-y-1 pt-2 border-t border-border/40">
                                <div className="font-bold text-foreground text-[11px] uppercase tracking-tight">03. Customers & Success</div>
                                <div className="text-muted-foreground text-[11px]">Accounts, Customer Health (98%), Renewals, Support Desk, Feedback.</div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Column 2: Operations, Finance & People */}
                    <Card className="border-border">
                        <CardHeader className="py-3 px-4 border-b border-border bg-muted/10">
                            <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                                Operations, Finance & Workforce
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 space-y-3 text-xs">
                            <div className="space-y-1">
                                <div className="font-bold text-foreground text-[11px] uppercase tracking-tight">04. Operations & Delivery</div>
                                <div className="text-muted-foreground text-[11px]">Projects, Tasks & Boards, Workflows, SOPs, Resources, Service Delivery.</div>
                            </div>
                            <div className="space-y-1 pt-2 border-t border-border/40">
                                <div className="font-bold text-foreground text-[11px] uppercase tracking-tight">05. Finance & Treasury</div>
                                <div className="text-muted-foreground text-[11px]">Ledger, Accounts Receivable ($2.4M), AP, Treasury, Expenses, Budget.</div>
                            </div>
                            <div className="space-y-1 pt-2 border-t border-border/40">
                                <div className="font-bold text-foreground text-[11px] uppercase tracking-tight">06. People & Workforce</div>
                                <div className="text-muted-foreground text-[11px]">Directory, Org Chart, Hiring, Onboarding, Leaves, Global Payroll.</div>
                            </div>
                            <div className="space-y-1 pt-2 border-t border-border/40">
                                <div className="font-bold text-foreground text-[11px] uppercase tracking-tight">07. Procurement & Spend</div>
                                <div className="text-muted-foreground text-[11px]">Vendors, Purchase Orders, Contracts, Spend Analytics, Approvals.</div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Column 3: Intelligence, Governance & Technology */}
                    <Card className="border-border">
                        <CardHeader className="py-3 px-4 border-b border-border bg-muted/10">
                            <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                                Intelligence, Governance & Tech
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 space-y-3 text-xs">
                            <div className="space-y-1">
                                <div className="font-bold text-foreground text-[11px] uppercase tracking-tight">08. Intelligence & AI</div>
                                <div className="text-muted-foreground text-[11px]">Business Intelligence, AI Insights Engine, Predictive Forecasts, Data Explorer.</div>
                            </div>
                            <div className="space-y-1 pt-2 border-t border-border/40">
                                <div className="font-bold text-foreground text-[11px] uppercase tracking-tight">09. Governance & Risk</div>
                                <div className="text-muted-foreground text-[11px]">Legal Contracts, Compliance, Enterprise Risk, Policies, Audit Logs.</div>
                            </div>
                            <div className="space-y-1 pt-2 border-t border-border/40">
                                <div className="font-bold text-foreground text-[11px] uppercase tracking-tight">10. Technology & DevOps</div>
                                <div className="text-muted-foreground text-[11px]">Applications, Integrations & Webhooks, Developer APIs, Security IAM.</div>
                            </div>
                            <div className="space-y-1 pt-2 border-t border-border/40">
                                <div className="font-bold text-foreground text-[11px] uppercase tracking-tight">11. Global Action Center</div>
                                <div className="text-muted-foreground text-[11px]">My Tasks (3), Approvals (8), Notifications (4), System Settings.</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
