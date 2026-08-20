import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
    LayoutDashboard, Activity, HandCoins, FolderKanban, Receipt, 
    LifeBuoy, FileText, User, Award, Target, Clock, Banknote 
} from 'lucide-react';

/* Contextual Navigation Presets for Connected Business Objects */
export const CONTEXTUAL_TABS_PRESETS = {
    customer: {
        entityType: 'Customer Account',
        name: 'Acme Enterprise Holdings Inc. ($1.2M ARR)',
        tabs: [
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'activity', label: 'Activity Timeline', icon: Activity, count: 18 },
            { id: 'deals', label: 'Deals & Expansion', icon: HandCoins, badge: '$450k Open' },
            { id: 'projects', label: 'Delivery Projects', icon: FolderKanban, count: 3 },
            { id: 'invoices', label: 'Invoices & Billing', icon: Receipt },
            { id: 'support', label: 'Support Tickets', icon: LifeBuoy, count: 1 },
            { id: 'documents', label: 'Contracts & Docs', icon: FileText },
        ]
    },
    project: {
        entityType: 'Delivery Project',
        name: 'Global ERP Migration Phase 2',
        tabs: [
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'tasks', label: 'Tasks & Sprints', icon: Activity, count: 42 },
            { id: 'team', label: 'Project Team', icon: User, count: 8 },
            { id: 'timeline', label: 'Gantt & Milestones', icon: Clock },
            { id: 'budget', label: 'Budget & Burn Rate', icon: Banknote, badge: '$120k / $150k' },
            { id: 'documents', label: 'Design Specs', icon: FileText },
        ]
    },
    employee: {
        entityType: 'Employee Profile',
        name: 'Alexandra Vance (VP Engineering)',
        tabs: [
            { id: 'profile', label: 'Profile', icon: User },
            { label: 'Employment Details', id: 'employment', icon: Activity },
            { id: 'performance', label: 'Performance Reviews', icon: Award, badge: 'Exceeds' },
            { id: 'goals', label: 'OKRs & Goals', icon: Target, count: 4 },
            { id: 'payroll', label: 'Payroll & Comp', icon: Banknote },
            { id: 'leave', label: 'Leave History', icon: Clock },
            { id: 'documents', label: 'HR Documents', icon: FileText },
        ]
    }
};

export default function ContextualNav({ preset = 'customer', onSelectTab }) {
    const activePreset = CONTEXTUAL_TABS_PRESETS[preset] || CONTEXTUAL_TABS_PRESETS.customer;
    const [activeTab, setActiveTab] = useState(activePreset.tabs[0].id);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        if (onSelectTab) onSelectTab(tabId);
    };

    return (
        <div className="w-full bg-card border border-border rounded-xl p-3 mb-6 shadow-xs">
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-border/60">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {activePreset.entityType}
                    </span>
                    <h3 className="text-xs font-bold text-foreground truncate">{activePreset.name}</h3>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">Contextual Page Sub-Navigation</span>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
                {activePreset.tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 border",
                                isActive
                                    ? "bg-foreground text-background border-foreground shadow-xs font-semibold"
                                    : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Icon className={cn("w-3.5 h-3.5", isActive ? "text-background" : "text-muted-foreground")} />
                            <span>{tab.label}</span>
                            {(tab.count || tab.badge) && (
                                <span className={cn(
                                    "text-[9px] font-mono font-bold px-1.5 py-0.2 rounded",
                                    isActive ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
                                )}>
                                    {tab.badge || tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
