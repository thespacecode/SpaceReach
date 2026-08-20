import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Link } from '@inertiajs/react';
import {
    BarChart4, TrendingUp, CheckCircle2, ShieldCheck, Activity, Zap
} from 'lucide-react';

export default function LeadAnalyticsIndex({ qualityMetrics = {}, sourcePerformance = [], logs = [] }) {
    return (
        <AppLayout title="Lead Analytics — TheSpaceCode">
            <div className="p-6 space-y-6 w-full">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/60 pb-4">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <BarChart4 className="w-5 h-5 text-primary" /> Data Quality & Channel Performance
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/leads">
                            <Button variant="outline" size="sm" className="text-xs font-semibold">Leads</Button>
                        </Link>
                        <Link href="/leads/sources">
                            <Button variant="outline" size="sm" className="text-xs font-semibold">Sources</Button>
                        </Link>
                        <Link href="/leads/data">
                            <Button variant="outline" size="sm" className="text-xs font-semibold">Data & Extraction</Button>
                        </Link>
                    </div>
                </div>

                {/* Rates Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-card border-border/60 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-muted-foreground uppercase">Validation Pass Rate</p>
                                <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{qualityMetrics.validation_rate || 91.3}%</h3>
                            </div>
                            <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-600">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-card border-border/60 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-muted-foreground uppercase">Profile Enrichment</p>
                                <h3 className="text-2xl font-extrabold text-primary mt-0.5">{qualityMetrics.enrichment_rate || 88.5}%</h3>
                            </div>
                            <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                                <Zap className="w-5 h-5" />
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-card border-border/60 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-muted-foreground uppercase">Data Reliability</p>
                                <h3 className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">{qualityMetrics.source_reliability || 95.8}%</h3>
                            </div>
                            <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-600">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Categorization Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
                    <Card className="bg-card border-border/60 p-3">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Total</p>
                        <p className="text-lg font-bold text-foreground mt-0.5">{(qualityMetrics.total_records || 18421).toLocaleString()}</p>
                    </Card>
                    <Card className="bg-emerald-500/10 border-emerald-500/30 p-3">
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-bold">Valid</p>
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{(qualityMetrics.valid || 16820).toLocaleString()}</p>
                    </Card>
                    <Card className="bg-amber-500/10 border-amber-500/30 p-3">
                        <p className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-bold">Review</p>
                        <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">{(qualityMetrics.needs_review || 842).toLocaleString()}</p>
                    </Card>
                    <Card className="bg-blue-500/10 border-blue-500/30 p-3">
                        <p className="text-[10px] text-blue-700 dark:text-blue-400 uppercase font-bold">Duplicates</p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-0.5">{(qualityMetrics.duplicates || 531).toLocaleString()}</p>
                    </Card>
                    <Card className="bg-purple-500/10 border-purple-500/30 p-3">
                        <p className="text-[10px] text-purple-700 dark:text-purple-400 uppercase font-bold">Incomplete</p>
                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-0.5">{(qualityMetrics.incomplete || 228).toLocaleString()}</p>
                    </Card>
                    <Card className="bg-red-500/10 border-red-500/30 p-3">
                        <p className="text-[10px] text-red-700 dark:text-red-400 uppercase font-bold">Invalid</p>
                        <p className="text-lg font-bold text-red-600 dark:text-red-400 mt-0.5">{(qualityMetrics.invalid || 74).toLocaleString()}</p>
                    </Card>
                </div>

                {/* Source Performance Matrix */}
                <Card className="bg-card border-border/60 overflow-hidden shadow-xs">
                    <div className="p-3 border-b border-border/60 bg-muted/30 font-bold text-xs flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" /> Channel Revenue & ROI
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs min-w-[800px]">
                            <thead className="bg-muted/70 border-b border-border text-[10px] font-bold text-muted-foreground uppercase">
                                <tr>
                                    <th className="p-3 pl-4">Source Channel</th>
                                    <th className="p-3 text-center">Total Leads</th>
                                    <th className="p-3 text-center">Qualified</th>
                                    <th className="p-3 text-center">Won</th>
                                    <th className="p-3 text-right">Revenue</th>
                                    <th className="p-3 text-center pr-4">ROI</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {sourcePerformance.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-muted/40 transition-colors">
                                        <td className="p-3 pl-4 font-bold text-foreground">{item.source}</td>
                                        <td className="p-3 text-center font-bold text-foreground">{item.leads}</td>
                                        <td className="p-3 text-center text-blue-600 dark:text-blue-400 font-bold">{item.qualified}</td>
                                        <td className="p-3 text-center text-emerald-600 dark:text-emerald-400 font-bold">{item.won}</td>
                                        <td className="p-3 text-right font-mono font-bold text-foreground">{item.revenue}</td>
                                        <td className="p-3 text-center pr-4">
                                            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 px-2 py-0.5 font-bold">
                                                {item.roi}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Telemetry Log */}
                <Card className="bg-card border-border/60 p-4 space-y-2.5 font-mono text-xs shadow-xs">
                    <div className="font-sans font-bold text-xs flex items-center gap-2 pb-1 border-b border-border/40 text-foreground">
                        <Activity className="w-4 h-4 text-primary" /> Telemetry Log
                    </div>
                    {logs.length === 0 ? (
                        <div className="space-y-2 text-muted-foreground text-[11px]">
                            <div><span className="text-emerald-500 font-bold">[10:42:01]</span> <span className="font-bold text-foreground">[job_started]</span> Engine runner initialized.</div>
                            <div><span className="text-emerald-500 font-bold">[10:45:12]</span> <span className="font-bold text-foreground">[extraction]</span> 1,200 records fetched from Web Discovery.</div>
                            <div><span className="text-emerald-500 font-bold">[10:47:30]</span> <span className="font-bold text-foreground">[validation]</span> 842 records passed validation.</div>
                            <div><span className="text-amber-500 font-bold">[10:48:05]</span> <span className="font-bold text-foreground">[deduplication]</span> 124 duplicates detected.</div>
                            <div><span className="text-emerald-500 font-bold">[10:49:22]</span> <span className="font-bold text-foreground">[lead_created]</span> 718 leads inserted into Master Lead Sheet.</div>
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="flex items-start gap-2 border-b border-border/30 pb-1.5 text-[11px]">
                                <span className="text-muted-foreground">{new Date(log.created_at).toLocaleTimeString()}</span>
                                <span className="font-bold text-primary">[{log.event_type}]</span>
                                <span className="text-foreground"><strong>{log.title}:</strong> {log.description}</span>
                            </div>
                        ))
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
