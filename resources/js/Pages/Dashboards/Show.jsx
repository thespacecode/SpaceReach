import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import DataTable from '@/Components/DataTable';
import SlideOverDrawer from '@/Components/SlideOverDrawer';
import { router, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';
import {
    TrendingUp, DollarSign, Briefcase, PieChart as PieIcon,
    ArrowRight, Sparkles, Building2, Layers, Target, Award,
    ArrowUp, Pencil, Trash2, ArrowLeft, X, Check, BarChart3, Table2, LayoutDashboard
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

// Widget icon/color maps (same as Index)
const WIDGET_ICONS = {
    kpi_pipeline: DollarSign, kpi_revenue: Award, kpi_deals: Briefcase, kpi_win_rate: TrendingUp,
    chart_area_opportunity: TrendingUp, chart_bar_pipeline_stage: Layers,
    chart_bar_deals_company: Building2, chart_donut_lead_sources: PieIcon, table_recent_deals: Table2,
};
const WIDGET_COLORS = {
    kpi_pipeline: 'text-indigo-600 bg-indigo-500/10', kpi_revenue: 'text-emerald-600 bg-emerald-500/10',
    kpi_deals: 'text-blue-600 bg-blue-500/10', kpi_win_rate: 'text-amber-600 bg-amber-500/10',
    chart_area_opportunity: 'text-indigo-600 bg-indigo-500/10', chart_bar_pipeline_stage: 'text-blue-600 bg-blue-500/10',
    chart_bar_deals_company: 'text-purple-600 bg-purple-500/10', chart_donut_lead_sources: 'text-amber-600 bg-amber-500/10',
    table_recent_deals: 'text-slate-600 bg-slate-500/10',
};

export default function DashboardShow({ dashboard = {}, widgetData = {}, availableWidgets = [] }) {
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const widgets = dashboard.widgets || [];
    const stats = widgetData.stats || {};

    const editForm = useForm({
        name: dashboard.name || '',
        description: dashboard.description || '',
        widgets: [...widgets],
    });

    // Format helpers
    const formatCurrency = (amount) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount || 0);
    const formatShortNumber = (val) => {
        if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
        return `$${val}`;
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        editForm.put(`/dashboard/${dashboard.id}`, {
            onSuccess: () => setShowEditModal(false),
        });
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this dashboard?')) {
            router.delete(`/dashboard/${dashboard.id}`);
        }
    };

    const toggleWidget = (key) => {
        const current = editForm.data.widgets;
        if (current.includes(key)) {
            editForm.setData('widgets', current.filter(k => k !== key));
        } else {
            editForm.setData('widgets', [...current, key]);
        }
    };

    // DataTable columns for recent deals
    const dealColumns = [
        { key: 'id', label: 'ID', render: (val) => <span className="font-mono text-muted-foreground font-semibold text-xs">{val}</span> },
        {
            key: 'company', label: 'Company',
            render: (val, row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-foreground text-xs">{val}</span>
                    <span className="text-[11px] text-muted-foreground">{row.name}</span>
                </div>
            )
        },
        { key: 'contact', label: 'Contact', render: (val) => <span className="text-xs font-medium">{val}</span> },
        { key: 'value', label: 'Value', align: 'right', render: (val) => <span className="font-extrabold font-mono text-xs">{val}</span> },
        {
            key: 'probability', label: 'Win %', align: 'center',
            render: (val) => (
                <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                    <Sparkles className="w-3 h-3 text-amber-500" />{val}
                </span>
            )
        },
        {
            key: 'stage', label: 'Stage',
            render: (val, row) => (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold text-white shadow-2xs" style={{ backgroundColor: row.stage_color || '#6366f1' }}>
                    {val}
                </span>
            )
        },
        { key: 'owner', label: 'Owner', render: (val) => <span className="text-xs text-muted-foreground font-medium">{val}</span> },
    ];

    // ── WIDGET RENDERERS ──
    const renderWidget = (widgetKey) => {
        switch (widgetKey) {
            case 'kpi_pipeline':
                return (
                    <div key={widgetKey} className="p-5 bg-card border border-border/80 rounded-2xl shadow-xs flex flex-col justify-between hover:border-indigo-500/40 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Pipeline Value</span>
                            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center"><DollarSign className="w-5 h-5" /></div>
                        </div>
                        <div className="mt-3">
                            <div className="text-2xl font-black text-foreground font-mono tracking-tight">{formatCurrency(stats.total_pipeline)}</div>
                            <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                                <ArrowUp className="w-3.5 h-3.5" /><span>+14.2%</span>
                                <span className="text-muted-foreground font-normal text-[11px]">vs last month</span>
                            </div>
                        </div>
                    </div>
                );

            case 'kpi_revenue':
                return (
                    <div key={widgetKey} className="p-5 bg-card border border-border/80 rounded-2xl shadow-xs flex flex-col justify-between hover:border-emerald-500/40 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Closed Won Revenue</span>
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center"><Award className="w-5 h-5" /></div>
                        </div>
                        <div className="mt-3">
                            <div className="text-2xl font-black text-foreground font-mono tracking-tight">{formatCurrency(stats.won_revenue)}</div>
                            <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                                <ArrowUp className="w-3.5 h-3.5" /><span>+22.8%</span>
                                <span className="text-muted-foreground font-normal text-[11px]">target achieved</span>
                            </div>
                        </div>
                    </div>
                );

            case 'kpi_deals':
                return (
                    <div key={widgetKey} className="p-5 bg-card border border-border/80 rounded-2xl shadow-xs flex flex-col justify-between hover:border-blue-500/40 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Opportunities</span>
                            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center"><Briefcase className="w-5 h-5" /></div>
                        </div>
                        <div className="mt-3">
                            <div className="text-2xl font-black text-foreground font-mono tracking-tight">
                                {stats.active_deals} <span className="text-xs text-muted-foreground font-sans font-normal">Deals</span>
                            </div>
                            <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                                <Target className="w-3.5 h-3.5" /><span>Avg. Size {formatShortNumber(stats.avg_deal_size)}</span>
                            </div>
                        </div>
                    </div>
                );

            case 'kpi_win_rate':
                return (
                    <div key={widgetKey} className="p-5 bg-card border border-border/80 rounded-2xl shadow-xs flex flex-col justify-between hover:border-amber-500/40 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sales Win Rate</span>
                            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div>
                        </div>
                        <div className="mt-3">
                            <div className="text-2xl font-black text-foreground font-mono tracking-tight">{stats.win_rate}%</div>
                            <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                                <Sparkles className="w-3.5 h-3.5" /><span>High Conversion Velocity</span>
                            </div>
                        </div>
                    </div>
                );

            case 'chart_area_opportunity':
                return (
                    <div key={widgetKey} className="col-span-full lg:col-span-7 p-6 bg-card border border-border/80 rounded-2xl shadow-xs flex flex-col space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-border">
                            <div>
                                <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-indigo-600" />Opportunity & Revenue Velocity
                                </h3>
                                <p className="text-xs text-muted-foreground">Monthly pipeline creation vs closed won revenue.</p>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-semibold">
                                <span className="flex items-center gap-1.5 text-indigo-600"><span className="w-3 h-3 rounded-full bg-indigo-600" /> Pipeline</span>
                                <span className="flex items-center gap-1.5 text-emerald-600"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Revenue</span>
                            </div>
                        </div>
                        <div className="h-72 w-full pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={widgetData.opportunityTrends || []}>
                                    <defs>
                                        <linearGradient id="gPipeline" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} /><stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                    <XAxis dataKey="month" stroke="#6b7280" fontSize={11} tickLine={false} />
                                    <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatShortNumber(v)} />
                                    <Tooltip formatter={(val) => [formatCurrency(val), 'Value']} contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                                    <Area type="monotone" dataKey="pipeline" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#gPipeline)" name="Pipeline" />
                                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#gRevenue)" name="Revenue" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                );

            case 'chart_bar_pipeline_stage':
                return (
                    <div key={widgetKey} className="col-span-full lg:col-span-5 p-6 bg-card border border-border/80 rounded-2xl shadow-xs flex flex-col space-y-4">
                        <div className="pb-3 border-b border-border">
                            <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                                <Layers className="w-4 h-4 text-blue-600" />Pipeline Value by Stage
                            </h3>
                            <p className="text-xs text-muted-foreground">Deal capital distribution across pipeline stages.</p>
                        </div>
                        <div className="h-72 w-full pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={widgetData.pipelineByStage || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                    <XAxis dataKey="stage" stroke="#6b7280" fontSize={11} tickLine={false} />
                                    <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatShortNumber(v)} />
                                    <Tooltip formatter={(val) => [formatCurrency(val), 'Value']} contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                        {(widgetData.pipelineByStage || []).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                );

            case 'chart_bar_deals_company':
                return (
                    <div key={widgetKey} className="col-span-full lg:col-span-7 p-6 bg-card border border-border/80 rounded-2xl shadow-xs flex flex-col space-y-4">
                        <div className="pb-3 border-b border-border">
                            <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-purple-600" />Top Deals by Company
                            </h3>
                            <p className="text-xs text-muted-foreground">Enterprise accounts ordered by contract value.</p>
                        </div>
                        <div className="h-64 w-full pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={widgetData.dealsByCompany || []} margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                                    <XAxis type="number" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatShortNumber(v)} />
                                    <YAxis type="category" dataKey="company" stroke="#475569" fontSize={11} tickLine={false} width={130} />
                                    <Tooltip formatter={(val) => [formatCurrency(val), 'Value']} contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                                    <Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={18} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                );

            case 'chart_donut_lead_sources':
                return (
                    <div key={widgetKey} className="col-span-full lg:col-span-5 p-6 bg-card border border-border/80 rounded-2xl shadow-xs flex flex-col space-y-4">
                        <div className="pb-3 border-b border-border">
                            <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                                <PieIcon className="w-4 h-4 text-amber-500" />Lead Generation Channels
                            </h3>
                            <p className="text-xs text-muted-foreground">Proportion of lead acquisition sources.</p>
                        </div>
                        <div className="h-64 w-full flex items-center justify-center pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={widgetData.leadSources || []} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={5} dataKey="value">
                                        {(widgetData.leadSources || []).map((entry, index) => (
                                            <Cell key={`pie-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(val) => [`${val}%`, 'Share']} contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(val) => <span className="text-xs font-medium text-foreground">{val}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                );

            case 'table_recent_deals':
                return (
                    <div key={widgetKey} className="col-span-full space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-black text-foreground">Recent Opportunities</h3>
                                <p className="text-xs text-muted-foreground">Latest enterprise opportunities in your pipeline.</p>
                            </div>
                            <Button size="sm" variant="outline" className="h-9 text-xs font-bold gap-1.5 cursor-pointer" onClick={() => window.location.href = '/contacts'}>
                                <span>View All</span><ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                        <DataTable
                            data={widgetData.recentDeals || []}
                            columns={dealColumns}
                            searchPlaceholder="Search opportunities..."
                            onRowClick={(deal) => { setSelectedDeal(deal); setDrawerOpen(true); }}
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    // Group widgets for layout
    const kpiWidgets = widgets.filter(w => w.startsWith('kpi_'));
    const chartWidgets = widgets.filter(w => w.startsWith('chart_'));
    const tableWidgets = widgets.filter(w => w.startsWith('table_'));

    return (
        <AppLayout title={dashboard.name || 'Dashboard'}>
            <div className="space-y-6 animate-fade-in pb-8 select-none">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.get('/dashboard')}
                            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div>
                            <h1 className="text-lg font-black text-foreground">{dashboard.name}</h1>
                            {dashboard.description && (
                                <p className="text-xs text-muted-foreground">{dashboard.description}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 text-xs font-bold gap-1.5 cursor-pointer"
                            onClick={() => setShowEditModal(true)}
                        >
                            <Pencil className="w-3.5 h-3.5" /><span>Edit</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 text-xs font-bold gap-1.5 cursor-pointer text-destructive hover:text-destructive"
                            onClick={handleDelete}
                        >
                            <Trash2 className="w-3.5 h-3.5" /><span>Delete</span>
                        </Button>
                    </div>
                </div>

                {/* KPI Row */}
                {kpiWidgets.length > 0 && (
                    <div className={cn("grid gap-4", `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(kpiWidgets.length, 4)}`)}>
                        {kpiWidgets.map(renderWidget)}
                    </div>
                )}

                {/* Charts Grid */}
                {chartWidgets.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {chartWidgets.map(renderWidget)}
                    </div>
                )}

                {/* Table Widgets */}
                {tableWidgets.map(renderWidget)}

                {/* SlideOver Drawer */}
                <SlideOverDrawer
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    title={selectedDeal?.company || "Opportunity Profile"}
                    subtitle={`ID: ${selectedDeal?.id} • ${selectedDeal?.owner}`}
                >
                    {selectedDeal && (
                        <div className="space-y-6 text-xs">
                            <div className="p-4 bg-muted/40 border border-border rounded-xl flex items-center justify-between">
                                <div>
                                    <span className="text-muted-foreground font-mono text-[11px] block uppercase">Contract Target</span>
                                    <div className="text-xl font-black text-foreground font-mono">{selectedDeal.value}</div>
                                </div>
                                <div className="text-right">
                                    <span className="text-muted-foreground font-mono text-[11px] block uppercase">Win Confidence</span>
                                    <div className="text-sm font-black text-indigo-600 font-mono">{selectedDeal.probability}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 border border-border rounded-xl bg-card">
                                    <span className="text-muted-foreground text-[10px] block">Contact</span>
                                    <span className="font-bold text-foreground">{selectedDeal.contact}</span>
                                </div>
                                <div className="p-3 border border-border rounded-xl bg-card">
                                    <span className="text-muted-foreground text-[10px] block">Stage</span>
                                    <span className="font-bold text-foreground">{selectedDeal.stage}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </SlideOverDrawer>

                {/* ── EDIT MODAL ── */}
                {showEditModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowEditModal(false)}>
                        <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 m-4 max-h-[85vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h2 className="text-base font-black text-foreground">Edit Dashboard</h2>
                                    <p className="text-xs text-muted-foreground mt-0.5">Update name, description, or widgets.</p>
                                </div>
                                <button onClick={() => setShowEditModal(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">Dashboard Name</label>
                                    <input
                                        type="text" value={editForm.data.name} onChange={(e) => editForm.setData('name', e.target.value)}
                                        required className="w-full h-10 px-3.5 text-sm bg-transparent border border-border focus:border-indigo-600 rounded-xl text-foreground placeholder:text-muted-foreground transition-all outline-none font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">Description</label>
                                    <input
                                        type="text" value={editForm.data.description || ''} onChange={(e) => editForm.setData('description', e.target.value)}
                                        className="w-full h-10 px-3.5 text-sm bg-transparent border border-border focus:border-indigo-600 rounded-xl text-foreground placeholder:text-muted-foreground transition-all outline-none font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">Widgets</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {availableWidgets.map((widget) => {
                                            const isSelected = editForm.data.widgets.includes(widget.key);
                                            const Icon = WIDGET_ICONS[widget.key] || BarChart3;
                                            const colorClass = WIDGET_COLORS[widget.key] || 'text-slate-500 bg-slate-500/10';
                                            return (
                                                <button key={widget.key} type="button" onClick={() => toggleWidget(widget.key)}
                                                    className={cn("flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer",
                                                        isSelected ? "border-indigo-500/50 bg-indigo-500/5" : "border-border/60 hover:border-border hover:bg-muted/30"
                                                    )}>
                                                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", colorClass)}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-xs font-bold text-foreground block">{widget.label}</span>
                                                        <span className="text-[10px] text-muted-foreground">{widget.category}</span>
                                                    </div>
                                                    <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
                                                        isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-border"
                                                    )}>
                                                        {isSelected && <Check className="w-3 h-3" />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 pt-2">
                                    <Button type="submit" disabled={editForm.processing || editForm.data.widgets.length === 0}
                                        className="flex-1 h-10 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer gap-1.5">
                                        <Check className="w-4 h-4" /><span>Save Changes</span>
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} className="h-10 text-xs font-bold cursor-pointer">Cancel</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
