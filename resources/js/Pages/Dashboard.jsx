import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import DataTable from '@/Components/DataTable';
import SlideOverDrawer from '@/Components/SlideOverDrawer';
import { 
    TrendingUp, TrendingDown, DollarSign, Users, Contact, HandCoins, 
    Sparkles, ArrowUpRight, AlertTriangle, Activity, ArrowRight, ShieldCheck, 
    Filter, Calendar, ChevronRight, Plus, Download, CheckCircle2, Clock
} from 'lucide-react';
import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, 
    BarChart, Bar, LineChart, Line 
} from 'recharts';
import { cn } from '@/lib/utils';
import { Button } from '@/Components/ui/button';

const KPI_DATA = [
    { label: 'Annual Recurring Revenue', val: '$2,840,500', change: '+18.4%', trend: 'up', sub: 'vs $2.4M last quarter', spark: [40, 55, 62, 70, 85, 98, 110] },
    { label: 'Qualified Enterprise Leads', val: '1,420', change: '+12.1%', trend: 'up', sub: '78% high-intent ICP', spark: [20, 25, 30, 28, 35, 42, 50] },
    { label: 'Pipeline Velocity', val: '14.2 Days', change: '-2.4 Days', trend: 'up', sub: 'Faster close velocity', spark: [25, 22, 20, 18, 16, 15, 14] },
    { label: 'Win Rate Ratio', val: '34.8%', change: '+4.2%', trend: 'up', sub: 'Enterprise benchmark 28%', spark: [28, 30, 29, 32, 33, 34, 35] },
    { label: 'AI Predictive Conversion Score', val: '92 / 100', change: '+5.0', trend: 'up', sub: 'High confidence index', spark: [80, 82, 85, 88, 89, 90, 92] }
];

const ANALYTICS_SERIES = [
    { period: 'Jan', revenue: 180000, leads: 240, deals: 32 },
    { period: 'Feb', revenue: 210000, leads: 280, deals: 38 },
    { period: 'Mar', revenue: 245000, leads: 320, deals: 44 },
    { period: 'Apr', revenue: 290000, leads: 410, deals: 52 },
    { period: 'May', revenue: 340000, leads: 490, deals: 64 },
    { period: 'Jun', revenue: 395000, leads: 580, deals: 78 },
    { period: 'Jul', revenue: 460000, leads: 670, deals: 92 },
    { period: 'Aug', revenue: 520000, leads: 790, deals: 110 }
];

const RECENT_LEADS = [
    { id: 'LD-1092', name: 'Apex Global Technologies', contact: 'Sarah Jenkins', value: '$180,000', score: 96, stage: 'Qualified ICP', status: 'High Intent', owner: 'Alex Rivera' },
    { id: 'LD-1093', name: 'Starlight Financial Systems', contact: 'Marcus Vance', value: '$340,000', score: 92, stage: 'Proposal Sent', status: 'Negotiation', owner: 'Elena Rostova' },
    { id: 'LD-1094', name: 'OmniHealth Solutions', contact: 'David Chen', value: '$95,000', score: 88, stage: 'Demo Scheduled', status: 'In Discovery', owner: 'Marcus Vance' },
    { id: 'LD-1095', name: 'CyberShield Systems', contact: 'Rachel Adams', value: '$420,000', score: 99, stage: 'Contract Legal', status: 'Closing', owner: 'Alex Rivera' },
    { id: 'LD-1096', name: 'Vanguard Capital Partners', contact: 'Michael Scott', value: '$210,000', score: 84, stage: 'Qualified ICP', status: 'Follow Up', owner: 'Elena Rostova' }
];

const ACTIVITY_FEED = [
    { id: 1, title: 'Contract Signed', detail: 'CyberShield Systems approved $420k annual plan.', time: '12m ago', type: 'success' },
    { id: 2, title: 'High-Value Lead Assigned', detail: 'Apex Global ($180k target) assigned to Alex Rivera.', time: '45m ago', type: 'ai' },
    { id: 3, title: 'Payment Confirmed', detail: '$95,000 received for Invoice #INV-2026-88.', time: '2h ago', type: 'info' },
    { id: 4, title: 'AI Anomaly Flag', detail: 'SMB outbound response rate dropped 3.2% in EU region.', time: '4h ago', type: 'warning' }
];

