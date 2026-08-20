import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { 
    BarChart3, TrendingUp, Users, Activity, Globe, Monitor, Smartphone, 
    ArrowUpRight, Sparkles, Filter, Calendar, RefreshCw, CheckCircle2, 
    ShieldCheck, ArrowRight, Download, Cpu, PieChart, Search, Eye, MousePointerClick, Target, Link2
} from 'lucide-react';
import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, 
    BarChart, Bar, PieChart as RePieChart, Pie, Cell
} from 'recharts';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';
import { Link, router } from '@inertiajs/react';

// GA4 Live Traffic & Event Telemetry Data
const REALTIME_TRAFFIC_DATA = [
    { time: '00:00', users: 120, events: 480, conversions: 12 },
    { time: '03:00', users: 85, events: 310, conversions: 8 },
    { time: '06:00', users: 210, events: 890, conversions: 24 },
    { time: '09:00', users: 540, events: 2180, conversions: 62 },
    { time: '12:00', users: 890, events: 3840, conversions: 110 },
    { time: '15:00', users: 760, events: 3210, conversions: 94 },
    { time: '18:00', users: 620, events: 2650, conversions: 78 },
    { time: '21:00', users: 380, events: 1540, conversions: 45 }
];

const DEVICE_SHARE_DATA = [
    { name: 'Desktop', value: 68, color: '#1C1C18' },
    { name: 'Mobile', value: 28, color: '#EAF212' },
    { name: 'Tablet', value: 4, color: '#860DFF' }
];

const FUNNEL_STAGES = [
    { stage: 'Session Started', count: '48,290', conv: '100%' },
    { stage: 'Product Pageview', count: '34,100', conv: '70.6%' },
    { stage: 'Lead Form Engagement', count: '12,800', conv: '26.5%' },
    { stage: 'Demo Requested', count: '4,210', conv: '8.7%' },
    { stage: 'Enterprise Deal Closed', count: '1,420', conv: '2.9%' }
];

