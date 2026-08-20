import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';
import {
    TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Layers, 
    Sparkles, CheckCircle2, Shield, Search, Plus, FileText, Download, Moon, Sun, Filter
} from 'lucide-react';

export default function DesignSystem() {
    const [darkMode, setDarkMode] = useState(false);

    const toggleTheme = () => {
        setDarkMode(prev => {
            const next = !prev;
            if (next) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            return next;
        });
    };

    return (
        <AppLayout title="Enterprise Visual Design System">
            <div className="space-y-8 max-w-7xl mx-auto font-sans">
                {/* ── HEADER BANNER ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-card border border-border rounded-2xl shadow-xs">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                $100M+ Enterprise Design System
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground">
                                Inter + Tabular Numerals
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                            Financial Intelligence & OS Visual Specification
                        </h1>
                        <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
                            90% Neutral Chrome · 5% Functional Color · 5% Data Visualization Energy · High Information Density.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={toggleTheme}
                            className="text-xs font-semibold gap-2 border-border"
                        >
                            {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
                            <span>{darkMode ? "Light Mode (#F7F7F5)" : "Dark Mode (#111111)"}</span>
                        </Button>
                    </div>
                </div>

                {/* ── SECTION 1: EXECUTIVE KPI MODULES WITH SPARKLINES ── */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            1. Executive KPI Modules (Dense & Quiet Chrome)
                        </h2>
                        <span className="text-[11px] font-mono text-muted-foreground">Inter Tabular Numerals</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* KPI 1: Annual Recurring Revenue */}
                        <Card className="border-border p-4 bg-card shadow-xs">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Annual Recurring Revenue</span>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-foreground">ARR</span>
                            </div>
                            <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
                                $120.4M
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1 text-emerald-600 font-semibold tabular-nums">
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    <span>↑ 18.4%</span>
                                    <span className="text-[10px] font-normal text-muted-foreground">vs prev period</span>
                                </div>
                                {/* Subtle SVG Sparkline */}
                                <svg className="w-16 h-6 text-emerald-500 overflow-visible" viewBox="0 0 60 20" fill="none">
                                    <path d="M0 16 L12 12 L24 14 L36 8 L48 10 L60 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M0 16 L12 12 L24 14 L36 8 L48 10 L60 2 L60 20 L0 20 Z" fill="currentColor" fillOpacity="0.1" />
                                </svg>
                            </div>
                        </Card>

                        {/* KPI 2: Net Profit Margin */}
                        <Card className="border-border p-4 bg-card shadow-xs">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>EBITDA Margin</span>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-foreground">Q3 YTD</span>
                            </div>
                            <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
                                24.8%
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1 text-emerald-600 font-semibold tabular-nums">
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    <span>↑ 3.2%</span>
                                    <span className="text-[10px] font-normal text-muted-foreground">vs target</span>
                                </div>
                                <svg className="w-16 h-6 text-blue-500 overflow-visible" viewBox="0 0 60 20" fill="none">
                                    <path d="M0 14 L12 15 L24 10 L36 12 L48 6 L60 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </div>
                        </Card>

                        {/* KPI 3: Net Revenue Retention */}
                        <Card className="border-border p-4 bg-card shadow-xs">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Net Revenue Retention</span>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-foreground">NRR</span>
                            </div>
                            <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
                                114.2%
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1 text-emerald-600 font-semibold tabular-nums">
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    <span>↑ 2.1%</span>
                                    <span className="text-[10px] font-normal text-muted-foreground">vs Q2</span>
                                </div>
                                <svg className="w-16 h-6 text-emerald-500 overflow-visible" viewBox="0 0 60 20" fill="none">
                                    <path d="M0 18 L15 14 L30 15 L45 8 L60 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </div>
                        </Card>

                        {/* KPI 4: Operating Cash Reserve */}
                        <Card className="border-border p-4 bg-card shadow-xs">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Operating Cash Reserves</span>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-foreground">TREASURY</span>
                            </div>
                            <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
                                $38.9M
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1 text-amber-600 font-semibold tabular-nums">
                                    <TrendingDown className="w-3.5 h-3.5" />
                                    <span>↓ 1.4%</span>
                                    <span className="text-[10px] font-normal text-muted-foreground">tax payment</span>
                                </div>
                                <svg className="w-16 h-6 text-amber-500 overflow-visible" viewBox="0 0 60 20" fill="none">
                                    <path d="M0 4 L15 6 L30 12 L45 10 L60 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* ── SECTION 2: COLOR SYSTEM & TYPOGRAPHY MATRIX ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Typography Scale */}
                    <Card className="border-border">
                        <CardHeader className="py-3 px-4 border-b border-border bg-muted/20">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                                Typography Hierarchy (Inter Standard)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div>
                                <div className="text-[10px] font-mono text-muted-foreground uppercase">Display / Executive KPI (600–700 Weight)</div>
                                <div className="text-2xl font-bold text-foreground tabular-nums">$24,850,000</div>
                            </div>
                            <div className="pt-2 border-t border-border/40">
                                <div className="text-[10px] font-mono text-muted-foreground uppercase">Page Title (24–30px, Weight 600)</div>
                                <div className="text-xl font-semibold text-foreground">Enterprise Revenue Operations</div>
                            </div>
                            <div className="pt-2 border-t border-border/40">
                                <div className="text-[10px] font-mono text-muted-foreground uppercase">Section Title (15–18px, Weight 600)</div>
                                <div className="text-sm font-semibold text-foreground">Quarterly Financial Performance</div>
                            </div>
                            <div className="pt-2 border-t border-border/40">
                                <div className="text-[10px] font-mono text-muted-foreground uppercase">Body Text (13–15px, Weight 400–450)</div>
                                <div className="text-xs text-foreground leading-relaxed">
                                    The central company operating system aggregates real-time signals across revenue pipelines, customer health metrics, global payroll, and treasury cash balances.
                                </div>
                            </div>
                            <div className="pt-2 border-t border-border/40">
                                <div className="text-[10px] font-mono text-muted-foreground uppercase">Metadata (11–12px, Muted Gray)</div>
                                <div className="text-[11px] text-muted-foreground">
                                    Last synchronized 4 mins ago · Source: Oracle NetSuite & Salesforce ERP
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Functional Color Palette */}
                    <Card className="border-border">
                        <CardHeader className="py-3 px-4 border-b border-border bg-muted/20">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                                Restrained Palette (90% Neutral / 10% Data)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-2.5 rounded-lg border border-border bg-background">
                                    <div className="text-[10px] font-mono text-muted-foreground">Light Canvas BG</div>
                                    <div className="text-xs font-bold text-foreground">#F7F7F5</div>
                                </div>
                                <div className="p-2.5 rounded-lg border border-border bg-card">
                                    <div className="text-[10px] font-mono text-muted-foreground">Primary Surface</div>
                                    <div className="text-xs font-bold text-foreground">#FFFFFF</div>
                                </div>
                                <div className="p-2.5 rounded-lg border border-border bg-muted">
                                    <div className="text-[10px] font-mono text-muted-foreground">Secondary Surface</div>
                                    <div className="text-xs font-bold text-foreground">#F3F3F1</div>
                                </div>
                                <div className="p-2.5 rounded-lg border border-border bg-foreground text-background">
                                    <div className="text-[10px] font-mono opacity-80">Primary Text</div>
                                    <div className="text-xs font-bold">#171717</div>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-border/40 space-y-2">
                                <div className="text-[10px] font-mono text-muted-foreground uppercase">Functional Data Accent Palette</div>
                                <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                                    <span className="px-2 py-1 rounded bg-[#3157D5] text-white">#3157D5 (Brand Blue)</span>
                                    <span className="px-2 py-1 rounded bg-[#1A9B68] text-white">#1A9B68 (Positive)</span>
                                    <span className="px-2 py-1 rounded bg-[#D98A17] text-white">#D98A17 (Warning)</span>
                                    <span className="px-2 py-1 rounded bg-[#D64B4B] text-white">#D64B4B (Negative)</span>
                                    <span className="px-2 py-1 rounded bg-[#7C5CFC] text-white">#7C5CFC (Secondary Vis)</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── SECTION 3: BUTTON & CONTROL SYSTEM ── */}
                <Card className="border-border">
                    <CardHeader className="py-3 px-4 border-b border-border bg-muted/20">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                            2. Button & Control Hierarchy (Architectural & Compact)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Primary Button */}
                            <Button size="sm" className="h-9 px-4 text-xs font-semibold bg-foreground text-background hover:bg-foreground/90 shadow-xs">
                                <Plus className="w-3.5 h-3.5 mr-1.5" />
                                Create Executive Report
                            </Button>

                            {/* Secondary Button */}
                            <Button size="sm" variant="outline" className="h-9 px-4 text-xs font-semibold border-border bg-card hover:bg-muted text-foreground">
                                <Download className="w-3.5 h-3.5 mr-1.5" />
                                Export CSV
                            </Button>

                            {/* Tertiary Button */}
                            <Button size="sm" variant="ghost" className="h-9 px-3 text-xs font-medium text-muted-foreground hover:text-foreground">
                                View Full Ledger →
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* ── SECTION 4: DENSE ENTERPRISE FINANCIAL TABLE ── */}
                <Card className="border-border">
                    <CardHeader className="py-3 px-4 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                                3. Compact Financial Accounts Table (Tabular Numerals)
                            </CardTitle>
                            <CardDescription className="text-[11px] text-muted-foreground">
                                12–13px typography with clean horizontal borders and right-aligned revenue figures.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button size="xs" variant="outline" className="text-[11px] h-7">
                                <Filter className="w-3 h-3 mr-1" /> Filter
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-left text-xs font-sans border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-muted/40 text-[10px] font-mono uppercase text-muted-foreground">
                                    <th className="py-2.5 px-4 font-semibold">Account / Customer</th>
                                    <th className="py-2.5 px-4 font-semibold text-right">ARR Revenue</th>
                                    <th className="py-2.5 px-4 font-semibold text-right">YoY Growth</th>
                                    <th className="py-2.5 px-4 font-semibold">Health Index</th>
                                    <th className="py-2.5 px-4 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {[
                                    { name: 'Acme Enterprise Holdings Inc.', arr: '$8,450,000', growth: '+24.2%', health: '98/100', status: 'Active' },
                                    { name: 'Nova Global Tech Systems', arr: '$6,820,000', growth: '+18.1%', health: '94/100', status: 'Active' },
                                    { name: 'Vertex BioPharma Labs', arr: '$4,200,000', growth: '+7.4%', health: '82/100', status: 'Renewal Pending' },
                                    { name: 'Apex Logistics Group Worldwide', arr: '$3,950,000', growth: '+31.0%', health: '99/100', status: 'Active' },
                                    { name: 'Starlight Financial Capital', arr: '$2,100,000', growth: '-2.4%', health: '74/100', status: 'Review Required' },
                                ].map((row, idx) => (
                                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                        <td className="py-2.5 px-4 font-medium text-foreground">{row.name}</td>
                                        <td className="py-2.5 px-4 font-semibold text-right text-foreground tabular-nums">{row.arr}</td>
                                        <td className="py-2.5 px-4 font-semibold text-right text-emerald-600 tabular-nums">{row.growth}</td>
                                        <td className="py-2.5 px-4 font-mono text-[11px] text-muted-foreground">{row.health}</td>
                                        <td className="py-2.5 px-4">
                                            <span className={cn(
                                                "text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border",
                                                row.status === 'Active' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                            )}>
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
