import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { router, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';
import {
    Plus, LayoutDashboard, Trash2, MoreHorizontal, Pencil, Eye,
    BarChart3, PieChart as PieIcon, TrendingUp, DollarSign, Layers,
    Building2, Table2, Award, Briefcase, Target, X, Check, Sparkles
} from 'lucide-react';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/Components/ui/dropdown-menu';

// Map widget keys to icons
const WIDGET_ICONS = {
    kpi_pipeline: DollarSign,
    kpi_revenue: Award,
    kpi_deals: Briefcase,
    kpi_win_rate: TrendingUp,
    chart_area_opportunity: TrendingUp,
    chart_bar_pipeline_stage: Layers,
    chart_bar_deals_company: Building2,
    chart_donut_lead_sources: PieIcon,
    table_recent_deals: Table2,
};

const WIDGET_COLORS = {
    kpi_pipeline: 'text-indigo-600 bg-indigo-500/10',
    kpi_revenue: 'text-emerald-600 bg-emerald-500/10',
    kpi_deals: 'text-blue-600 bg-blue-500/10',
    kpi_win_rate: 'text-amber-600 bg-amber-500/10',
    chart_area_opportunity: 'text-indigo-600 bg-indigo-500/10',
    chart_bar_pipeline_stage: 'text-blue-600 bg-blue-500/10',
    chart_bar_deals_company: 'text-purple-600 bg-purple-500/10',
    chart_donut_lead_sources: 'text-amber-600 bg-amber-500/10',
    table_recent_deals: 'text-slate-600 bg-slate-500/10',
};

export default function DashboardsIndex({ dashboards = [], availableWidgets = [] }) {
    const [showCreateModal, setShowCreateModal] = useState(false);

    const form = useForm({
        name: '',
        description: '',
        widgets: [],
    });

    const handleCreate = (e) => {
        e.preventDefault();
        form.post('/dashboard', {
            onSuccess: () => {
                setShowCreateModal(false);
                form.reset();
            },
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this dashboard?')) {
            router.delete(`/dashboard/${id}`);
        }
    };

    const toggleWidget = (key) => {
        const current = form.data.widgets;
        if (current.includes(key)) {
            form.setData('widgets', current.filter(k => k !== key));
        } else {
            form.setData('widgets', [...current, key]);
        }
    };

    const selectAllWidgets = () => {
        form.setData('widgets', availableWidgets.map(w => w.key));
    };

    return (
        <AppLayout title="Dashboards">
            <div className="space-y-6 animate-fade-in pb-8 select-none">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-black text-foreground">Dashboards</h1>
                        <p className="text-xs text-muted-foreground">Create and manage custom dashboards with your choice of analytics widgets.</p>
                    </div>
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        className="h-9 text-xs font-bold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Dashboard</span>
                    </Button>
                </div>

                {/* Dashboard Grid */}
                {dashboards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-4">
                            <LayoutDashboard className="w-8 h-8" />
                        </div>
                        <h2 className="text-sm font-bold text-foreground">No Dashboards Yet</h2>
                        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                            Create your first custom dashboard by selecting the analytics widgets you need.
                        </p>
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-4 h-9 text-xs font-bold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create Your First Dashboard</span>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dashboards.map((dash) => (
                            <div
                                key={dash.id}
                                className="p-5 bg-card border border-border/80 rounded-2xl shadow-xs hover:border-indigo-500/40 transition-all cursor-pointer group relative"
                                onClick={() => router.get(`/dashboard/${dash.id}`)}
                            >
                                {/* Actions Dropdown */}
                                <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer opacity-0 group-hover:opacity-100">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40 text-xs">
                                            <DropdownMenuItem onClick={() => router.get(`/dashboard/${dash.id}`)} className="cursor-pointer font-medium">
                                                <Eye className="w-3.5 h-3.5 mr-2" /> View
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDelete(dash.id)} className="cursor-pointer font-medium text-destructive focus:text-destructive">
                                                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Card Content */}
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                                        <LayoutDashboard className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-extrabold text-foreground truncate">{dash.name}</h3>
                                            {dash.is_default && (
                                                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 shrink-0">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        {dash.description && (
                                            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{dash.description}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Widget Preview Icons */}
                                <div className="mt-4 flex items-center gap-1.5 flex-wrap">
                                    {(dash.widgets || []).slice(0, 6).map((widgetKey) => {
                                        const Icon = WIDGET_ICONS[widgetKey] || BarChart3;
                                        const colorClass = WIDGET_COLORS[widgetKey] || 'text-slate-500 bg-slate-500/10';
                                        return (
                                            <div key={widgetKey} className={cn("w-7 h-7 rounded-lg flex items-center justify-center", colorClass)}>
                                                <Icon className="w-3.5 h-3.5" />
                                            </div>
                                        );
                                    })}
                                    {(dash.widgets || []).length > 6 && (
                                        <span className="text-[10px] font-bold text-muted-foreground ml-1">+{dash.widgets.length - 6}</span>
                                    )}
                                </div>

                                {/* Footer Meta */}
                                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                                    <span>{dash.widget_count} widget{dash.widget_count !== 1 ? 's' : ''}</span>
                                    <span>Updated {dash.updated_at}</span>
                                </div>
                            </div>
                        ))}

                        {/* Create New Card */}
                        <div
                            className="p-5 border-2 border-dashed border-border/60 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all min-h-[180px]"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <div className="w-10 h-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center mb-2">
                                <Plus className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-muted-foreground">Create New Dashboard</span>
                        </div>
                    </div>
                )}

                {/* ── CREATE DASHBOARD MODAL ── */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}>
                        <div
                            className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 m-4 max-h-[85vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h2 className="text-base font-black text-foreground">Create New Dashboard</h2>
                                    <p className="text-xs text-muted-foreground mt-0.5">Select the analytics widgets you want on this dashboard.</p>
                                </div>
                                <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-5">
                                {/* Name */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">Dashboard Name</label>
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        placeholder="e.g. Sales Overview, Weekly Report..."
                                        required
                                        className="w-full h-10 px-3.5 text-sm bg-transparent border border-border focus:border-indigo-600 rounded-xl text-foreground placeholder:text-muted-foreground transition-all outline-none font-medium"
                                    />
                                    {form.errors.name && <p className="text-xs text-destructive font-medium">{form.errors.name}</p>}
                                </div>

                                {/* Description */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">Description <span className="font-normal text-muted-foreground">(Optional)</span></label>
                                    <input
                                        type="text"
                                        value={form.data.description}
                                        onChange={(e) => form.setData('description', e.target.value)}
                                        placeholder="Brief summary of this dashboard's purpose..."
                                        className="w-full h-10 px-3.5 text-sm bg-transparent border border-border focus:border-indigo-600 rounded-xl text-foreground placeholder:text-muted-foreground transition-all outline-none font-medium"
                                    />
                                </div>

                                {/* Widget Picker */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-foreground uppercase tracking-wider">Select Widgets</label>
                                        <button
                                            type="button"
                                            onClick={selectAllWidgets}
                                            className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                                        >
                                            Select All
                                        </button>
                                    </div>
                                    {form.errors.widgets && <p className="text-xs text-destructive font-medium">{form.errors.widgets}</p>}

                                    <div className="grid grid-cols-1 gap-2">
                                        {availableWidgets.map((widget) => {
                                            const isSelected = form.data.widgets.includes(widget.key);
                                            const Icon = WIDGET_ICONS[widget.key] || BarChart3;
                                            const colorClass = WIDGET_COLORS[widget.key] || 'text-slate-500 bg-slate-500/10';

                                            return (
                                                <button
                                                    key={widget.key}
                                                    type="button"
                                                    onClick={() => toggleWidget(widget.key)}
                                                    className={cn(
                                                        "flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer",
                                                        isSelected
                                                            ? "border-indigo-500/50 bg-indigo-500/5"
                                                            : "border-border/60 hover:border-border hover:bg-muted/30"
                                                    )}
                                                >
                                                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", colorClass)}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-xs font-bold text-foreground block">{widget.label}</span>
                                                        <span className="text-[10px] text-muted-foreground">{widget.category} • {widget.size.toUpperCase()}</span>
                                                    </div>
                                                    <div className={cn(
                                                        "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
                                                        isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-border"
                                                    )}>
                                                        {isSelected && <Check className="w-3 h-3" />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="flex items-center gap-3 pt-2">
                                    <Button
                                        type="submit"
                                        disabled={form.processing || form.data.widgets.length === 0}
                                        className="flex-1 h-10 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer gap-1.5"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        <span>Create Dashboard ({form.data.widgets.length} widgets)</span>
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowCreateModal(false)}
                                        className="h-10 text-xs font-bold cursor-pointer"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
