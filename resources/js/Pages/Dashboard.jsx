import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import DataTable from '@/Components/DataTable';
import SlideOverDrawer from '@/Components/SlideOverDrawer';
import { 
    TrendingUp, DollarSign, Briefcase, PieChart as PieIcon, 
    ArrowUpRight, ArrowRight, ShieldCheck, Sparkles, Building2, 
    Layers, Target, Award, ArrowUp, ArrowDown
} from 'lucide-react';
import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, 
    BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Button } from '@/Components/ui/button';

export default function Dashboard({ 
    stats = {}, 
    opportunityTrends = [], 
    pipelineByStage = [], 
    dealsByCompany = [], 
    leadSources = [], 
    recentDeals = [] 
}) {
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Format currency helpers
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount || 0);
    };

    const formatShortNumber = (val) => {
        if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
        return `$${val}`;
    };

    // Columns for Recent Opportunities Data Table
    const columns = [
        { 
            key: 'id', 
            label: 'ID', 
            render: (val) => <span className="font-mono text-muted-foreground font-semibold text-xs">{val}</span> 
        },
        { 
            key: 'company', 
            label: 'Company / Account', 
            render: (val, row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-foreground text-xs">{val}</span>
                    <span className="text-[11px] text-muted-foreground">{row.name}</span>
                </div>
            ) 
        },
        { 
            key: 'contact', 
            label: 'Primary Contact',
            render: (val) => <span className="text-xs font-medium text-foreground">{val}</span>
        },
        { 
            key: 'value', 
            label: 'Deal Value', 
            align: 'right', 
            render: (val) => <span className="font-extrabold text-foreground font-mono text-xs">{val}</span> 
        },
        { 
            key: 'probability', 
            label: 'Win Probability', 
            align: 'center',
            render: (val) => (
                <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>{val}</span>
                </span>
            )
        },
        { 
            key: 'stage', 
            label: 'Pipeline Stage',
            render: (val, row) => (
                <span 
                    className="px-2.5 py-0.5 rounded-md text-[11px] font-bold text-white shadow-2xs"
                    style={{ backgroundColor: row.stage_color || '#6366f1' }}
                >
                    {val}
                </span>
            )
        },
        { key: 'owner', label: 'Owner', render: (val) => <span className="text-xs text-muted-foreground font-medium">{val}</span> }
    ];

    const handleRowClick = (deal) => {
        setSelectedDeal(deal);
        setDrawerOpen(true);
    };

    return (
        <AppLayout title="Analytics & Revenue Telemetry">
            <div className="space-y-6 animate-fade-in pb-8 select-none">
                
                {/* ── 1. KPI HIGHLIGHT CARDS (4 Essential Metrics) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Total Pipeline Value */}
                    <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-xs flex flex-col justify-between hover:border-indigo-500/40 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Pipeline Value</span>
                            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                                <DollarSign className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-2xl font-black text-foreground font-mono tracking-tight">
                                {formatCurrency(stats.total_pipeline)}
                            </div>
                            <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                                <ArrowUp className="w-3.5 h-3.5" />
                                <span>+14.2%</span>
                                <span className="text-muted-foreground font-normal text-[11px]">vs last month</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Won Revenue */}
                    <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-xs flex flex-col justify-between hover:border-emerald-500/40 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Closed Won Revenue</span>
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                <Award className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-2xl font-black text-foreground font-mono tracking-tight">
                                {formatCurrency(stats.won_revenue)}
                            </div>
                            <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                                <ArrowUp className="w-3.5 h-3.5" />
                                <span>+22.8%</span>
                                <span className="text-muted-foreground font-normal text-[11px]">target achieved</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Active Opportunities */}
                    <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-xs flex flex-col justify-between hover:border-blue-500/40 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Opportunities</span>
                            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                <Briefcase className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-2xl font-black text-foreground font-mono tracking-tight">
                                {stats.active_deals} <span className="text-xs text-muted-foreground font-sans font-normal">Deals</span>
                            </div>
                            <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                                <Target className="w-3.5 h-3.5" />
                                <span>Avg. Size {formatShortNumber(stats.avg_deal_size)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Win Rate % */}
                    <div className="p-5 bg-card border border-border/80 rounded-2xl shadow-xs flex flex-col justify-between hover:border-amber-500/40 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sales Win Rate</span>
                            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-2xl font-black text-foreground font-mono tracking-tight">
                                {stats.win_rate}%
                            </div>
                            <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>High Conversion Velocity</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── 2. CHARTS SECTION GRID 1: Wave Opportunity Trend + Pipeline by Stage ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Opportunity & Revenue Wave Trend (Line / Smooth Area Chart) */}
                    <div className="lg:col-span-7 p-6 bg-card border border-border/80 rounded-2xl shadow-xs flex flex-col justify-between space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-border">
                            <div>
                                <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                                    Opportunity & Revenue Velocity
                                </h3>
                                <p className="text-xs text-muted-foreground">Monthly pipeline creation vs closed won revenue wave trend.</p>
                            </div>

                            <div className="flex items-center gap-3 text-xs font-semibold">
                                <span className="flex items-center gap-1.5 text-indigo-600">
                                    <span className="w-3 h-3 rounded-full bg-indigo-600" /> Pipeline ($)
                                </span>
                                <span className="flex items-center gap-1.5 text-emerald-600">
                                    <span className="w-3 h-3 rounded-full bg-emerald-500" /> Won Revenue ($)
                                </span>
                            </div>
                        </div>

                        {/* Smooth Wave Chart */}
                        <div className="h-72 w-full pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={opportunityTrends}>
                                    <defs>
                                        <linearGradient id="colorPipeline" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                                        </linearGradient>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                    <XAxis dataKey="month" stroke="#6b7280" fontSize={11} tickLine={false} />
                                    <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatShortNumber(v)} />
                                    <Tooltip 
                                        formatter={(val) => [formatCurrency(val), 'Value']}
                                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                                    />
                                    <Area type="monotone" dataKey="pipeline" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorPipeline)" name="Pipeline Created" />
                                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Won Revenue" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Pipeline Value by Stage (Bar Chart) */}
                    <div className="lg:col-span-5 p-6 bg-card border border-border/80 rounded-2xl shadow-xs flex flex-col justify-between space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-border">
                            <div>
                                <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-blue-600" />
                                    Pipeline Value by Stage
                                </h3>
                                <p className="text-xs text-muted-foreground">Distribution of deal capital locked across active stages.</p>
                            </div>
                        </div>

                        {/* Stage Bar Chart */}
                        <div className="h-72 w-full pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={pipelineByStage}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                    <XAxis dataKey="stage" stroke="#6b7280" fontSize={11} tickLine={false} />
                                    <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatShortNumber(v)} />
                                    <Tooltip 
                                        formatter={(val) => [formatCurrency(val), 'Stage Value']}
                                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                        {pipelineByStage.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* ── 3. CHARTS SECTION GRID 2: Deals by Company + Lead Source Distribution ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Deals by Company (Horizontal Bar Chart) */}
                    <div className="lg:col-span-7 p-6 bg-card border border-border/80 rounded-2xl shadow-xs flex flex-col justify-between space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-border">
                            <div>
                                <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-purple-600" />
                                    Top Deals by Company
                                </h3>
                                <p className="text-xs text-muted-foreground">Enterprise accounts ordered by high contract target value.</p>
                            </div>
                        </div>

                        {/* Company Horizontal Bar Chart */}
                        <div className="h-64 w-full pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={dealsByCompany} margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                                    <XAxis type="number" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatShortNumber(v)} />
                                    <YAxis type="category" dataKey="company" stroke="#475569" fontSize={11} tickLine={false} width={130} />
                                    <Tooltip 
                                        formatter={(val) => [formatCurrency(val), 'Target Value']}
                                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                                    />
                                    <Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={18} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Lead Sources Distribution (Donut / Pie Chart) */}
                    <div className="lg:col-span-5 p-6 bg-card border border-border/80 rounded-2xl shadow-xs flex flex-col justify-between space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-border">
                            <div>
                                <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                                    <PieIcon className="w-4 h-4 text-amber-500" />
                                    Lead Generation Channels
                                </h3>
                                <p className="text-xs text-muted-foreground">Proportion of inbound lead acquisition sources.</p>
                            </div>
                        </div>

                        {/* Donut Chart */}
                        <div className="h-64 w-full flex items-center justify-center pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={leadSources}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={85}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {leadSources.map((entry, index) => (
                                            <Cell key={`cell-pie-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(val) => [`${val}%`, 'Lead Share']}
                                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                                    />
                                    <Legend 
                                        verticalAlign="bottom" 
                                        height={36} 
                                        iconType="circle"
                                        formatter={(val) => <span className="text-xs font-medium text-foreground">{val}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* ── 4. RECENT OPPORTUNITIES & DEALS DATA TABLE ── */}
                <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-black text-foreground">High-Value Opportunities</h3>
                            <p className="text-xs text-muted-foreground">Latest enterprise opportunities queued in your sales pipeline.</p>
                        </div>
                        <Button size="sm" variant="outline" className="h-9 text-xs font-bold gap-1.5 cursor-pointer" onClick={() => window.location.href='/contacts'}>
                            <span>View All Pipeline</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                    </div>

                    <DataTable 
                        data={recentDeals} 
                        columns={columns} 
                        searchPlaceholder="Search opportunities or companies..."
                        onRowClick={handleRowClick}
                    />
                </div>

                {/* SlideOver Drawer for Opportunity Detail View */}
                <SlideOverDrawer 
                    open={drawerOpen} 
                    onClose={() => setDrawerOpen(false)}
                    title={selectedDeal?.company || "Opportunity Profile"}
                    subtitle={`Opportunity ID: ${selectedDeal?.id} • Managed by ${selectedDeal?.owner}`}
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

                            <div className="space-y-3">
                                <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] text-muted-foreground">Opportunity Telemetry</h4>
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div className="p-3 border border-border rounded-xl bg-card">
                                        <span className="text-muted-foreground text-[10px] block">Primary Contact</span>
                                        <span className="font-bold text-foreground">{selectedDeal.contact}</span>
                                    </div>
                                    <div className="p-3 border border-border rounded-xl bg-card">
                                        <span className="text-muted-foreground text-[10px] block">Pipeline Stage</span>
                                        <span className="font-bold text-foreground">{selectedDeal.stage}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] text-muted-foreground">Created Date</h4>
                                <div className="p-3 border border-border rounded-xl bg-card font-mono font-semibold text-foreground">
                                    {selectedDeal.created_at}
                                </div>
                            </div>
                        </div>
                    )}
                </SlideOverDrawer>

            </div>
        </AppLayout>
    );
}
