import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Link, router } from '@inertiajs/react';
import {
    Plus, Search, RefreshCw, TrendingUp, DollarSign, CheckCircle2,
    Building2, Eye, Edit3, Trash2, X, Target, UserCheck, Flame, Layers, Inbox
} from 'lucide-react';
import { Currency } from '@/Components/SettingsFormatters';

export default function OpportunitiesIndex({ stages, deals, stats, filters, pipelines }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [stageFilter, setStageFilter] = useState(filters?.stage_id || 'all');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');

    const opportunityItems = deals?.data || [];

    // Stage Tab Definitions for 1-click filtering
    const opportunityTabs = [
        { id: 'all', name: 'All Opportunities' },
        ...(stages || []).map((s) => ({ id: String(s.id), name: s.name })),
    ];

    const applyFilters = (newParams = {}) => {
        const query = {
            search: searchTerm,
            stage_id: stageFilter,
            status: statusFilter,
            ...newParams,
        };

        Object.keys(query).forEach((k) => {
            if (query[k] === 'all' || query[k] === '' || query[k] === null) {
                delete query[k];
            }
        });

        router.get('/opportunity', query, { preserveState: true, replace: true });
    };

    const handleTabChange = (stageId) => {
        setStageFilter(stageId);
        applyFilters({ stage_id: stageId });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters({ search: searchTerm });
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setStageFilter('all');
        setStatusFilter('all');
        router.get('/opportunity', {}, { preserveState: true, replace: true });
    };

    const handleUpdateStage = (dealId, newStageId) => {
        router.patch(`/opportunity/${dealId}/stage`, { stage_id: newStageId }, { preserveState: true });
    };

    const handleDelete = (dealId) => {
        if (confirm('Are you sure you want to delete this opportunity?')) {
            router.delete(`/opportunity/${dealId}`);
        }
    };

    const getStatusBadge = (st = 'open') => {
        if (st === 'won') {
            return <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200">Won</Badge>;
        } else if (st === 'lost') {
            return <Badge className="bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200">Lost</Badge>;
        }
        return <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200">Open</Badge>;
    };

    return (
        <AppLayout
            title="Opportunity Pipeline"
            breadcrumbs={[{ label: 'Prospect & Enrich', href: '/leads' }, { label: 'Opportunity' }]}
            headerActions={
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => router.reload()}
                        className="gap-1.5 border-border text-xs h-8 px-3 text-muted-foreground hover:text-foreground"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Refresh
                    </Button>
                    <Link href="/opportunity/create">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-2xs text-xs h-8 px-3 font-semibold">
                            <Plus className="w-3.5 h-3.5" />
                            Add Opportunity
                        </Button>
                    </Link>
                </div>
            }
        >
            <div className="space-y-4 pb-12">
                {/* ── Nominal Clickable KPI Stats Banner ── */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    <Card
                        onClick={() => handleTabChange('all')}
                        className={`bg-card border transition-all cursor-pointer hover:shadow-xs ${
                            stageFilter === 'all' && statusFilter === 'all'
                                ? 'border-indigo-500 ring-1 ring-indigo-500'
                                : 'border-border'
                        }`}
                    >
                        <CardContent className="p-3 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    TOTAL OPPORTUNITIES
                                </p>
                                <h4 className="text-lg font-extrabold text-foreground mt-0.5">
                                    {stats?.total_opportunities || 0}
                                </h4>
                            </div>
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                <Target className="w-4 h-4" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        onClick={() => {
                            setStatusFilter('open');
                            applyFilters({ status: 'open' });
                        }}
                        className={`bg-card border transition-all cursor-pointer hover:shadow-xs ${
                            statusFilter === 'open'
                                ? 'border-blue-500 ring-1 ring-blue-500'
                                : 'border-border'
                        }`}
                    >
                        <CardContent className="p-3 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    OPEN PIPELINE VALUE
                                </p>
                                <h4 className="text-lg font-extrabold text-foreground mt-0.5">
                                    <Currency value={stats?.open_value || 0} />
                                </h4>
                            </div>
                            <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-lg">
                                <DollarSign className="w-4 h-4" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        onClick={() => {
                            setStatusFilter('won');
                            applyFilters({ status: 'won' });
                        }}
                        className={`bg-card border transition-all cursor-pointer hover:shadow-xs ${
                            statusFilter === 'won'
                                ? 'border-emerald-500 ring-1 ring-emerald-500'
                                : 'border-border'
                        }`}
                    >
                        <CardContent className="p-3 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    WON REVENUE
                                </p>
                                <h4 className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                    <Currency value={stats?.won_value || 0} />
                                </h4>
                            </div>
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardContent className="p-3 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    WIN RATE
                                </p>
                                <h4 className="text-lg font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">
                                    {stats?.win_rate || 0}%
                                </h4>
                            </div>
                            <div className="p-2 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-lg">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Stage Category Tabs ── */}
                <div className="border-b border-border overflow-x-auto">
                    <div className="flex items-center gap-1 min-w-max pb-px">
                        {opportunityTabs.map((tab) => {
                            const isActive = String(stageFilter) === String(tab.id);
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 ${
                                        isActive
                                            ? 'bg-card text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 shadow-2xs'
                                            : 'text-muted-foreground hover:text-foreground border-transparent hover:bg-muted/40'
                                    }`}
                                >
                                    <span>{tab.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Toolbar & Filters ── */}
                <div className="bg-card p-3.5 rounded-2xl border border-border flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
                    <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search opportunity title, company..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 text-xs bg-muted/40 hover:bg-muted/70 focus:bg-background border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-foreground placeholder:text-muted-foreground"
                        />
                    </form>

                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        <select
                            value={stageFilter}
                            onChange={(e) => {
                                setStageFilter(e.target.value);
                                applyFilters({ stage_id: e.target.value });
                            }}
                            className="text-xs bg-muted/40 border border-border rounded-xl px-2.5 py-1.5 text-foreground focus:ring-2 focus:ring-indigo-500 font-medium"
                        >
                            <option value="all">All Stages</option>
                            {(stages || []).map((st) => (
                                <option key={st.id} value={st.id}>
                                    {st.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                applyFilters({ status: e.target.value });
                            }}
                            className="text-xs bg-muted/40 border border-border rounded-xl px-2.5 py-1.5 text-foreground focus:ring-2 focus:ring-indigo-500 font-medium"
                        >
                            <option value="all">All Statuses</option>
                            <option value="open">Open</option>
                            <option value="won">Won</option>
                            <option value="lost">Lost</option>
                        </select>

                        {(searchTerm || stageFilter !== 'all' || statusFilter !== 'all') && (
                            <Button variant="ghost" onClick={handleResetFilters} className="text-xs text-rose-500 hover:text-rose-600 gap-1 h-7 px-2">
                                <X className="w-3.5 h-3.5" /> Reset Filters
                            </Button>
                        )}
                    </div>
                </div>

                {/* ── Dense Tabular Data Table ── */}
                <Card className="bg-card border-border shadow-2xs">
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-left text-xs tabular-nums select-text">
                            <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border uppercase tracking-wider">
                                <tr>
                                    <th className="p-2.5 pl-4 w-12 text-center">#</th>
                                    <th className="p-2.5">Opportunity Name</th>
                                    <th className="p-2.5">Contact / Company</th>
                                    <th className="p-2.5">Value</th>
                                    <th className="p-2.5">Stage</th>
                                    <th className="p-2.5">Status</th>
                                    <th className="p-2.5">Probability</th>
                                    <th className="p-2.5">Owner</th>
                                    <th className="p-2.5">Expected Close</th>
                                    <th className="p-2.5 pr-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {opportunityItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="text-center py-12 text-muted-foreground">
                                            No opportunities found matching criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    opportunityItems.map((deal, idx) => {
                                        const contactName = deal?.contact?.first_name 
                                            ? `${deal.contact.first_name} ${deal.contact.last_name || ''}`.trim() 
                                            : 'No contact';
                                        
                                        // Descending Serial Number calculation
                                        const totalCount = deals?.total || opportunityItems.length;
                                        const currentPage = deals?.current_page || 1;
                                        const perPage = deals?.per_page || opportunityItems.length;
                                        const serialNum = totalCount - ((currentPage - 1) * perPage) - idx;

                                        return (
                                            <tr key={deal.id} className="hover:bg-muted/40 transition-colors">
                                                <td className="p-2.5 pl-4 text-center font-mono font-bold text-muted-foreground text-[11px]">
                                                    {serialNum}
                                                </td>

                                                <td className="p-2.5">
                                                    <Link href={`/opportunity/${deal.id}`} className="font-bold text-foreground hover:text-indigo-600 transition-colors">
                                                        {deal.title}
                                                    </Link>
                                                </td>

                                                <td className="p-2.5">
                                                    <div>
                                                        <div className="font-semibold text-foreground">{contactName}</div>
                                                        {deal.contact?.company && (
                                                            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                                                <Building2 className="w-3 h-3" /> {deal.contact.company}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="p-2.5 font-extrabold text-foreground">
                                                    <Currency value={deal.value || 0} />
                                                </td>

                                                <td className="p-2.5">
                                                    <select
                                                        value={deal.stage_id}
                                                        onChange={(e) => handleUpdateStage(deal.id, e.target.value)}
                                                        className="text-[11px] font-semibold bg-muted/60 border-none rounded-md px-2 py-1 text-foreground focus:ring-2 focus:ring-indigo-500"
                                                    >
                                                        {(stages || []).map((s) => (
                                                            <option key={s.id} value={s.id}>
                                                                {s.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>

                                                <td className="p-2.5">{getStatusBadge(deal.status)}</td>

                                                <td className="p-2.5 font-mono font-bold text-foreground">
                                                    {deal.probability ? `${deal.probability}%` : '—'}
                                                </td>

                                                <td className="p-2.5 text-foreground font-medium">
                                                    {deal.assigned_user?.name || deal.assignedUser?.name ? (
                                                        <span className="flex items-center gap-1">
                                                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                                            {deal.assigned_user?.name || deal.assignedUser?.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground italic">Unassigned</span>
                                                    )}
                                                </td>

                                                <td className="p-2.5 text-muted-foreground text-[11px]">
                                                    {deal.expected_close ? new Date(deal.expected_close).toLocaleDateString() : '—'}
                                                </td>

                                                <td className="p-2.5 pr-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Link href={`/opportunity/${deal.id}`}>
                                                            <Button size="sm" variant="outline" className="h-6 px-2 text-[11px] gap-1">
                                                                <Eye className="w-3 h-3" /> View
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/opportunity/${deal.id}/edit`}>
                                                            <Button size="sm" variant="outline" className="h-6 px-2 text-[11px] gap-1">
                                                                <Edit3 className="w-3 h-3" /> Edit
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleDelete(deal.id)}
                                                            className="h-6 px-2 text-[11px] text-rose-500 hover:text-rose-600"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