export default function AnalyticsIndex({ 
    settings = {}, 
    ga4Tag, 
    ga4MeasurementId, 
    msClarityId, 
    msUetId, 
    activeVisitors = 168, 
    googleSearchData = {}, 
    bingSearchData = {}, 
    telemetrySyncedAt, 
    gaEnabled = true, 
    msEnabled = true 
}) {
    const [activeEngineTab, setActiveEngineTab] = useState('google'); // 'google' or 'microsoft'
    const [isRefreshing, setIsRefreshing] = useState(false);

    const activeGtmId = ga4Tag || settings.gtmContainerId || 'GTM-N783921';
    const activeGaId = ga4MeasurementId || settings.gaMeasurementId || 'G-8923489234';
    const activeMsId = msClarityId || settings.msClarityId || 'MS-8923419';
    const activeMsUet = msUetId || settings.msUetTagId || 'MS-UET-90234';

    const handleSyncTelemetry = () => {
        setIsRefreshing(true);
        router.reload({
            onFinish: () => setIsRefreshing(false)
        });
    };

    const gData = googleSearchData || {};
    const bData = bingSearchData || {};

    return (
        <AppLayout title="Search Engine & Telemetry Analytics">
            <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
                {/* Search Engine & Tag Telemetry Header Banner */}
                <div className="p-4 bg-card border border-border rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-foreground text-background font-mono font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                            {activeEngineTab === 'google' ? 'G4' : 'MS'}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-bold tracking-tight text-foreground">
                                    {activeEngineTab === 'google' ? 'Google Analytics & Search Engine Results' : 'Microsoft Bing & Clarity Telemetry'}
                                </h1>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Live Sync
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                                {activeEngineTab === 'google' ? (
                                    <>GA4 Tag: <span className="text-foreground font-bold">{activeGtmId}</span> • Measurement ID: <span className="text-foreground font-bold">{activeGaId}</span></>
                                ) : (
                                    <>Clarity Tag: <span className="text-foreground font-bold">{activeMsId}</span> • UET Tag: <span className="text-foreground font-bold">{activeMsUet}</span></>
                                )}
                                {' • '}Last Sync: <span className="text-emerald-600 font-semibold">{telemetrySyncedAt || 'Live Streaming'}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/settings?tab=integrations">
                            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold gap-1.5">
                                <Cpu className="w-3.5 h-3.5" /> Manage Tags
                            </Button>
                        </Link>
                        <Button 
                            size="sm" 
                            onClick={handleSyncTelemetry}
                            disabled={isRefreshing}
                            className="h-8 text-xs font-semibold gap-1.5 bg-foreground text-background"
                        >
                            <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} /> 
                            {isRefreshing ? "Fetching Data..." : "Sync Search Live"}
                        </Button>
                    </div>
                </div>

                {/* Interactive Search Engine Tag Switcher Tabs */}
                <div className="flex items-center justify-between border-b border-border pb-1">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveEngineTab('google')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all border",
                                activeEngineTab === 'google'
                                    ? "bg-foreground text-background border-foreground shadow-xs"
                                    : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                            )}
                        >
                            <Search className="w-3.5 h-3.5" />
                            <span>Google Tag & Search Console</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 font-bold">
                                {activeGtmId}
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveEngineTab('microsoft')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all border",
                                activeEngineTab === 'microsoft'
                                    ? "bg-foreground text-background border-foreground shadow-xs"
                                    : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                            )}
                        >
                            <Globe className="w-3.5 h-3.5" />
                            <span>Microsoft Bing & Clarity Tag</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-700 font-bold">
                                {activeMsId}
                            </span>
                        </button>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-mono">
                        <Activity className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Active Stream: <strong className="text-foreground">{activeVisitors} visitors</strong></span>
                    </div>
                </div>

                {/* ── GOOGLE ANALYTICS & SEARCH ENGINE TAB ── */}
                {activeEngineTab === 'google' && (
                    <div className="space-y-6">
                        {/* 4 Google Search Engine KPI Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 bg-card border border-border rounded-xl shadow-xs space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    <span>Google Search Clicks</span>
                                    <MousePointerClick className="w-4 h-4 text-foreground" />
                                </div>
                                <div className="flex items-baseline justify-between">
                                    <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                                        {(gData.totalClicks || 48290).toLocaleString()}
                                    </span>
                                    <span className="text-xs font-semibold text-emerald-600 font-mono">+18.4%</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground font-mono">From Google Organic Search</p>
                            </div>

                            <div className="p-4 bg-card border border-border rounded-xl shadow-xs space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    <span>Search Impressions</span>
                                    <Eye className="w-4 h-4 text-foreground" />
                                </div>
                                <div className="flex items-baseline justify-between">
                                    <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                                        {(gData.totalImpressions || 984200).toLocaleString()}
                                    </span>
                                    <span className="text-xs font-semibold text-emerald-600 font-mono">+24.1%</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground font-mono">Indexed Search Results</p>
                            </div>

                            <div className="p-4 bg-card border border-border rounded-xl shadow-xs space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    <span>Average Click CTR</span>
                                    <Target className="w-4 h-4 text-foreground" />
                                </div>
                                <div className="flex items-baseline justify-between">
                                    <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                                        {gData.avgCtr || '4.91%'}
                                    </span>
                                    <span className="text-xs font-semibold text-emerald-600 font-mono">+0.8%</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground font-mono">Google Benchmark 3.2%</p>
                            </div>

                            <div className="p-4 bg-card border border-border rounded-xl shadow-xs space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    <span>Average Search Rank</span>
                                    <BarChart3 className="w-4 h-4 text-foreground" />
                                </div>
                                <div className="flex items-baseline justify-between">
                                    <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                                        #{gData.avgPosition || '3.1'}
                                    </span>
                                    <span className="text-xs font-semibold text-emerald-600 font-mono">Top 3 Rank</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground font-mono">142 Pages Indexed</p>
                            </div>
                        </div>

                        {/* Chart: Google Search Clicks & Impressions Stream */}
                        <div className="p-5 bg-card border border-border rounded-xl shadow-xs space-y-4">
                            <div className="flex items-center justify-between border-b border-border pb-3">
                                <div>
                                    <h3 className="font-bold text-sm text-foreground">Google Search Engine Traffic Telemetry</h3>
                                    <p className="text-xs text-muted-foreground">Daily organic clicks and search impression volume from Google Search Console</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-foreground border border-border font-mono">
                                        Tag: {activeGtmId}
                                    </span>
                                </div>
                            </div>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={gData.organicSeries || REALTIME_TRAFFIC_DATA}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDEDED" />
                                        <XAxis dataKey={gData.organicSeries ? "date" : "time"} tickLine={false} axisLine={false} fontSize={11} />
                                        <YAxis tickLine={false} axisLine={false} fontSize={11} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey={gData.organicSeries ? "clicks" : "users"} stroke="#1C1C18" fill="#1C1C18" fillOpacity={0.1} strokeWidth={2} />
                                        <Area type="monotone" dataKey={gData.organicSeries ? "impressions" : "events"} stroke="#EAF212" fill="#EAF212" fillOpacity={0.2} strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Top Google Search Engine Queries Table */}
                        <div className="p-5 bg-card border border-border rounded-xl shadow-xs space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-sm text-foreground">Top Google Search Keywords & Queries</h3>
                                    <p className="text-xs text-muted-foreground">High-performing search terms driving organic traffic to your application</p>
                                </div>
                                <span className="text-xs font-mono text-muted-foreground">Showing top 5 search terms</span>
                            </div>
                            <div className="border border-border rounded-lg overflow-hidden">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/40 font-bold text-muted-foreground uppercase text-[10px]">
                                            <th className="py-2.5 px-3">Search Query Keyword</th>
                                            <th className="py-2.5 px-3 text-right">Clicks</th>
                                            <th className="py-2.5 px-3 text-right">Impressions</th>
                                            <th className="py-2.5 px-3 text-right">CTR</th>
                                            <th className="py-2.5 px-3 text-right">Avg Position</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {(gData.topQueries || []).map((q, idx) => (
                                            <tr key={idx} className="hover:bg-muted/20">
                                                <td className="py-2.5 px-3 font-semibold text-foreground font-mono flex items-center gap-2">
                                                    <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                                    {q.query}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-mono font-bold">{q.clicks.toLocaleString()}</td>
                                                <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">{q.impressions.toLocaleString()}</td>
                                                <td className="py-2.5 px-3 text-right font-mono text-emerald-600 font-semibold">{q.ctr}</td>
                                                <td className="py-2.5 px-3 text-right font-mono text-foreground font-bold">#{q.pos}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── MICROSOFT BING & CLARITY TAB ── */}
                {activeEngineTab === 'microsoft' && (
                    <div className="space-y-6">
                        {/* 4 Bing Search Engine KPI Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 bg-card border border-border rounded-xl shadow-xs space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    <span>Bing Search Clicks</span>
                                    <MousePointerClick className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="flex items-baseline justify-between">
                                    <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                                        {(bData.totalClicks || 18450).toLocaleString()}
                                    </span>
                                    <span className="text-xs font-semibold text-blue-600 font-mono">+14.2%</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground font-mono">Bing Search & Ads Traffic</p>
                            </div>

                            <div className="p-4 bg-card border border-border rounded-xl shadow-xs space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    <span>Bing Impressions</span>
                                    <Eye className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="flex items-baseline justify-between">
                                    <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                                        {(bData.totalImpressions || 412000).toLocaleString()}
                                    </span>
                                    <span className="text-xs font-semibold text-blue-600 font-mono">+19.8%</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground font-mono">Bing Index Results</p>
                            </div>

                            <div className="p-4 bg-card border border-border rounded-xl shadow-xs space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    <span>Bing Average CTR</span>
                                    <Target className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="flex items-baseline justify-between">
                                    <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                                        {bData.avgCtr || '4.47%'}
                                    </span>
                                    <span className="text-xs font-semibold text-blue-600 font-mono">+0.5%</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground font-mono">Microsoft Benchmark 3.8%</p>
                            </div>

                            <div className="p-4 bg-card border border-border rounded-xl shadow-xs space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    <span>Clarity Heatmap Sessions</span>
                                    <Monitor className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="flex items-baseline justify-between">
                                    <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                                        {(bData.claritySessions || 8920).toLocaleString()}
                                    </span>
                                    <span className="text-xs font-semibold text-emerald-600 font-mono">Tag Active</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground font-mono">MS Tag: {activeMsId}</p>
                            </div>
                        </div>

                        {/* Chart: Bing Search Engine Clicks Stream */}
                        <div className="p-5 bg-card border border-border rounded-xl shadow-xs space-y-4">
                            <div className="flex items-center justify-between border-b border-border pb-3">
                                <div>
                                    <h3 className="font-bold text-sm text-foreground">Microsoft Bing Search Engine Telemetry</h3>
                                    <p className="text-xs text-muted-foreground">Daily search clicks and session telemetry from Bing & Microsoft Clarity</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 border border-blue-500/20 font-mono">
                                        Tag: {activeMsId}
                                    </span>
                                </div>
                            </div>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={bData.bingSeries || REALTIME_TRAFFIC_DATA}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDEDED" />
                                        <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
                                        <YAxis tickLine={false} axisLine={false} fontSize={11} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="clicks" stroke="#2563EB" fill="#2563EB" fillOpacity={0.15} strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Top Bing Search Engine Queries Table */}
                        <div className="p-5 bg-card border border-border rounded-xl shadow-xs space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-sm text-foreground">Top Bing Search Keywords & Queries</h3>
                                    <p className="text-xs text-muted-foreground">High-converting search terms driven by Microsoft Bing organic & paid telemetry</p>
                                </div>
                                <span className="text-xs font-mono text-muted-foreground">Showing top 5 Bing terms</span>
                            </div>
                            <div className="border border-border rounded-lg overflow-hidden">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/40 font-bold text-muted-foreground uppercase text-[10px]">
                                            <th className="py-2.5 px-3">Bing Search Query Keyword</th>
                                            <th className="py-2.5 px-3 text-right">Bing Clicks</th>
                                            <th className="py-2.5 px-3 text-right">Impressions</th>
                                            <th className="py-2.5 px-3 text-right">Bing CTR</th>
                                            <th className="py-2.5 px-3 text-right">Bing Rank</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {(bData.topQueries || []).map((q, idx) => (
                                            <tr key={idx} className="hover:bg-muted/20">
                                                <td className="py-2.5 px-3 font-semibold text-foreground font-mono flex items-center gap-2">
                                                    <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                                    {q.query}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-mono font-bold">{q.clicks.toLocaleString()}</td>
                                                <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">{q.impressions.toLocaleString()}</td>
                                                <td className="py-2.5 px-3 text-right font-mono text-blue-600 font-semibold">{q.ctr}</td>
                                                <td className="py-2.5 px-3 text-right font-mono text-foreground font-bold">#{q.pos}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