export default function Dashboard() {
    const [selectedLead, setSelectedLead] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const columns = [
        { key: 'id', label: 'ID', render: (val) => <span className="font-mono text-muted-foreground font-medium">{val}</span> },
        { key: 'name', label: 'Account / Lead Name', render: (val) => <span className="font-semibold text-foreground">{val}</span> },
        { key: 'contact', label: 'Primary Contact' },
        { key: 'value', label: 'Contract Value', align: 'right', render: (val) => <span className="font-semibold text-foreground">{val}</span> },
        { 
            key: 'score', 
            label: 'AI Intent', 
            align: 'center',
            render: (val) => (
                <div className="inline-flex items-center gap-1 font-mono font-bold text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>{val}/100</span>
                </div>
            )
        },
        { 
            key: 'stage', 
            label: 'Pipeline Stage',
            render: (val) => (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-muted text-foreground border border-border">
                    {val}
                </span>
            )
        },
        { key: 'owner', label: 'Owner' }
    ];

    const handleRowClick = (lead) => {
        setSelectedLead(lead);
        setDrawerOpen(true);
    };

    return (
        <AppLayout title="Overview Dashboard">
            <div className="space-y-6 animate-fade-in">
                {/* KPI Sparkline Grid (5 Columns High-Density) */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                    {KPI_DATA.map((kpi, idx) => (
                        <div key={idx} className="p-3.5 bg-card border border-border rounded-xl shadow-xs flex flex-col justify-between hover:border-border/80 transition-all">
                            <div>
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{kpi.label}</span>
                                <div className="mt-1 flex items-baseline justify-between gap-2">
                                    <span className="text-lg font-bold tracking-tight text-foreground font-mono">{kpi.val}</span>
                                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                        {kpi.change}
                                    </span>
                                </div>
                                <span className="text-[10px] text-muted-foreground mt-1 block">{kpi.sub}</span>
                            </div>

                            {/* Mini Sparkline Visualization */}
                            <div className="h-7 w-full mt-3">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={kpi.spark.map((v, i) => ({ i, v }))}>
                                        <Line type="monotone" dataKey="v" stroke="#1C1C18" strokeWidth={1.5} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 12-Column Grid: Primary Analytics (8 Cols) + AI Insights (4 Cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Primary Analytics Chart (8 Columns) */}
                    <div className="lg:col-span-8 p-4 bg-card border border-border rounded-xl shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between pb-3 border-b border-border">
                            <div>
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                                    Revenue Telemetry & Lead Acquisition Velocity
                                </h3>
                                <p className="text-xs text-muted-foreground">Monthly ARR expansion vs high-intent lead volume.</p>
                            </div>

                            <div className="flex items-center gap-2 text-xs font-medium font-mono text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-foreground" /> ARR ($)
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Lead Volume
                                </span>
                            </div>
                        </div>

                        {/* Chart Render */}
                        <div className="h-72 w-full pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={ANALYTICS_SERIES}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1C1C18" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#1C1C18" stopOpacity={0.0}/>
                                        </linearGradient>
                                        <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#EAF212" stopOpacity={0.35}/>
                                            <stop offset="95%" stopColor="#EAF212" stopOpacity={0.0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#EDEDED" vertical={false} />
                                    <XAxis dataKey="period" stroke="#71717A" fontSize={11} tickLine={false} />
                                    <YAxis yAxisId="left" stroke="#71717A" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#71717A" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1C1C18', border: 'none', borderRadius: '8px', color: '#FFF', fontSize: '11px' }} />
                                    <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#1C1C18" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                                    <Area yAxisId="right" type="monotone" dataKey="leads" stroke="#EAF212" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* AI Insights & Actions Panel (4 Columns) */}
                    <div className="lg:col-span-4 p-4 bg-card border border-border rounded-xl shadow-xs flex flex-col justify-between space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-border">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                <h3 className="text-sm font-bold text-foreground">AI Intelligence Feed</h3>
                            </div>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 border border-amber-500/20">
                                Live Copilot
                            </span>
                        </div>

                        {/* Insight Cards */}
                        <div className="space-y-3 flex-1 overflow-y-auto">
                            <div className="p-3 bg-muted/30 border border-border rounded-lg text-xs space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-foreground">Revenue Surge Expected</span>
                                    <span className="text-[10px] text-emerald-600 font-bold">+18.4% Confidence</span>
                                </div>
                                <p className="text-muted-foreground text-[11px] leading-relaxed">
                                    Enterprise prospects in Healthcare and Fintech are closing 3.5 days faster than historical benchmark.
                                </p>
                                <div className="pt-1 flex items-center justify-between border-t border-border/40 text-[10px]">
                                    <span className="font-mono text-muted-foreground">Action: Target Enterprise ICP</span>
                                    <button className="font-bold text-foreground hover:underline flex items-center gap-1">
                                        Execute <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-3 bg-muted/30 border border-border rounded-lg text-xs space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-foreground">Deal At Risk Alert</span>
                                    <span className="text-[10px] text-amber-600 font-bold">Priority High</span>
                                </div>
                                <p className="text-muted-foreground text-[11px] leading-relaxed">
                                    Starlight Financial ($340k) proposal review inactive for 4 days. Executive engagement recommended.
                                </p>
                                <div className="pt-1 flex items-center justify-between border-t border-border/40 text-[10px]">
                                    <span className="font-mono text-muted-foreground">Action: Trigger Executive Touch</span>
                                    <button className="font-bold text-foreground hover:underline flex items-center gap-1">
                                        View Deal <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* System Health */}
                        <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                System Health 100%
                            </span>
                            <span className="font-mono text-[10px]">Telemetry Latency 14ms</span>
                        </div>
                    </div>
                </div>

                {/* Priority Enterprise Data Table */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-foreground">High-Priority Enterprise Prospects</h3>
                            <p className="text-xs text-muted-foreground">Accounts sorted by AI Intent Score and contract velocity.</p>
                        </div>
                        <Button size="sm" variant="outline" className="h-8 text-xs font-semibold gap-1.5" onClick={() => window.location.href='/contacts'}>
                            View All Pipeline <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                    </div>

                    <DataTable 
                        data={RECENT_LEADS} 
                        columns={columns} 
                        searchPlaceholder="Search priority accounts..."
                        onRowClick={handleRowClick}
                    />
                </div>

                {/* Drawer Detail */}
                <SlideOverDrawer 
                    open={drawerOpen} 
                    onClose={() => setDrawerOpen(false)}
                    title={selectedLead?.name || "Account Profile"}
                    subtitle={`Lead ID: ${selectedLead?.id} • Assigned to ${selectedLead?.owner}`}
                >
                    {selectedLead && (
                        <div className="space-y-5 text-xs">
                            <div className="p-3 bg-muted/40 border border-border rounded-lg flex items-center justify-between">
                                <div>
                                    <span className="text-muted-foreground font-mono">Contract Target Value</span>
                                    <div className="text-lg font-bold text-foreground font-mono">{selectedLead.value}</div>
                                </div>
                                <div className="text-right">
                                    <span className="text-muted-foreground font-mono">AI Intent Score</span>
                                    <div className="text-sm font-bold text-emerald-600 font-mono">{selectedLead.score}/100</div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">Account Telemetry</h4>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="p-2.5 border border-border rounded-lg bg-card">
                                        <span className="text-muted-foreground text-[10px] block">Primary Contact</span>
                                        <span className="font-semibold text-foreground">{selectedLead.contact}</span>
                                    </div>
                                    <div className="p-2.5 border border-border rounded-lg bg-card">
                                        <span className="text-muted-foreground text-[10px] block">Pipeline Stage</span>
                                        <span className="font-semibold text-foreground">{selectedLead.stage}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">Recent Activity History</h4>
                                <div className="space-y-2">
                                    <div className="p-2.5 border border-border/80 rounded-lg text-xs bg-muted/20 flex gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-semibold text-foreground">Executive Demo Completed</span>
                                            <p className="text-muted-foreground text-[11px]">Met with VP of Engineering. Technical requirements approved.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </SlideOverDrawer>
            </div>
        </AppLayout>
    );
}
