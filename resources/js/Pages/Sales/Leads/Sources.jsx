import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Link, useForm, router } from '@inertiajs/react';
import {
    Waypoints, Plus, RefreshCw, CheckCircle2, Globe, Share2,
    Database, FileSpreadsheet, Server, ShieldCheck, Search, MapPin
} from 'lucide-react';

export default function LeadSourcesIndex({ sources = [], summary = {} }) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedCategoryTab, setSelectedCategoryTab] = useState('all');

    const form = useForm({
        name: '',
        type: 'web_discovery',
        category: 'search_engines',
        description: '',
    });

    const handleSync = (id) => {
        router.post(`/leads/sources/${id}/sync`);
    };

    const handleAddSource = (e) => {
        e.preventDefault();
        form.post('/leads/sources', {
            onSuccess: () => {
                setIsAddOpen(false);
                form.reset();
            }
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'connected':
            case 'active':
                return (
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 px-2 py-0.5 font-bold text-xs gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Connected
                    </Badge>
                );
            case 'configured':
                return <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 px-2 py-0.5 font-bold text-xs">Configured</Badge>;
            case 'available':
                return <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 px-2 py-0.5 font-bold text-xs">Available</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'search_engines': return Search;
            case 'maps_local': return MapPin;
            case 'social_signals': return Share2;
            case 'business_directories': return Database;
            case 'inbound': return Globe;
            default: return Server;
        }
    };

    const categoryMap = [
        { id: 'all', label: 'All Sources', count: sources.length },
        { id: 'search_engines', label: 'Search Engines', count: sources.filter(s => s.category === 'search_engines').length },
        { id: 'maps_local', label: 'Maps & Places', count: sources.filter(s => s.category === 'maps_local').length },
        { id: 'social_signals', label: 'Social Networks', count: sources.filter(s => s.category === 'social_signals').length },
        { id: 'business_directories', label: 'Directories & Portals', count: sources.filter(s => s.category === 'business_directories').length },
        { id: 'inbound', label: 'Inbound & Ads', count: sources.filter(s => s.category === 'inbound').length },
    ];

    const filteredSources = selectedCategoryTab === 'all'
        ? sources
        : sources.filter(s => s.category === selectedCategoryTab);

    return (
        <AppLayout title="Lead Sources — TheSpaceCode">
            <div className="space-y-6 w-full pb-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Waypoints className="w-5 h-5 text-primary" />
                            <h1 className="text-xl font-extrabold text-foreground tracking-tight">Lead Sources</h1>
                        </div>
                        <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/50">
                            <Link href="/leads">
                                <Button variant="ghost" size="xs" className="text-xs font-medium h-7 px-3 text-muted-foreground hover:text-foreground">
                                    Master Sheet
                                </Button>
                            </Link>
                            <Link href="/leads/sources">
                                <Button variant="secondary" size="xs" className="text-xs font-semibold h-7 px-3 bg-background text-foreground shadow-2xs">
                                    Sources
                                </Button>
                            </Link>
                            <Link href="/leads/data">
                                <Button variant="ghost" size="xs" className="text-xs font-medium h-7 px-3 text-muted-foreground hover:text-foreground">
                                    Data & Extraction
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button size="sm" className="gap-1.5 font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs h-8" onClick={() => setIsAddOpen(true)}>
                            <Plus className="w-4 h-4" /> Add Source
                        </Button>
                    </div>
                </div>

                {/* Executive Metrics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-card border-border/60 p-4">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase">Active Sources</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{summary.connected_sources || sources.filter(s => s.status === 'connected').length} / {summary.total_sources || sources.length}</p>
                    </Card>

                    <Card className="bg-card border-border/60 p-4">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase">Total Discovered</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{(summary.total_records_fetched || 32490).toLocaleString()}</p>
                    </Card>

                    <Card className="bg-card border-border/60 p-4">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase">Leads Created</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{(summary.total_records_created || 21850).toLocaleString()}</p>
                    </Card>

                    <Card className="bg-card border-border/60 p-4">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase">Avg Reliability</p>
                        <p className="text-2xl font-bold text-primary mt-1">{summary.average_reliability || 95.8}%</p>
                    </Card>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border/60">
                    {categoryMap.map((cat) => (
                        <Button
                            key={cat.id}
                            variant={selectedCategoryTab === cat.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedCategoryTab(cat.id)}
                            className="gap-2 text-xs font-semibold rounded-full whitespace-nowrap"
                        >
                            {cat.label}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${selectedCategoryTab === cat.id ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                {cat.count}
                            </span>
                        </Button>
                    ))}
                </div>

                {/* Sources Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSources.map((src) => {
                        const CategoryIcon = getCategoryIcon(src.category);
                        return (
                            <Card key={src.id} className="bg-card border-border/60 shadow-xs p-4 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
                                            <CategoryIcon className="w-4 h-4" />
                                        </div>
                                        <h3 className="font-bold text-foreground text-sm">{src.name}</h3>
                                    </div>
                                    {getStatusBadge(src.status)}
                                </div>

                                <div className="grid grid-cols-3 gap-2 p-2.5 bg-muted/30 rounded-lg border border-border/40 text-center text-xs">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-medium">Discovered</p>
                                        <p className="font-bold text-foreground">{src.records_fetched || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-medium">Leads</p>
                                        <p className="font-bold text-emerald-600 dark:text-emerald-400">{src.records_created || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-medium">Duplicates</p>
                                        <p className="font-bold text-amber-600 dark:text-amber-400">{src.duplicates_count || 0}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                                    <span className="text-muted-foreground">Reliability: <strong className="text-foreground">{src.reliability_score}%</strong></span>
                                    <Button size="sm" variant="default" className="gap-1 text-xs font-semibold" onClick={() => handleSync(src.id)}>
                                        <RefreshCw className="w-3.5 h-3.5" /> Sync
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* Add Modal */}
                {isAddOpen && (
                    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-card border border-border rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
                            <div className="flex items-center justify-between border-b border-border pb-2">
                                <h3 className="text-base font-bold text-foreground">Add Lead Source</h3>
                                <Button variant="ghost" size="sm" onClick={() => setIsAddOpen(false)}>Close</Button>
                            </div>

                            <form onSubmit={handleAddSource} className="space-y-3 text-xs">
                                <div>
                                    <label className="font-bold text-foreground uppercase text-[10px]">Source Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Google Maps Directory"
                                        className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="font-bold text-foreground uppercase text-[10px]">Category</label>
                                        <select
                                            className="w-full mt-1 bg-background border border-border rounded-md px-2 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary"
                                            value={form.data.category}
                                            onChange={(e) => form.setData('category', e.target.value)}
                                        >
                                            <option value="search_engines">Search Engines</option>
                                            <option value="maps_local">Maps & Places</option>
                                            <option value="social_signals">Social Networks</option>
                                            <option value="business_directories">Directories</option>
                                            <option value="inbound">Inbound / Ads</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="font-bold text-foreground uppercase text-[10px]">Type</label>
                                        <select
                                            className="w-full mt-1 bg-background border border-border rounded-md px-2 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary"
                                            value={form.data.type}
                                            onChange={(e) => form.setData('type', e.target.value)}
                                        >
                                            <option value="web_discovery">Web Discovery</option>
                                            <option value="first_party">First Party Form</option>
                                            <option value="ad_platform">Ad Platform</option>
                                            <option value="import">CSV Importer</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                                    <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                    <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold" disabled={form.processing}>
                                        Save Source
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
