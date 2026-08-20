import React, { useState, useMemo } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Link, useForm, router } from '@inertiajs/react';
import {
    Cpu, Plus, RefreshCw, Clock, Zap, Edit3, Trash2, Eye, FileText, Play,
    CheckCircle2, AlertTriangle, AlertCircle, Info, Search, Globe, Mail, Phone,
    ExternalLink, LayoutGrid, Table as TableIcon, Download, CheckSquare, XCircle,
    Merge, Building2, Sparkles, SlidersHorizontal, Layers, Activity, Check,
    ChevronDown, ChevronUp, Code, X, Filter, BarChart4, TrendingUp, ShieldCheck
} from 'lucide-react';

export default function LeadJobsIndex({
    jobs = { data: [] },
    candidates = { data: [] },
    counts = {},
    sources = [],
    activeTab = 'jobs',
    activeCategory = 'all',
    qualityMetrics = {},
    sourcePerformance = [],
    analyticsLogs = []
}) {
    // Primary Tab State: 'jobs', 'review', or 'analytics'
    const [currentTab, setCurrentTab] = useState(activeTab || 'jobs');

    // Jobs Tab States
    const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [extractedModalJob, setExtractedModalJob] = useState(null);
    const [progressModalJob, setProgressModalJob] = useState(null);
    const [logsModalJob, setLogsModalJob] = useState(null);
    const [editingCandidate, setEditingCandidate] = useState(null);

    // Filter & Search States
    const [singleUrl, setSingleUrl] = useState('');
    const [extractedSearch, setExtractedSearch] = useState('');
    const [jobSearch, setJobSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

    // Logs modal states
    const [logFilter, setLogFilter] = useState('all');
    const [logSearch, setLogSearch] = useState('');

    // Extracted Data Modal States
    const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
    const [expandedCandidateId, setExpandedCandidateId] = useState(null);

    // Review Queue Tab States
    const [selectedMergeCandidate, setSelectedMergeCandidate] = useState(null);

    // Forms
    const jobForm = useForm({
        target_industry: 'Real Estate',
        target_location: 'Bhubaneswar',
        target_service: 'Website Development',
        target_company_size: '10–500 employees',
        target_website_filter: 'Has website',
        lead_source_id: sources[0]?.id || '',
        additional_criteria: '',
    });

    const editJobForm = useForm({
        target_industry: '',
        target_location: '',
        target_service: '',
        target_company_size: '',
        target_website_filter: '',
        status: 'completed',
        lead_source_id: '',
        additional_criteria: '',
    });

    const candidateEditForm = useForm({
        company_name: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        website: '',
        industry: '',
        qualification_score: 80,
        service_opportunity: '',
        validation_status: 'Valid',
        review_category: 'needs_review',
    });

    const mergeForm = useForm({
        candidate_id: '',
        lead_id: '',
        company: '',
        email: '',
        phone: '',
        website: '',
    });

    // ── Job Handlers ──
    const handleCreateJob = (e) => {
        e.preventDefault();
        jobForm.post('/leads/data', {
            onSuccess: () => {
                setIsCreateJobOpen(false);
                jobForm.reset();
            }
        });
    };

    const openEditJobModal = (job) => {
        setEditingJob(job);
        editJobForm.setData({
            target_industry: job.target_industry || 'Real Estate',
            target_location: job.target_location || 'Bhubaneswar',
            target_service: job.target_service || 'Website Development',
            target_company_size: job.target_company_size || '10–500 employees',
            target_website_filter: job.target_website_filter || 'Has website',
            status: job.status || 'completed',
            lead_source_id: job.lead_source_id || (sources[0]?.id || ''),
            additional_criteria: job.targeting_criteria?.['Additional Criteria'] || '',
        });
    };

    const handleUpdateJob = (e) => {
        e.preventDefault();
        if (!editingJob) return;
        editJobForm.put(`/leads/data/${editingJob.id}`, {
            onSuccess: () => setEditingJob(null)
        });
    };

    const handleDeleteJob = (job) => {
        if (confirm(`Are you sure you want to delete Extraction Job #${job.job_number} and all its extracted data?`)) {
            router.delete(`/leads/data/${job.id}`);
        }
    };

    const handleRunJob = (job) => {
        router.post(`/leads/data/${job.id}/run`);
    };

    const handleAnalyzeUrl = (e) => {
        e.preventDefault();
        if (!singleUrl) return;
        router.post('/leads/data/analyze-url', { url: singleUrl }, {
            onSuccess: () => setSingleUrl('')
        });
    };

    // ── Extracted Candidates Handlers ──
    const openExtractedModal = (job) => {
        setExtractedModalJob(job);
        setSelectedCandidateIds([]);
        setExpandedCandidateId(null);
        setExtractedSearch('');
    };

    const openCandidateEditModal = (candidate) => {
        setEditingCandidate(candidate);
        candidateEditForm.setData({
            company_name: candidate.company_name || '',
            first_name: candidate.first_name || '',
            last_name: candidate.last_name || '',
            email: candidate.email || '',
            phone: candidate.phone || '',
            website: candidate.website || '',
            industry: candidate.industry || extractedModalJob?.target_industry || 'Real Estate',
            qualification_score: candidate.qualification_score || 80,
            service_opportunity: candidate.service_opportunity || extractedModalJob?.target_service || 'Website Development',
            validation_status: candidate.validation_status || 'Valid',
            review_category: candidate.review_category || 'needs_review',
        });
    };

    const handleUpdateCandidate = (e) => {
        e.preventDefault();
        if (!editingCandidate || !extractedModalJob) return;

        candidateEditForm.put(`/leads/data/${extractedModalJob.id}/extracted/${editingCandidate.id}`, {
            onSuccess: () => {
                setExtractedModalJob(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        candidates: prev.candidates.map(c =>
                            c.id === editingCandidate.id ? { ...c, ...candidateEditForm.data } : c
                        )
                    };
                });
                setEditingCandidate(null);
            }
        });
    };

    const handleDeleteExtractedCandidate = (job, candidate) => {
        if (confirm(`Delete extracted candidate "${candidate.company_name}"?`)) {
            router.delete(`/leads/data/${job.id}/extracted/${candidate.id}`, {
                onSuccess: () => {
                    if (extractedModalJob && extractedModalJob.id === job.id) {
                        setExtractedModalJob(prev => ({
                            ...prev,
                            candidates: prev.candidates.filter(c => c.id !== candidate.id)
                        }));
                    }
                }
            });
        }
    };

    const handleToggleSelectCandidate = (id) => {
        setSelectedCandidateIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAllCandidates = (candidateList) => {
        if (selectedCandidateIds.length === candidateList.length) {
            setSelectedCandidateIds([]);
        } else {
            setSelectedCandidateIds(candidateList.map(c => c.id));
        }
    };

    const handleBulkDeleteCandidates = (job) => {
        if (selectedCandidateIds.length === 0) return;
        if (confirm(`Delete ${selectedCandidateIds.length} selected extracted candidate records?`)) {
            router.post(`/leads/data/${job.id}/extracted/bulk-delete`, {
                candidate_ids: selectedCandidateIds
            }, {
                onSuccess: () => {
                    if (extractedModalJob && extractedModalJob.id === job.id) {
                        setExtractedModalJob(prev => ({
                            ...prev,
                            candidates: prev.candidates.filter(c => !selectedCandidateIds.includes(c.id))
                        }));
                    }
                    setSelectedCandidateIds([]);
                }
            });
        }
    };

    // ── Candidate Review Actions ──
    const handleApproveCandidate = (id) => {
        router.post(`/leads/review/${id}/approve`);
    };

    const handleRejectCandidate = (id) => {
        router.post(`/leads/review/${id}/reject`);
    };

    const openMergeModal = (candidate) => {
        setSelectedMergeCandidate(candidate);
        mergeForm.setData({
            candidate_id: candidate.id,
            lead_id: candidate.matched_lead_id || candidate.matched_lead?.id || '',
            company: candidate.company_name,
            email: candidate.email || candidate.matched_lead?.email || '',
            phone: candidate.phone || candidate.matched_lead?.phone || '',
            website: candidate.website || candidate.matched_lead?.custom_fields?.website || '',
        });
    };

    const handleExecuteMerge = (e) => {
        e.preventDefault();
        mergeForm.post('/leads/review/merge', {
            onSuccess: () => setSelectedMergeCandidate(null)
        });
    };

    // High Contrast & Polished Status Badges
    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Completed
                    </span>
                );
            case 'running':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" /> Running
                    </span>
                );
            case 'failed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30">
                        <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" /> Failed
                    </span>
                );
            case 'paused':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Paused
                    </span>
                );
            default:
                return <Badge variant="secondary" className="capitalize text-xs font-bold text-foreground">{status}</Badge>;
        }
    };

    const getLogIcon = (status) => {
        switch (status) {
            case 'success':
                return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />;
            case 'warning':
                return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
            default:
                return <Info className="w-4 h-4 text-blue-500 shrink-0" />;
        }
    };

    const allJobs = jobs.data || [];
    const candidateList = candidates.data || [];

    // Memoized filtered jobs
    const filteredJobs = useMemo(() => {
        return allJobs.filter(job => {
            const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
            const query = jobSearch.toLowerCase().trim();
            const matchesSearch = !query ||
                job.job_number.toLowerCase().includes(query) ||
                job.source_name.toLowerCase().includes(query) ||
                job.target_industry.toLowerCase().includes(query) ||
                job.target_location.toLowerCase().includes(query);

            return matchesStatus && matchesSearch;
        });
    }, [allJobs, statusFilter, jobSearch]);

    const reviewCategories = [
        { id: 'all', label: 'All Candidates', count: counts.total || 0 },
        { id: 'needs_review', label: 'Needs Review', count: counts.needs_review || 0 },
        { id: 'incomplete', label: 'Incomplete', count: counts.incomplete || 0 },
        { id: 'duplicate', label: 'Duplicates', count: counts.duplicate || 0 },
        { id: 'high_potential', label: 'High Potential', count: counts.high_potential || 0 },
        { id: 'invalid', label: 'Invalid', count: counts.invalid || 0 },
    ];

    return (
        <AppLayout title="Data & Extraction — TheSpaceCode">
            <div className="space-y-6 w-full text-foreground pb-12">
                {/* ── Top Navigation Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 bg-primary/10 rounded-lg text-primary border border-primary/20">
                                <Sparkles className="w-4 h-4" />
                            </span>
                            <h1 className="text-xl font-extrabold text-foreground tracking-tight">Data & Extraction</h1>
                        </div>
                        <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/50">
                            <Link href="/leads">
                                <Button variant="ghost" size="xs" className="text-xs font-medium h-7 px-3 text-muted-foreground hover:text-foreground">
                                    Master Sheet
                                </Button>
                            </Link>
                            <Link href="/leads/sources">
                                <Button variant="ghost" size="xs" className="text-xs font-medium h-7 px-3 text-muted-foreground hover:text-foreground">
                                    Sources
                                </Button>
                            </Link>
                            <Link href="/leads/data">
                                <Button variant="secondary" size="xs" className="text-xs font-semibold h-7 px-3 bg-background text-foreground shadow-2xs">
                                    Data & Extraction
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            className="gap-1.5 font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs h-8"
                            onClick={() => setIsCreateJobOpen(true)}
                        >
                            <Plus className="w-4 h-4" /> New Extraction Job
                        </Button>
                    </div>
                </div>

                {/* ── Tab Switcher ── */}
                <div className="flex items-center gap-3 border-b border-border pb-1 overflow-x-auto">
                    <button
                        onClick={() => setCurrentTab('jobs')}
                        className={`flex items-center gap-2 py-2.5 px-4.5 font-extrabold text-sm rounded-lg transition-all border ${
                            currentTab === 'jobs'
                                ? 'bg-primary text-primary-foreground shadow-sm border-primary'
                                : 'bg-card text-foreground border-border hover:bg-accent hover:text-foreground'
                        }`}
                    >
                        <Cpu className="w-4 h-4" />
                        Collection Jobs (Lead Extractor)
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                            currentTab === 'jobs' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-foreground border border-border'
                        }`}>
                            {allJobs.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setCurrentTab('review')}
                        className={`flex items-center gap-2 py-2.5 px-4.5 font-extrabold text-sm rounded-lg transition-all border ${
                            currentTab === 'review'
                                ? 'bg-primary text-primary-foreground shadow-sm border-primary'
                                : 'bg-card text-foreground border-border hover:bg-accent hover:text-foreground'
                        }`}
                    >
                        <CheckSquare className="w-4 h-4" />
                        Review Queue (Candidate Verification)
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                            currentTab === 'review'
                                ? 'bg-primary-foreground/20 text-primary-foreground'
                                : counts.total > 0
                                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                : 'bg-muted text-foreground border border-border'
                        }`}>
                            {counts.total || candidateList.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setCurrentTab('analytics')}
                        className={`flex items-center gap-2 py-2.5 px-4.5 font-extrabold text-sm rounded-lg transition-all border ${
                            currentTab === 'analytics'
                                ? 'bg-primary text-primary-foreground shadow-sm border-primary'
                                : 'bg-card text-foreground border-border hover:bg-accent hover:text-foreground'
                        }`}
                    >
                        <BarChart4 className="w-4 h-4" />
                        Quality & Analytics
                    </button>
                </div>

                {/* ════════════════════════════════════════════════════════════
                    TAB 1: COLLECTION JOBS TAB
                   ════════════════════════════════════════════════════════════ */}
                {currentTab === 'jobs' && (
                    <div className="space-y-6">
                        {/* Instant URL Lead Extractor Banner */}
                        <Card className="bg-card border-2 border-primary/30 p-4 shadow-sm rounded-xl">
                            <form onSubmit={handleAnalyzeUrl} className="flex flex-col md:flex-row items-center gap-3">
                                <div className="flex items-center gap-2 text-primary font-extrabold text-xs shrink-0">
                                    <Zap className="w-4 h-4 fill-primary" />
                                    <span>Instant URL Extractor:</span>
                                </div>
                                <input
                                    type="url"
                                    required
                                    placeholder="Paste target domain URL (e.g. https://kalingarealty.com)..."
                                    className="flex-1 bg-background text-foreground placeholder:text-muted-foreground border border-border font-medium rounded-lg px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary outline-hidden shadow-inner"
                                    value={singleUrl}
                                    onChange={(e) => setSingleUrl(e.target.value)}
                                />
                                <Button type="submit" size="sm" className="gap-1.5 text-xs font-extrabold shrink-0 bg-primary text-primary-foreground h-9 px-4 shadow-sm">
                                    <Download className="w-3.5 h-3.5" /> Extract Target Lead
                                </Button>
                            </form>
                        </Card>

                        {/* Control Bar: Search & Status Filters */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border shadow-xs">
                            {/* Status Filter Pills */}
                            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                                {['all', 'completed', 'running', 'failed', 'paused'].map((st) => (
                                    <button
                                        key={st}
                                        onClick={() => setStatusFilter(st)}
                                        className={`px-3 py-1.5 rounded-lg font-bold text-xs capitalize transition-all border ${
                                            statusFilter === st
                                                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                                : 'bg-muted text-foreground border-border hover:bg-accent'
                                        }`}
                                    >
                                        {st} {st === 'all' ? `(${allJobs.length})` : `(${allJobs.filter(j => j.status === st).length})`}
                                    </button>
                                ))}
                            </div>

                            {/* Search Input & View Switcher */}
                            <div className="flex items-center gap-2.5">
                                <div className="relative flex-1 sm:w-64">
                                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search extraction jobs..."
                                        className="w-full bg-background text-foreground border border-border rounded-lg pl-8 pr-7 py-1.5 text-xs font-medium focus:ring-2 focus:ring-primary outline-hidden shadow-inner"
                                        value={jobSearch}
                                        onChange={(e) => setJobSearch(e.target.value)}
                                    />
                                    {jobSearch && (
                                        <button
                                            onClick={() => setJobSearch('')}
                                            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center border border-border rounded-lg bg-background p-0.5 shrink-0 shadow-xs">
                                    <button
                                        onClick={() => setViewMode('table')}
                                        className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-primary text-primary-foreground font-bold' : 'text-foreground hover:bg-muted'}`}
                                        title="Tabular View"
                                    >
                                        <TableIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-primary text-primary-foreground font-bold' : 'text-foreground hover:bg-muted'}`}
                                        title="Grid View"
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Main Tabular Extractor Table */}
                        {filteredJobs.length === 0 ? (
                            <Card className="p-12 text-center text-foreground border-dashed rounded-xl bg-card">
                                <Cpu className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                                <p className="font-bold text-sm">No Lead Extraction Jobs Match Filter</p>
                                <p className="text-xs font-medium mt-1 text-muted-foreground">Try adjusting search parameters or create a new extraction job.</p>
                                <Button size="sm" className="mt-4 gap-1 text-xs font-bold bg-primary text-primary-foreground" onClick={() => setIsCreateJobOpen(true)}>
                                    <Plus className="w-4 h-4" /> Create Extraction Job
                                </Button>
                            </Card>
                        ) : viewMode === 'table' ? (
                            /* HIGH CONTRAST TABULAR DATA TABLE */
                            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-muted/80 text-foreground border-b border-border text-xs font-extrabold uppercase tracking-wider">
                                                <th className="py-3.5 px-4">Extraction Job #</th>
                                                <th className="py-3.5 px-4">Target Parameters</th>
                                                <th className="py-3.5 px-4">Extraction Progress</th>
                                                <th className="py-3.5 px-4">Yield Breakdown</th>
                                                <th className="py-3.5 px-4">Status</th>
                                                <th className="py-3.5 px-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/80">
                                            {filteredJobs.map((job) => {
                                                const disc = job.records_discovered || 1;
                                                const ext = job.records_extracted || 0;
                                                const percent = Math.min(100, Math.round((ext / disc) * 100));

                                                return (
                                                    <tr key={job.id} className="hover:bg-muted/40 transition-colors text-foreground">
                                                        {/* Job # & Source */}
                                                        <td className="py-4 px-4">
                                                            <div className="flex items-center gap-3">
                                                                <span className="px-2.5 py-1 bg-primary/10 border border-primary/25 rounded-md text-primary font-mono font-extrabold text-xs shrink-0 shadow-xs">
                                                                    {job.job_number}
                                                                </span>
                                                                <div>
                                                                    <div className="font-extrabold text-foreground text-xs">{job.source_name}</div>
                                                                    <div className="text-[11px] text-muted-foreground font-mono mt-0.5 flex items-center gap-1 font-semibold">
                                                                        <Clock className="w-3 h-3 text-muted-foreground" />
                                                                        {job.started_at ? new Date(job.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Target Criteria */}
                                                        <td className="py-4 px-4">
                                                            <div className="space-y-1">
                                                                <div className="font-bold text-foreground text-xs">
                                                                    {job.target_industry} in {job.target_location}
                                                                </div>
                                                                <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                                                                    <Badge variant="outline" className="px-2 py-0.5 font-semibold bg-secondary text-secondary-foreground border-border">{job.target_service || 'Web Dev'}</Badge>
                                                                    <Badge variant="outline" className="px-2 py-0.5 font-semibold bg-secondary text-secondary-foreground border-border">{job.target_company_size || 'Any size'}</Badge>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Extraction Progress Bar */}
                                                        <td className="py-4 px-4 min-w-[220px]">
                                                            <div className="space-y-1.5">
                                                                <div className="flex justify-between text-[11px] font-mono">
                                                                    <span className="text-foreground font-bold">{percent}% extracted</span>
                                                                    <span className="font-extrabold text-foreground">{ext.toLocaleString()} / {disc.toLocaleString()}</span>
                                                                </div>
                                                                <div className="h-2.5 w-full bg-muted border border-border rounded-full overflow-hidden flex items-center">
                                                                    <div
                                                                        className={`h-full transition-all duration-500 rounded-full ${
                                                                            job.status === 'running'
                                                                                ? 'bg-blue-500 animate-pulse'
                                                                                : job.status === 'failed'
                                                                                ? 'bg-red-500'
                                                                                : 'bg-emerald-500'
                                                                        }`}
                                                                        style={{ width: `${percent}%` }}
                                                                    />
                                                                </div>
                                                                <button
                                                                    onClick={() => setProgressModalJob(job)}
                                                                    className="text-[10px] text-primary hover:underline font-extrabold flex items-center gap-1 mt-0.5"
                                                                >
                                                                    <Activity className="w-3 h-3" /> Check Stage Stepper & Stats
                                                                </button>
                                                            </div>
                                                        </td>

                                                        {/* Yield Breakdown */}
                                                        <td className="py-4 px-4">
                                                            <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                                                                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-extrabold border border-emerald-500/30" title="Valid Leads">
                                                                    {job.valid_leads || 0} valid
                                                                </span>
                                                                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 font-extrabold border border-amber-500/30" title="Duplicates">
                                                                    {job.duplicates_found || 0} dupes
                                                                </span>
                                                                <span className="px-2.5 py-0.5 rounded-md bg-red-500/15 text-red-700 dark:text-red-300 font-extrabold border border-red-500/30" title="Errors">
                                                                    {job.errors_count || 0} errs
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* Status Badge */}
                                                        <td className="py-4 px-4">
                                                            {getStatusBadge(job.status)}
                                                        </td>

                                                        {/* Tabular Actions */}
                                                        <td className="py-4 px-4 text-right">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <Button
                                                                    size="sm"
                                                                    className="h-8 px-2.5 text-xs font-extrabold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs gap-1.5"
                                                                    onClick={() => openExtractedModal(job)}
                                                                >
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                    Data ({job.candidates?.length || 0})
                                                                </Button>

                                                                <Button
                                                                    size="sm"
                                                                    className="h-8 px-2.5 text-xs font-extrabold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs gap-1.5"
                                                                    onClick={() => setLogsModalJob(job)}
                                                                >
                                                                    <FileText className="w-3.5 h-3.5" />
                                                                    Logs ({job.logs?.length || 0})
                                                                </Button>

                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-8 w-8 p-0 text-foreground border-border hover:bg-accent font-bold"
                                                                    onClick={() => openEditJobModal(job)}
                                                                    title="Edit Job Parameters"
                                                                >
                                                                    <Edit3 className="w-3.5 h-3.5" />
                                                                </Button>

                                                                <Button
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 bg-blue-600/15 text-blue-700 dark:text-blue-300 hover:bg-blue-600 hover:text-white border border-blue-500/30 font-bold"
                                                                    onClick={() => handleRunJob(job)}
                                                                    disabled={job.status === 'running'}
                                                                    title="Re-run Data Pulling Process"
                                                                >
                                                                    <Play className="w-3.5 h-3.5" />
                                                                </Button>

                                                                <Button
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 bg-red-600/15 text-red-700 dark:text-red-300 hover:bg-red-600 hover:text-white border border-red-500/30 font-bold"
                                                                    onClick={() => handleDeleteJob(job)}
                                                                    title="Delete Extraction Job"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            /* GRID VIEW ALTERNATIVE */
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredJobs.map((job) => {
                                    const disc = job.records_discovered || 1;
                                    const ext = job.records_extracted || 0;
                                    const percent = Math.min(100, Math.round((ext / disc) * 100));

                                    return (
                                        <Card key={job.id} className="bg-card border border-border shadow-xs p-4 space-y-3 rounded-xl hover:border-primary transition-all text-foreground">
                                            <div className="flex items-center justify-between gap-2 border-b border-border pb-2.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="p-1.5 bg-primary/10 border border-primary/25 rounded font-mono font-extrabold text-xs text-primary">
                                                        {job.job_number}
                                                    </span>
                                                    <h3 className="font-extrabold text-sm text-foreground">{job.source_name}</h3>
                                                </div>
                                                {getStatusBadge(job.status)}
                                            </div>

                                            <div className="text-xs font-semibold text-foreground">
                                                <strong>{job.target_industry}</strong> in <strong>{job.target_location}</strong> ({job.target_service})
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[11px] font-bold">
                                                    <span className="text-foreground">Progress ({percent}%)</span>
                                                    <span className="font-mono text-foreground">{ext} / {disc}</span>
                                                </div>
                                                <div className="h-2 w-full bg-muted border border-border rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${percent}%` }} />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-border">
                                                <div className="flex gap-1.5">
                                                    <Button size="sm" className="h-7 text-xs font-bold bg-emerald-600 text-white gap-1.5" onClick={() => openExtractedModal(job)}>
                                                        <Eye className="w-3.5 h-3.5" /> Extracted ({job.candidates?.length || 0})
                                                    </Button>
                                                    <Button size="sm" className="h-7 text-xs font-bold bg-indigo-600 text-white gap-1.5" onClick={() => setLogsModalJob(job)}>
                                                        <FileText className="w-3.5 h-3.5" /> Process Logs
                                                    </Button>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => openEditJobModal(job)}><Edit3 className="w-3.5 h-3.5" /></Button>
                                                    <Button size="sm" className="h-7 w-7 p-0 bg-red-600/15 text-red-700 hover:bg-red-600 hover:text-white" onClick={() => handleDeleteJob(job)}><Trash2 className="w-3.5 h-3.5" /></Button>
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ════════════════════════════════════════════════════════════
                    TAB 2: CANDIDATE REVIEW QUEUE VIEW
                   ════════════════════════════════════════════════════════════ */}
                {currentTab === 'review' && (
                    <div className="space-y-6">
                        {/* Category Filter Pills */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border">
                            {reviewCategories.map((cat) => (
                                <Link key={cat.id} href={`/leads/data?tab=review&category=${cat.id}`}>
                                    <Button
                                        variant={activeCategory === cat.id ? 'default' : 'outline'}
                                        size="sm"
                                        className={`gap-2 text-xs font-bold rounded-full whitespace-nowrap px-4 h-8 border ${
                                            activeCategory === cat.id ? 'bg-primary text-primary-foreground shadow-sm border-primary font-extrabold' : 'bg-card text-foreground border-border hover:bg-accent'
                                        }`}
                                    >
                                        {cat.label}
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                            activeCategory === cat.id ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-foreground border border-border'
                                        }`}>
                                            {cat.count}
                                        </span>
                                    </Button>
                                </Link>
                            ))}
                        </div>

                        {/* Candidates List */}
                        <div className="space-y-4">
                            {candidateList.length === 0 ? (
                                <Card className="p-12 text-center text-foreground border-dashed rounded-xl bg-card">
                                    <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                                    <p className="font-bold text-sm">No Pending Candidates in Category</p>
                                    <p className="text-xs font-medium mt-1 text-muted-foreground">All lead candidates have been verified, approved into the Master Lead Sheet, or merged.</p>
                                </Card>
                            ) : (
                                candidateList.map((candidate) => (
                                    <Card key={candidate.id} className="bg-card border border-border shadow-xs p-5 space-y-4 rounded-xl hover:border-primary transition-all text-foreground">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2.5 flex-wrap">
                                                    <span className="px-2.5 py-1 bg-primary/10 border border-primary/25 rounded-md font-mono font-extrabold text-xs text-primary shadow-xs">
                                                        {candidate.candidate_number}
                                                    </span>
                                                    <h3 className="font-extrabold text-foreground text-base">{candidate.company_name}</h3>
                                                    <Badge variant="outline" className="text-xs font-bold px-2.5 py-0.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                                                        Score: {candidate.qualification_score}/100
                                                    </Badge>
                                                    <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 capitalize text-xs font-bold">
                                                        {candidate.review_category?.replace('_', ' ')}
                                                    </Badge>
                                                </div>

                                                <p className="text-xs text-foreground font-medium mt-1">
                                                    Decision Maker: <strong className="font-bold text-foreground">{candidate.first_name} {candidate.last_name}</strong> • Opportunity: <strong className="font-bold text-foreground">{candidate.service_opportunity}</strong>
                                                </p>
                                            </div>

                                            {/* Primary Decision Action Buttons */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                {candidate.review_category === 'duplicate' && (
                                                    <Button
                                                        size="sm"
                                                        className="gap-1.5 text-xs font-extrabold bg-amber-600/15 text-amber-700 dark:text-amber-300 hover:bg-amber-600 hover:text-white border border-amber-500/30 h-8 px-3"
                                                        onClick={() => openMergeModal(candidate)}
                                                    >
                                                        <Merge className="w-3.5 h-3.5" /> Merge Duplicate ({candidate.duplicate_match_confidence}%)
                                                    </Button>
                                                )}

                                                <Button
                                                    size="sm"
                                                    className="gap-1.5 text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm h-8 px-4"
                                                    onClick={() => handleApproveCandidate(candidate.id)}
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve Lead
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    className="gap-1.5 text-xs font-extrabold bg-red-600/15 text-red-700 dark:text-red-300 hover:bg-red-600 hover:text-white border border-red-500/30 h-8 px-3"
                                                    onClick={() => handleRejectCandidate(candidate.id)}
                                                >
                                                    <XCircle className="w-3.5 h-3.5" /> Reject
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Contact & Provenance Detail Strip */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-muted/60 rounded-lg text-xs border border-border">
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-muted-foreground uppercase font-extrabold tracking-wider">Contact Signals</p>
                                                <div className="flex items-center gap-1.5 text-foreground font-bold">
                                                    <Mail className="w-3.5 h-3.5 text-primary" /> {candidate.email || 'N/A'}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-foreground font-bold">
                                                    <Phone className="w-3.5 h-3.5 text-primary" /> {candidate.phone || 'N/A'}
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-[10px] text-muted-foreground uppercase font-extrabold tracking-wider">Web Presence & Location</p>
                                                {candidate.website ? (
                                                    <a href={candidate.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline font-bold">
                                                        <Globe className="w-3.5 h-3.5" /> {candidate.website} <ExternalLink className="w-2.5 h-2.5" />
                                                    </a>
                                                ) : (
                                                    <span className="text-muted-foreground font-medium">No website detected</span>
                                                )}
                                                <p className="text-foreground font-semibold">{candidate.location || 'Bhubaneswar, Odisha'}</p>
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-[10px] text-muted-foreground uppercase font-extrabold tracking-wider">Extraction Provenance</p>
                                                <p className="text-foreground font-semibold">Source: <strong className="font-bold">{candidate.provenance?.source_type || 'Web Discovery'}</strong></p>
                                                <p className="text-muted-foreground text-[11px] font-semibold">Confidence: {candidate.provenance?.confidence || 'High'}</p>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* ════════════════════════════════════════════════════════════
                    TAB 3: QUALITY & ANALYTICS VIEW
                   ════════════════════════════════════════════════════════════ */}
                {currentTab === 'analytics' && (
                    <div className="space-y-6">
                        {/* Quality Rates Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="bg-card border-border/60 p-4 shadow-xs">
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

                            <Card className="bg-card border-border/60 p-4 shadow-xs">
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

                            <Card className="bg-card border-border/60 p-4 shadow-xs">
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
                            <Card className="bg-card border-border/60 p-3 shadow-xs">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Records</p>
                                <p className="text-lg font-bold text-foreground mt-0.5">{(qualityMetrics.total_records || 18421).toLocaleString()}</p>
                            </Card>
                            <Card className="bg-emerald-500/10 border-emerald-500/30 p-3 shadow-xs">
                                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-bold">Valid</p>
                                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{(qualityMetrics.valid || 16820).toLocaleString()}</p>
                            </Card>
                            <Card className="bg-amber-500/10 border-amber-500/30 p-3 shadow-xs">
                                <p className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-bold">Review</p>
                                <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">{(qualityMetrics.needs_review || 842).toLocaleString()}</p>
                            </Card>
                            <Card className="bg-blue-500/10 border-blue-500/30 p-3 shadow-xs">
                                <p className="text-[10px] text-blue-700 dark:text-blue-400 uppercase font-bold">Duplicates</p>
                                <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-0.5">{(qualityMetrics.duplicates || 531).toLocaleString()}</p>
                            </Card>
                            <Card className="bg-purple-500/10 border-purple-500/30 p-3 shadow-xs">
                                <p className="text-[10px] text-purple-700 dark:text-purple-400 uppercase font-bold">Incomplete</p>
                                <p className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-0.5">{(qualityMetrics.incomplete || 228).toLocaleString()}</p>
                            </Card>
                            <Card className="bg-red-500/10 border-red-500/30 p-3 shadow-xs">
                                <p className="text-[10px] text-red-700 dark:text-red-400 uppercase font-bold">Invalid</p>
                                <p className="text-lg font-bold text-red-600 dark:text-red-400 mt-0.5">{(qualityMetrics.invalid || 74).toLocaleString()}</p>
                            </Card>
                        </div>

                        {/* Source Performance Matrix */}
                        <Card className="bg-card border-border/60 overflow-hidden shadow-xs">
                            <div className="p-3 border-b border-border/60 bg-muted/30 font-bold text-xs flex items-center gap-2 text-foreground">
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
                            {!analyticsLogs || analyticsLogs.length === 0 ? (
                                <div className="space-y-2 text-muted-foreground text-[11px]">
                                    <div><span className="text-emerald-500 font-bold">[10:42:01]</span> <span className="font-bold text-foreground">[job_started]</span> Engine runner initialized.</div>
                                    <div><span className="text-emerald-500 font-bold">[10:45:12]</span> <span className="font-bold text-foreground">[extraction]</span> 1,200 records fetched from Web Discovery.</div>
                                    <div><span className="text-emerald-500 font-bold">[10:47:30]</span> <span className="font-bold text-foreground">[validation]</span> 842 records passed validation.</div>
                                    <div><span className="text-amber-500 font-bold">[10:48:05]</span> <span className="font-bold text-foreground">[deduplication]</span> 124 duplicates detected.</div>
                                    <div><span className="text-emerald-500 font-bold">[10:49:22]</span> <span className="font-bold text-foreground">[lead_created]</span> 718 leads inserted into Master Lead Sheet.</div>
                                </div>
                            ) : (
                                analyticsLogs.map((log) => (
                                    <div key={log.id} className="flex items-start gap-2 border-b border-border/30 pb-1.5 text-[11px]">
                                        <span className="text-muted-foreground">{new Date(log.created_at).toLocaleTimeString()}</span>
                                        <span className="font-bold text-primary">[{log.event_type}]</span>
                                        <span className="text-foreground"><strong>{log.title}:</strong> {log.description}</span>
                                    </div>
                                ))
                            )}
                        </Card>
                    </div>
                )}

                {/* ════════════════════════════════════════════════════════════
                    MODALS SECTION
                   ════════════════════════════════════════════════════════════ */}

                {/* 1. New Discovery Job Modal */}
                {isCreateJobOpen && (
                    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
                        <div className="bg-card border-2 border-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-foreground">
                            <div className="flex items-center justify-between border-b border-border pb-3">
                                <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                                    <Plus className="w-4 h-4 text-primary" /> New Lead Extraction Job
                                </h3>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-foreground" onClick={() => setIsCreateJobOpen(false)}>✕</Button>
                            </div>

                            <form onSubmit={handleCreateJob} className="space-y-3.5 text-xs font-medium">
                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="font-extrabold text-foreground uppercase text-[10px]">Target Industry</label>
                                        <select
                                            className="w-full mt-1 bg-background text-foreground border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary"
                                            value={jobForm.data.target_industry}
                                            onChange={(e) => jobForm.setData('target_industry', e.target.value)}
                                        >
                                            <option value="Real Estate">Real Estate</option>
                                            <option value="Healthcare">Healthcare</option>
                                            <option value="E-Commerce">E-Commerce</option>
                                            <option value="SaaS">SaaS</option>
                                            <option value="Construction">Construction</option>
                                            <option value="IT Services">IT Services</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="font-extrabold text-foreground uppercase text-[10px]">Location</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Bhubaneswar"
                                            className="w-full mt-1 bg-background text-foreground border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary"
                                            value={jobForm.data.target_location}
                                            onChange={(e) => jobForm.setData('target_location', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="font-extrabold text-foreground uppercase text-[10px]">Service Opportunity</label>
                                        <select
                                            className="w-full mt-1 bg-background text-foreground border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary"
                                            value={jobForm.data.target_service}
                                            onChange={(e) => jobForm.setData('target_service', e.target.value)}
                                        >
                                            <option value="Website Development">Website Development</option>
                                            <option value="Digital Marketing">Digital Marketing</option>
                                            <option value="AI Automation">AI Automation</option>
                                            <option value="Branding & Design">Branding & Design</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="font-extrabold text-foreground uppercase text-[10px]">Company Size</label>
                                        <select
                                            className="w-full mt-1 bg-background text-foreground border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary"
                                            value={jobForm.data.target_company_size}
                                            onChange={(e) => jobForm.setData('target_company_size', e.target.value)}
                                        >
                                            <option value="10–500 employees">10–500 employees</option>
                                            <option value="1–10 employees">1–10 employees</option>
                                            <option value="500+ employees">500+ enterprise</option>
                                            <option value="Any">Any</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="font-extrabold text-foreground uppercase text-[10px]">Data Source</label>
                                    <select
                                        className="w-full mt-1 bg-background text-foreground border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary"
                                        value={jobForm.data.lead_source_id}
                                        onChange={(e) => jobForm.setData('lead_source_id', e.target.value)}
                                    >
                                        <option value="">Public Web Discovery</option>
                                        {sources.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                                    <Button type="button" variant="ghost" size="sm" className="font-bold text-foreground" onClick={() => setIsCreateJobOpen(false)}>Cancel</Button>
                                    <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-extrabold px-4 shadow-sm" disabled={jobForm.processing}>
                                        Start Extraction
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* 2. Edit Extraction Job Parameters Modal */}
                {editingJob && (
                    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
                        <div className="bg-card border-2 border-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-foreground">
                            <div className="flex items-center justify-between border-b border-border pb-3">
                                <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                                    <Edit3 className="w-4 h-4 text-primary" /> Edit Extraction Job #{editingJob.job_number}
                                </h3>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-foreground" onClick={() => setEditingJob(null)}>✕</Button>
                            </div>

                            <form onSubmit={handleUpdateJob} className="space-y-3.5 text-xs font-medium">
                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="font-extrabold text-foreground uppercase text-[10px]">Industry</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full mt-1 bg-background text-foreground border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary"
                                            value={editJobForm.data.target_industry}
                                            onChange={(e) => editJobForm.setData('target_industry', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="font-extrabold text-foreground uppercase text-[10px]">Location</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full mt-1 bg-background text-foreground border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary"
                                            value={editJobForm.data.target_location}
                                            onChange={(e) => editJobForm.setData('target_location', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="font-extrabold text-foreground uppercase text-[10px]">Service Opportunity</label>
                                        <input
                                            type="text"
                                            className="w-full mt-1 bg-background text-foreground border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary"
                                            value={editJobForm.data.target_service}
                                            onChange={(e) => editJobForm.setData('target_service', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="font-extrabold text-foreground uppercase text-[10px]">Job Status</label>
                                        <select
                                            className="w-full mt-1 bg-background text-foreground border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary"
                                            value={editJobForm.data.status}
                                            onChange={(e) => editJobForm.setData('status', e.target.value)}
                                        >
                                            <option value="completed">Completed</option>
                                            <option value="running">Running</option>
                                            <option value="pending">Pending</option>
                                            <option value="paused">Paused</option>
                                            <option value="failed">Failed</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="font-extrabold text-foreground uppercase text-[10px]">Company Size</label>
                                        <input
                                            type="text"
                                            className="w-full mt-1 bg-background text-foreground border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary"
                                            value={editJobForm.data.target_company_size}
                                            onChange={(e) => editJobForm.setData('target_company_size', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="font-extrabold text-foreground uppercase text-[10px]">Website Filter</label>
                                        <input
                                            type="text"
                                            className="w-full mt-1 bg-background text-foreground border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary"
                                            value={editJobForm.data.target_website_filter}
                                            onChange={(e) => editJobForm.setData('target_website_filter', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                                    <Button type="button" variant="ghost" size="sm" className="font-bold text-foreground" onClick={() => setEditingJob(null)}>Cancel</Button>
                                    <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-extrabold px-4 shadow-sm" disabled={editJobForm.processing}>
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* 3. View & Delete & Edit Extracted Data Modal */}
                {extractedModalJob && (
                    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
                        <div className="bg-card border-2 border-border rounded-2xl max-w-5xl w-full p-6 space-y-4 shadow-2xl max-h-[92vh] flex flex-col text-foreground">
                            <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
                                <div>
                                    <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                                        <Eye className="w-5 h-5 text-emerald-500" /> Extracted Data — Job #{extractedModalJob.job_number}
                                    </h3>
                                    <p className="text-xs font-medium text-muted-foreground mt-0.5">
                                        View, edit, or delete extracted candidate lead records for {extractedModalJob.target_industry} in {extractedModalJob.target_location}.
                                    </p>
                                </div>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-foreground" onClick={() => setExtractedModalJob(null)}>✕</Button>
                            </div>

                            {/* Search & Bulk Control Bar */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 bg-muted/40 p-2.5 rounded-xl border border-border">
                                <div className="relative flex-1">
                                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Filter extracted candidates by company, email, phone..."
                                        className="w-full bg-background text-foreground border border-border rounded-lg pl-9 pr-7 py-1.5 text-xs font-medium focus:ring-2 focus:ring-primary outline-hidden shadow-inner"
                                        value={extractedSearch}
                                        onChange={(e) => setExtractedSearch(e.target.value)}
                                    />
                                    {extractedSearch && (
                                        <button
                                            onClick={() => setExtractedSearch('')}
                                            className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {extractedModalJob.candidates && extractedModalJob.candidates.length > 0 && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-xs font-bold h-8 border-border"
                                            onClick={() => handleSelectAllCandidates(extractedModalJob.candidates)}
                                        >
                                            {selectedCandidateIds.length === extractedModalJob.candidates.length ? 'Deselect All' : 'Select All'}
                                        </Button>
                                    )}

                                    {selectedCandidateIds.length > 0 && (
                                        <Button
                                            size="sm"
                                            className="h-8 text-xs font-extrabold bg-red-600 hover:bg-red-700 text-white gap-1.5 shadow-sm"
                                            onClick={() => handleBulkDeleteCandidates(extractedModalJob)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete Selected ({selectedCandidateIds.length})
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Candidates List */}
                            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
                                {(!extractedModalJob.candidates || extractedModalJob.candidates.length === 0) ? (
                                    <div className="text-center py-12 text-foreground text-xs border border-dashed rounded-xl p-6 bg-muted/30">
                                        No extracted records found for this job.
                                    </div>
                                ) : (
                                    extractedModalJob.candidates
                                        .filter(c => !extractedSearch ||
                                            c.company_name.toLowerCase().includes(extractedSearch.toLowerCase()) ||
                                            (c.email && c.email.toLowerCase().includes(extractedSearch.toLowerCase())) ||
                                            (c.phone && c.phone.includes(extractedSearch))
                                        )
                                        .map((c) => {
                                            const isSelected = selectedCandidateIds.includes(c.id);
                                            const isExpanded = expandedCandidateId === c.id;

                                            return (
                                                <div
                                                    key={c.id}
                                                    className={`p-4 bg-muted/40 border rounded-xl flex flex-col gap-3 transition-colors text-foreground ${
                                                        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                                                    }`}
                                                >
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                                        <div className="flex items-start gap-3">
                                                            <input
                                                                type="checkbox"
                                                                className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
                                                                checked={isSelected}
                                                                onChange={() => handleToggleSelectCandidate(c.id)}
                                                            />
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="font-extrabold text-sm text-foreground">{c.company_name}</span>
                                                                    <Badge variant="outline" className="text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                                                                        Score: {c.qualification_score}/100
                                                                    </Badge>
                                                                    <Badge className="bg-primary/15 text-primary border border-primary/25 text-[10px] capitalize font-bold">
                                                                        {c.review_category?.replace('_', ' ') || 'candidate'}
                                                                    </Badge>
                                                                </div>

                                                                <div className="flex items-center gap-4 text-xs font-semibold text-foreground/80 flex-wrap">
                                                                    {(c.first_name || c.last_name) && (
                                                                        <span className="text-foreground font-bold">
                                                                            Contact: {c.first_name} {c.last_name}
                                                                        </span>
                                                                    )}
                                                                    {c.email && (
                                                                        <span className="flex items-center gap-1">
                                                                            <Mail className="w-3.5 h-3.5 text-primary" /> {c.email}
                                                                        </span>
                                                                    )}
                                                                    {c.phone && (
                                                                        <span className="flex items-center gap-1">
                                                                            <Phone className="w-3.5 h-3.5 text-primary" /> {c.phone}
                                                                        </span>
                                                                    )}
                                                                    {c.website && (
                                                                        <a href={c.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline font-bold">
                                                                            <Globe className="w-3.5 h-3.5" /> {c.website} <ExternalLink className="w-2.5 h-2.5" />
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="shrink-0 flex items-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 text-xs font-bold text-foreground border-border gap-1"
                                                                onClick={() => setExpandedCandidateId(isExpanded ? null : c.id)}
                                                            >
                                                                <Code className="w-3.5 h-3.5" />
                                                                {isExpanded ? 'Hide Raw Data' : 'Raw Data'}
                                                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                            </Button>

                                                            <Button
                                                                size="sm"
                                                                className="h-8 text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                                                                onClick={() => openCandidateEditModal(c)}
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5" />
                                                                Edit Data
                                                            </Button>

                                                            <Button
                                                                size="sm"
                                                                className="h-8 text-xs font-extrabold bg-red-600/15 text-red-700 dark:text-red-300 hover:bg-red-600 hover:text-white border border-red-500/30 gap-1.5"
                                                                onClick={() => handleDeleteExtractedCandidate(extractedModalJob, c)}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Expanded Raw Data Drawer */}
                                                    {isExpanded && (
                                                        <div className="pt-3 border-t border-border space-y-2 text-xs font-mono">
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-background rounded-lg border border-border">
                                                                <div>
                                                                    <p className="font-extrabold uppercase text-[10px] text-muted-foreground mb-1">Detected Tech Stack</p>
                                                                    <div className="flex gap-1 flex-wrap font-sans text-xs">
                                                                        {(c.technology_stack || ['HTML5', 'WordPress', 'Google Analytics']).map((tech, i) => (
                                                                            <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded font-semibold text-[11px]">
                                                                                {tech}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <p className="font-extrabold uppercase text-[10px] text-muted-foreground mb-1">Extraction Provenance</p>
                                                                    <p className="text-foreground text-[11px] font-sans">
                                                                        Source: <strong className="font-bold">{c.provenance?.source_type || 'Web Discovery'}</strong> • Confidence: <strong className="font-bold">{c.provenance?.confidence || 'High'}</strong>
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <p className="font-extrabold uppercase text-[10px] text-muted-foreground mb-1 font-sans">Raw JSON Attributes</p>
                                                                <pre className="p-3 bg-background text-emerald-600 dark:text-emerald-400 border border-border rounded-lg text-[11px] overflow-x-auto">
                                                                    {JSON.stringify(c.extracted_data || { company_name: c.company_name, email: c.email, phone: c.phone }, null, 2)}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                )}
                            </div>

                            <div className="flex justify-end border-t border-border pt-3 shrink-0">
                                <Button size="sm" variant="outline" className="font-bold text-foreground" onClick={() => setExtractedModalJob(null)}>Close</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. Edit Extracted Candidate Modal */}
                {editingCandidate && (
                    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
                        <div className="bg-card border-2 border-border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-foreground">
                            <div className="flex items-center justify-between border-b border-border pb-3">
                                <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                                    <Edit3 className="w-4 h-4 text-primary" /> Edit Extracted Lead Record
                                </h3>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-foreground" onClick={() => setEditingCandidate(null)}>✕</Button>
                            </div>

                            <form onSubmit={handleUpdateCandidate} className="space-y-3.5 text-xs font-medium">
                                <div>
                                    <label className="font-extrabold text-foreground uppercase text-[10px]">Company Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full mt-1 bg-background text-foreground border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary"
                                        value={candidateEditForm.data.company_name}
                                        onChange={(e) => candidateEditForm.setData('company_name', e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="font-extrabold text-foreground uppercase text-[10px]">Decision Maker First Name</label>
                                        <input
                                            type="text"
                                            className="w-full mt-1 bg-background text-foreground border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary"
                                            value={candidateEditForm.data.first_name}
                                            onChange={(e) => candidateEditForm.setData('first_name', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="font-extrabold text-foreground uppercase text-[10px]">Last Name</label>
                                        <input
                                            type="text"
                                            className="w-full mt-1 bg-background text-foreground border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary"
                                            value={candidateEditForm.data.last_name}
                                            onChange={(e) => candidateEditForm.setData('last_name', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="font-extrabold text-foreground uppercase text-[10px]">Email Address</label>
                                        <input
                                            type="email"
                                            className="w-full mt-1 bg-background text-foreground border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary"
                                            value={candidateEditForm.data.email}
                                            onChange={(e) => candidateEditForm.setData('email', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="font-extrabold text-foreground uppercase text-[10px]">Phone Number</label>
                                        <input
                                            type="text"
                                            className="w-full mt-1 bg-background text-foreground border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary"
                                            value={candidateEditForm.data.phone}
                                            onChange={(e) => candidateEditForm.setData('phone', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="font-extrabold text-foreground uppercase text-[10px]">Website Domain</label>
                                    <input
                                        type="url"
                                        className="w-full mt-1 bg-background text-foreground border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary"
                                        value={candidateEditForm.data.website}
                                        onChange={(e) => candidateEditForm.setData('website', e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="font-extrabold text-foreground uppercase text-[10px]">Qualification Score (0–100)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            className="w-full mt-1 bg-background text-foreground border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary"
                                            value={candidateEditForm.data.qualification_score}
                                            onChange={(e) => candidateEditForm.setData('qualification_score', parseInt(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div>
                                        <label className="font-extrabold text-foreground uppercase text-[10px]">Validation Status</label>
                                        <select
                                            className="w-full mt-1 bg-background text-foreground border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary"
                                            value={candidateEditForm.data.validation_status}
                                            onChange={(e) => candidateEditForm.setData('validation_status', e.target.value)}
                                        >
                                            <option value="Valid">Valid</option>
                                            <option value="Needs Review">Needs Review</option>
                                            <option value="Incomplete">Incomplete</option>
                                            <option value="Invalid">Invalid</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                                    <Button type="button" variant="ghost" size="sm" className="font-bold text-foreground" onClick={() => setEditingCandidate(null)}>Cancel</Button>
                                    <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-extrabold px-4 shadow-sm" disabled={candidateEditForm.processing}>
                                        Save Candidate Record
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* 5. Extraction Progress & Pipeline Stage Monitor Modal */}
                {progressModalJob && (
                    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
                        <div className="bg-card border-2 border-border rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl text-foreground">
                            <div className="flex items-center justify-between border-b border-border pb-3">
                                <div>
                                    <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-primary" /> Extraction Progress & Pipeline Stage Monitor
                                    </h3>
                                    <p className="text-xs font-medium text-muted-foreground mt-0.5">
                                        Job #{progressModalJob.job_number} — {progressModalJob.target_industry} in {progressModalJob.target_location}
                                    </p>
                                </div>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-foreground" onClick={() => setProgressModalJob(null)}>✕</Button>
                            </div>

                            {/* Summary Metrics Strip */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="p-3 bg-muted/60 border border-border rounded-xl text-center">
                                    <p className="text-[10px] font-extrabold uppercase text-muted-foreground">Discovered Targets</p>
                                    <p className="text-lg font-mono font-extrabold text-primary mt-0.5">{progressModalJob.records_discovered || 0}</p>
                                </div>
                                <div className="p-3 bg-muted/60 border border-border rounded-xl text-center">
                                    <p className="text-[10px] font-extrabold uppercase text-muted-foreground">Extracted Candidates</p>
                                    <p className="text-lg font-mono font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{progressModalJob.records_extracted || 0}</p>
                                </div>
                                <div className="p-3 bg-muted/60 border border-border rounded-xl text-center">
                                    <p className="text-[10px] font-extrabold uppercase text-muted-foreground">Valid Leads Yield</p>
                                    <p className="text-lg font-mono font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">{progressModalJob.valid_leads || 0}</p>
                                </div>
                                <div className="p-3 bg-muted/60 border border-border rounded-xl text-center">
                                    <p className="text-[10px] font-extrabold uppercase text-muted-foreground">Duplicates Found</p>
                                    <p className="text-lg font-mono font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">{progressModalJob.duplicates_found || 0}</p>
                                </div>
                            </div>

                            {/* 5-Stage Stepper */}
                            <div className="space-y-3 p-4 bg-muted/40 border border-border rounded-xl">
                                <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wider">Extraction Pipeline Execution Stepper</h4>

                                {[
                                    { stage: 1, title: 'Target Discovery & URL Crawling', desc: `Mapped ${progressModalJob.records_discovered || 0} candidate domain targets matching filters.` },
                                    { stage: 2, title: 'Web Scraping & Content Parsing', desc: 'Fetched HTML content, meta tags, and structured microdata.' },
                                    { stage: 3, title: 'Signal Detection & Entity Extraction', desc: `Extracted ${progressModalJob.records_extracted || 0} candidate contact signals, emails, and phones.` },
                                    { stage: 4, title: 'AI Qualification & Deduplication Check', desc: `Identified ${progressModalJob.valid_leads || 0} valid lead candidates and ${progressModalJob.duplicates_found || 0} master duplicates.` },
                                    { stage: 5, title: 'Pipeline Execution Completed', desc: 'Job execution finished. Candidates saved to Review Queue.' },
                                ].map((st) => {
                                    const isComplete = progressModalJob.status === 'completed' || st.stage <= 4;
                                    const isRunning = progressModalJob.status === 'running' && st.stage === 3;

                                    return (
                                        <div key={st.stage} className="flex items-start gap-3 text-xs">
                                            <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                                isComplete ? 'bg-emerald-500 text-white' : isRunning ? 'bg-blue-500 text-white animate-pulse' : 'bg-muted text-muted-foreground border border-border'
                                            }`}>
                                                {isComplete ? <Check className="w-3.5 h-3.5" /> : st.stage}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-extrabold text-foreground flex items-center justify-between">
                                                    <span>Stage {st.stage}: {st.title}</span>
                                                    <span className="text-[10px] font-mono text-muted-foreground">
                                                        {isComplete ? '100% Done' : isRunning ? 'In Progress' : 'Pending'}
                                                    </span>
                                                </div>
                                                <p className="text-muted-foreground font-medium text-[11px]">{st.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex justify-end pt-2 border-t border-border">
                                <Button size="sm" variant="outline" className="font-bold text-foreground" onClick={() => setProgressModalJob(null)}>Close</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 6. Data Pulling Execution Process Console (Logs Viewer) Modal */}
                {logsModalJob && (
                    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
                        <div className="bg-card border-2 border-border rounded-2xl max-w-4xl w-full p-6 space-y-4 shadow-2xl max-h-[92vh] flex flex-col text-foreground">
                            <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
                                <div>
                                    <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-primary" /> Data Pulling Execution Process Console — Job #{logsModalJob.job_number}
                                    </h3>
                                    <p className="text-xs font-medium text-muted-foreground mt-0.5">
                                        Detailed process trace, step-by-step extraction audit & pipeline operations log.
                                    </p>
                                </div>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-foreground" onClick={() => setLogsModalJob(null)}>✕</Button>
                            </div>

                            {/* Log Search & Level Filter Bar */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 bg-muted/40 p-2.5 rounded-xl border border-border">
                                <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                                    {['all', 'info', 'success', 'warning', 'error'].map((st) => (
                                        <button
                                            key={st}
                                            onClick={() => setLogFilter(st)}
                                            className={`px-2.5 py-1 rounded-md font-bold text-xs capitalize transition-all border ${
                                                logFilter === st
                                                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                                    : 'bg-background text-foreground border-border hover:bg-accent'
                                            }`}
                                        >
                                            {st}
                                        </button>
                                    ))}
                                </div>

                                <div className="relative flex-1 sm:w-64">
                                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Filter process log entries..."
                                        className="w-full bg-background text-foreground border border-border rounded-lg pl-8 pr-7 py-1 text-xs font-medium focus:ring-2 focus:ring-primary outline-hidden shadow-inner"
                                        value={logSearch}
                                        onChange={(e) => setLogSearch(e.target.value)}
                                    />
                                    {logSearch && (
                                        <button
                                            onClick={() => setLogSearch('')}
                                            className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Log Stream */}
                            <div className="overflow-y-auto space-y-2.5 pr-1 flex-1 font-mono text-xs">
                                {(!logsModalJob.logs || logsModalJob.logs.length === 0) ? (
                                    <div className="text-center py-12 text-foreground font-sans text-xs border border-dashed rounded-xl p-6 bg-muted/30">
                                        No process execution logs recorded for this job yet.
                                    </div>
                                ) : (
                                    logsModalJob.logs
                                        .filter(log => (logFilter === 'all' || log.status === logFilter))
                                        .filter(log => !logSearch ||
                                            log.title.toLowerCase().includes(logSearch.toLowerCase()) ||
                                            log.description.toLowerCase().includes(logSearch.toLowerCase())
                                        )
                                        .map((log) => (
                                            <div key={log.id} className="p-3.5 bg-muted/40 border border-border rounded-xl flex items-start gap-3 text-foreground">
                                                <div className="mt-0.5">
                                                    {getLogIcon(log.status)}
                                                </div>
                                                <div className="space-y-0.5 flex-1 font-sans">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <h4 className="text-xs font-extrabold text-foreground">{log.title}</h4>
                                                        <span className="text-[10px] font-mono font-bold text-muted-foreground">
                                                            {log.created_at ? new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Just now'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs font-medium text-foreground/90">{log.description}</p>
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>

                            <div className="flex items-center justify-between border-t border-border pt-3 shrink-0">
                                <Button
                                    size="sm"
                                    className="gap-1.5 text-xs font-extrabold bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                                    onClick={() => handleRunJob(logsModalJob)}
                                >
                                    <Play className="w-3.5 h-3.5" /> Re-trigger Data Pulling Execution
                                </Button>
                                <Button size="sm" variant="outline" className="font-bold text-foreground" onClick={() => setLogsModalJob(null)}>Close</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 7. Side-by-Side Duplicate Merge Modal */}
                {selectedMergeCandidate && (
                    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
                        <div className="bg-card border-2 border-border rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl text-foreground">
                            <div className="flex items-center justify-between border-b border-border pb-3">
                                <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                                    <Merge className="w-4 h-4 text-amber-500" /> Side-by-Side Duplicate Merge
                                </h3>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-foreground" onClick={() => setSelectedMergeCandidate(null)}>✕</Button>
                            </div>

                            <form onSubmit={handleExecuteMerge} className="space-y-4 text-xs font-medium">
                                <p className="text-foreground font-semibold">
                                    Merging candidate <strong className="font-extrabold">#{selectedMergeCandidate.candidate_number}</strong> into existing Master Sheet Lead <strong className="font-extrabold">#{selectedMergeCandidate.matched_lead_id || selectedMergeCandidate.matched_lead?.id}</strong>. Select target merged values:
                                </p>

                                <div className="grid grid-cols-2 gap-3 p-4 bg-muted/60 rounded-xl border border-border">
                                    <div>
                                        <p className="font-extrabold uppercase text-[10px] text-muted-foreground mb-1">Extracted Candidate</p>
                                        <p className="font-bold text-foreground">{selectedMergeCandidate.company_name}</p>
                                        <p className="text-muted-foreground font-medium">{selectedMergeCandidate.email || 'No email'}</p>
                                        <p className="text-muted-foreground font-medium">{selectedMergeCandidate.phone || 'No phone'}</p>
                                    </div>
                                    <div>
                                        <p className="font-extrabold uppercase text-[10px] text-muted-foreground mb-1">Existing Master Lead</p>
                                        <p className="font-bold text-foreground">{selectedMergeCandidate.matched_lead?.company || selectedMergeCandidate.matched_lead?.first_name}</p>
                                        <p className="text-muted-foreground font-medium">{selectedMergeCandidate.matched_lead?.email || 'No email'}</p>
                                        <p className="text-muted-foreground font-medium">{selectedMergeCandidate.matched_lead?.phone || 'No phone'}</p>
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <div>
                                        <label className="font-extrabold text-foreground uppercase text-[10px]">Target Company Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full mt-1 bg-background text-foreground border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary"
                                            value={mergeForm.data.company}
                                            onChange={(e) => mergeForm.setData('company', e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2.5">
                                        <div>
                                            <label className="font-extrabold text-foreground uppercase text-[10px]">Target Email</label>
                                            <input
                                                type="email"
                                                className="w-full mt-1 bg-background text-foreground border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary"
                                                value={mergeForm.data.email}
                                                onChange={(e) => mergeForm.setData('email', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="font-extrabold text-foreground uppercase text-[10px]">Target Phone</label>
                                            <input
                                                type="text"
                                                className="w-full mt-1 bg-background text-foreground border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary"
                                                value={mergeForm.data.phone}
                                                onChange={(e) => mergeForm.setData('phone', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                                    <Button type="button" variant="ghost" size="sm" className="font-bold text-foreground" onClick={() => setSelectedMergeCandidate(null)}>Cancel</Button>
                                    <Button type="submit" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold gap-1.5 px-4 shadow-sm" disabled={mergeForm.processing}>
                                        <Merge className="w-3.5 h-3.5" /> Execute Duplicate Merge
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
