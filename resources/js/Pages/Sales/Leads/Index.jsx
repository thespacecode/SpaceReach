import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Link, router, useForm } from '@inertiajs/react';
import {
    Plus, Search, RefreshCw, Flame, TrendingUp, UserPlus, ArrowRight, ArrowRightCircle, Zap, X, Eye, Send, Inbox, Clock,
    Download, Upload, BarChart3, AlertTriangle, CheckSquare, Square,
    Target, UserCheck, Building2, Mail, Phone, CheckCircle2, Filter, Merge, Loader2, Waypoints, Calendar, StickyNote, Globe
} from 'lucide-react';

export default function SalesLeadsIndex({ leads = { data: [] }, allLeads = [], stages = [], stats = {}, sourceBreakdown = {}, filters = {}, users = [], pipelines = [] }) {
    // Search & Filter States
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [currentView, setCurrentView] = useState(filters?.view || 'all');
    const [stageFilter, setStageFilter] = useState(filters?.stage || 'all');
    const [sourceFilter, setSourceFilter] = useState(filters?.source || 'all');
    const [assignedFilter, setAssignedFilter] = useState(filters?.assigned_to || 'all');
    const [priorityFilter, setPriorityFilter] = useState(filters?.priority || 'all');

    // Selection & Bulk Action States
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkActionType, setBulkActionType] = useState('');
    const [bulkActionValue, setBulkActionValue] = useState('');

    // Modals & Drawer States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [convertLead, setConvertLead] = useState(null);

    // AJAX Data Loading State & Ref
    const [isUpdating, setIsUpdating] = useState(false);
    const isInitialMount = useRef(true);

    // Listen to Inertia router XHR events for background loading indicator
    useEffect(() => {
        const unbindStart = router.on('start', () => setIsUpdating(true));
        const unbindFinish = router.on('finish', () => setIsUpdating(false));
        return () => {
            unbindStart();
            unbindFinish();
        };
    }, []);

    // Debounced Live Search without full page reload
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const timer = setTimeout(() => {
            applyFilters({ search: searchTerm });
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // CSV Import State
    const [rawCsvText, setRawCsvText] = useState('');
    const [parsedImportLeads, setParsedImportLeads] = useState([]);

    // Activity Log State
    const [activityType, setActivityType] = useState('call');
    const [activityTitle, setActivityTitle] = useState('');
    const [activityDesc, setActivityDesc] = useState('');
    const [nextActionText, setNextActionText] = useState('');
    const [nextActionDue, setNextActionDue] = useState('');

    // Inertia Form for Creating Company
    const createForm = useForm({
        company: '',
        website: '',
        phone: '',
        email: '',
        first_name: '',
        last_name: '',
        designation: '',
        service_requested: 'Website Development',
        source: 'website',
        assigned_to: users[0]?.id || '',
        estimated_value: 50000,
        lead_score: 82,
        priority: 'high',
        stage: 'new',
        notes: '',
    });

    // Inertia Form for Converting Lead to Deal
    const convertForm = useForm({
        deal_title: '',
        pipeline_id: pipelines[0]?.id || '',
        stage_id: pipelines[0]?.stages[0]?.id || '',
        deal_value: 0,
        expected_close: '',
    });

    // Inertia Form for Editing Lead/Company Details
    const editForm = useForm({
        company: '',
        website: '',
        phone: '',
        email: '',
        first_name: '',
        last_name: '',
        designation: '',
        service_requested: '',
        source: '',
        stage: '',
        assigned_to: '',
        estimated_value: 0,
    });

    // Sync editForm whenever selectedLead opens/changes
    useEffect(() => {
        if (selectedLead) {
            const custom = selectedLead.custom_fields || {};
            editForm.setData({
                company: selectedLead.company || '',
                website: custom.website || selectedLead.website || '',
                phone: selectedLead.phone || '',
                email: selectedLead.email || '',
                first_name: selectedLead.first_name || '',
                last_name: selectedLead.last_name || '',
                designation: custom.designation || selectedLead.job_title || '',
                service_requested: custom.service_requested || '',
                source: selectedLead.source || 'website',
                stage: custom.stage || selectedLead.status || 'new',
                assigned_to: selectedLead.assigned_to || '',
                estimated_value: custom.estimated_value || 0,
            });
        }
    }, [selectedLead?.id]);

    const handleSaveLeadDetails = (e) => {
        e.preventDefault();
        if (!selectedLead) return;

        // Optimistically update selectedLead locally
        setSelectedLead((prev) => ({
            ...prev,
            company: editForm.data.company,
            first_name: editForm.data.first_name,
            last_name: editForm.data.last_name,
            email: editForm.data.email,
            phone: editForm.data.phone,
            source: editForm.data.source,
            assigned_to: editForm.data.assigned_to,
            assigned_user: users.find((u) => u.id == editForm.data.assigned_to) || prev?.assigned_user,
            custom_fields: {
                ...(prev?.custom_fields || {}),
                website: editForm.data.website,
                designation: editForm.data.designation,
                service_requested: editForm.data.service_requested,
                stage: editForm.data.stage,
                estimated_value: editForm.data.estimated_value,
            },
        }));

        editForm.patch(`/leads/${selectedLead.id}`, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Quick Views List
    const savedViews = [
        { id: 'all', label: 'All Leads', count: stats?.total_leads || 0 },
        { id: 'my_leads', label: 'My Leads', count: allLeads?.filter(l => l.assigned_to === users[0]?.id).length || 0 },
        { id: 'new', label: 'New', count: stats?.new_leads || 0 },
        { id: 'unassigned', label: 'Unassigned', count: stats?.unassigned_leads || 0 },
        { id: 'hot_leads', label: 'Hot Leads (>75)', count: allLeads?.filter(l => (l.custom_fields?.lead_score || 0) >= 75).length || 0 },
    ];

    const leadItems = leads?.data || [];
    const allSelected = leadItems.length > 0 && selectedIds.length === leadItems.length;

    // AJAX Partial Reload Filter Handler
    const applyFilters = (newParams = {}) => {
        const query = {
            search: searchTerm,
            view: currentView,
            stage: stageFilter,
            source: sourceFilter,
            assigned_to: assignedFilter,
            priority: priorityFilter,
            ...newParams,
        };

        Object.keys(query).forEach((k) => {
            if (query[k] === 'all' || query[k] === '' || query[k] === null) {
                delete query[k];
            }
        });

        router.get('/leads', query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSavedViewSelect = (viewId) => {
        setCurrentView(viewId);
        applyFilters({ view: viewId });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters({ search: searchTerm });
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setCurrentView('all');
        setStageFilter('all');
        setSourceFilter('all');
        setAssignedFilter('all');
        setPriorityFilter('all');
        router.get('/leads', {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // Bulk Selection Toggle
    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(leadItems.map((l) => l.id));
        }
    };

    const toggleSelectRow = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((i) => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // Submit Bulk Action (AJAX Partial Reload)
    const handleExecuteBulkAction = () => {
        if (selectedIds.length === 0 || !bulkActionType) return;
        router.post('/leads/bulk-action', {
            action: bulkActionType,
            ids: selectedIds,
            value: bulkActionValue,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setSelectedIds([]);
                setBulkActionType('');
                setBulkActionValue('');
            }
        });
    };

    // Export CSV
    const exportLeadsCSV = () => {
        const dataToExport = selectedIds.length > 0
            ? leadItems.filter(l => selectedIds.includes(l.id))
            : leadItems;

        if (dataToExport.length === 0) return;

        const headers = ['S.No', 'ID', 'Lead Name', 'Email', 'Phone', 'Company', 'Source', 'Service', 'Status', 'Score', 'Priority', 'Owner', 'Created At'];
        const rows = [headers.join(',')];

        dataToExport.forEach((l, idx) => {
            const serialNum = (leads?.total || leadItems.length) - ((leads?.current_page || 1) - 1) * (leads?.per_page || leadItems.length) - idx;
            rows.push([
                serialNum,
                l.id,
                `"${l.first_name} ${l.last_name || ''}"`,
                `"${l.email || ''}"`,
                `"${l.phone || ''}"`,
                `"${l.company || ''}"`,
                `"${l.source || ''}"`,
                `"${l.custom_fields?.service_requested || ''}"`,
                `"${l.custom_fields?.stage || l.status}"`,
                l.custom_fields?.lead_score || 50,
                `"${l.custom_fields?.priority || 'medium'}"`,
                `"${l.assigned_user?.name || 'Unassigned'}"`,
                `"${l.created_at}"`
            ].join(','));
        });

        const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Parse CSV Text for Import
    const handleParseCsv = (e) => {
        const text = e.target.value;
        setRawCsvText(text);
        if (!text.trim()) {
            setParsedImportLeads([]);
            return;
        }

        const lines = text.trim().split('\n');
        const parsed = [];
        lines.slice(1).forEach(line => {
            const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
            if (cols[0]) {
                parsed.push({
                    first_name: cols[0] || 'Inbound Lead',
                    last_name: cols[1] || '',
                    email: cols[2] || '',
                    phone: cols[3] || '',
                    company: cols[4] || '',
                    source: cols[5] || 'import',
                });
            }
        });
        setParsedImportLeads(parsed);
    };

    const handleExecuteImport = () => {
        if (parsedImportLeads.length === 0) return;
        router.post('/leads/import', { leads: parsedImportLeads }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsImportOpen(false);
                setRawCsvText('');
                setParsedImportLeads([]);
            }
        });
    };

    // Stage Update (AJAX Partial Reload)
    const handleUpdateStage = (leadId, newStage) => {
        router.patch(`/leads/${leadId}/stage`, { stage: newStage }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Submit Create Lead
    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post('/leads', {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    // Submit Lead Conversion
    const handleConvertSubmit = (e) => {
        e.preventDefault();
        if (!convertLead) return;
        convertForm.post(`/leads/${convertLead.id}/convert`, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setConvertLead(null);
            },
        });
    };

    const openConvertModal = (lead) => {
        setConvertLead(lead);
        const defaultPipe = pipelines[0];
        convertForm.setData({
            deal_title: `${lead.company || lead.first_name} — Deal`,
            pipeline_id: defaultPipe?.id || '',
            stage_id: defaultPipe?.stages[0]?.id || '',
            deal_value: lead.custom_fields?.estimated_value || 50000,
            expected_close: '',
        });
    };

    // Favicon Fetcher Helper
    const getFaviconUrl = (urlStr) => {
        if (!urlStr) return null;
        try {
            let clean = urlStr.trim();
            if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
                clean = 'https://' + clean;
            }
            const parsed = new URL(clean);
            return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;
        } catch (e) {
            return null;
        }
    };

    // Helper to calculate company initials fallback
    const getCompanyInitials = (name) => {
        if (!name) return 'CO';
        const words = name.trim().replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter(Boolean);
        if (words.length >= 2) {
            return `${words[0][0]}${words[1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    // Helper to format last activity / followup cell
    const getLastFollowupInfo = (lead) => {
        const activities = lead.activities || [];
        if (activities.length === 0) {
            return <span className="text-muted-foreground/50 italic text-[11px]">No followups</span>;
        }

        const sorted = [...activities].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        const lastAct = sorted[0];

        const typeMap = {
            call: { label: 'Call', icon: Phone, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-900/60' },
            email: { label: 'Email', icon: Mail, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900/60' },
            meeting: { label: 'Meeting', icon: Calendar, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-900/60' },
            note: { label: 'Note', icon: StickyNote, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900/60' },
        };
        const cfg = typeMap[lastAct.type] || typeMap.note;
        const IconComp = cfg.icon;

        return (
            <div className="min-w-0 max-w-[170px]">
                <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground truncate">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${cfg.color} shrink-0`}>
                        <IconComp className="w-2.5 h-2.5" />
                        {cfg.label}
                    </span>
                    <span className="truncate text-muted-foreground/90 font-medium text-[11px]">
                        {lastAct.description || lastAct.title || cfg.label}
                    </span>
                </div>
                <p className="text-[10px] text-muted-foreground/70 font-mono mt-0.5">
                    {formatDateTime(lastAct.created_at)}
                </p>
            </div>
        );
    };

    // Helper to format date & time nicely
    const formatDateTime = (dateString) => {
        if (!dateString) return 'Just now';
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return dateString;
            return d.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });
        } catch (e) {
            return dateString;
        }
    };

    // Log Activity
    const handleLogActivity = (e) => {
        e.preventDefault();
        if (!selectedLead) return;

        const defaultTitles = {
            call: 'Phone Call',
            email: 'Email Sent',
            meeting: 'Meeting',
            note: 'Internal Note',
        };
        const titleToUse = defaultTitles[activityType] || 'Activity Logged';
        const nowIso = new Date().toISOString();

        const newActivityObj = {
            id: Date.now(),
            type: activityType,
            title: titleToUse,
            description: activityDesc,
            next_action: nextActionText,
            next_action_due: activityType === 'meeting' ? nextActionDue : null,
            created_at: nowIso,
        };

        // Immediately reflect newly logged activity on top of timeline locally
        setSelectedLead((prev) => ({
            ...prev,
            activities: [newActivityObj, ...(prev?.activities || [])],
        }));

        router.post(
            `/leads/${selectedLead.id}/activity`,
            {
                type: activityType,
                title: titleToUse,
                description: activityDesc,
                next_action: nextActionText,
                next_action_due: activityType === 'meeting' ? nextActionDue : null,
                created_at: nowIso,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setActivityTitle('');
                    setActivityDesc('');
                    setNextActionText('');
                    setNextActionDue('');
                },
            }
        );
    };

    // Source Badge Helper
    const getSourceBadge = (src = 'website') => {
        const sourceMap = {
            website: { label: 'Website', color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' },
            google_ads: { label: 'Google Ads', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
            meta_ads: { label: 'Meta Ads', color: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800' },
            linkedin: { label: 'LinkedIn', color: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800' },
            instagram: { label: 'Instagram', color: 'bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border-pink-200 dark:border-pink-800' },
            whatsapp: { label: 'WhatsApp', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
            email: { label: 'Email', color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
            referral: { label: 'Referral', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
            api: { label: 'API', color: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800' },
            import: { label: 'Import', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700' },
            manual: { label: 'Manual', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700' },
        };
        const s = sourceMap[src] || { label: src.replace('_', ' '), color: 'bg-slate-100 text-slate-700 border-slate-200' };
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${s.color}`}>
                {s.label}
            </span>
        );
    };

    // Lead Score Badge Helper
    const getScoreBadge = (score = 50) => {
        if (score >= 75) {
            return (
                <span className="inline-flex items-center gap-1 font-bold text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900/60">
                    <Flame className="w-3 h-3 fill-rose-500" /> {score}
                </span>
            );
        } else if (score >= 45) {
            return (
                <span className="inline-flex items-center gap-1 font-bold text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/60">
                    <Zap className="w-3 h-3 text-amber-500" /> {score}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                {score}
            </span>
        );
    };

    // Priority Helper
    const getPriorityIndicator = (p = 'medium') => {
        if (p === 'high') {
            return <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> High</span>;
        } else if (p === 'medium') {
            return <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Medium</span>;
        }
        return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Low</span>;
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const isFiltered = searchTerm || stageFilter !== 'all' || sourceFilter !== 'all' || assignedFilter !== 'all' || priorityFilter !== 'all' || currentView !== 'all';

    return (
        <AppLayout title="Leads — AppLead">
            <div className="space-y-3.5 w-full pb-6">
                {/* ── 1. Header (Identical to Lead Sources Page) ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-border/80 pb-2.5">
                    <div className="flex items-center gap-2">
                        <Waypoints className="w-5 h-5 text-indigo-600" />
                        <h1 className="text-xl font-extrabold text-foreground tracking-tight">Leads</h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsAnalyticsOpen(true)}
                            className="gap-1.5 border-border text-xs font-semibold h-8"
                        >
                            <BarChart3 className="w-3.5 h-3.5 text-indigo-500" /> Analytics
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsImportOpen(true)}
                            className="gap-1.5 border-border text-xs font-semibold h-8"
                        >
                            <Upload className="w-3.5 h-3.5" /> Import
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={exportLeadsCSV}
                            className="gap-1.5 border-border text-xs font-semibold h-8"
                        >
                            <Download className="w-3.5 h-3.5" /> Export
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.reload()}
                            className="gap-1.5 border-border text-xs font-semibold h-8 px-2.5"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                            size="sm"
                            className="gap-1.5 font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs h-8 cursor-pointer"
                            onClick={() => setIsCreateOpen(true)}
                        >
                            <Plus className="w-4 h-4" /> Add Lead
                        </Button>
                    </div>
                </div>

                {/* ── 3. Search & Multi-Filter Control Bar ── */}
                <Card className="bg-card border-border/60 shadow-xs p-3">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-2.5">
                        {/* Search Input */}
                        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
                            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search companies by name, website, email, phone, or contact person..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-8 py-1.5 text-xs bg-muted/40 hover:bg-muted/70 focus:bg-background border border-border rounded-xl focus:ring-1 focus:ring-primary focus:outline-hidden text-foreground placeholder:text-muted-foreground transition-all"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm('');
                                        applyFilters({ search: '' });
                                    }}
                                    className="absolute right-3 top-2 text-muted-foreground hover:text-foreground cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </form>

                        {/* Filter Dropdowns Row */}
                        <div className="flex flex-wrap items-center gap-2 self-end lg:self-auto shrink-0">
                            <div className="flex items-center gap-1.5 text-muted-foreground font-semibold text-[11px] mr-1">
                                <Filter className="w-3.5 h-3.5" /> Filters:
                            </div>

                            {/* View / Saved Views Filter Dropdown */}
                            <select
                                value={currentView}
                                onChange={(e) => handleSavedViewSelect(e.target.value)}
                                className="bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-lg px-3 py-1.5 text-indigo-700 dark:text-indigo-300 focus:ring-1 focus:ring-primary font-bold text-xs cursor-pointer"
                            >
                                {savedViews.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        View: {cat.label} ({cat.count})
                                    </option>
                                ))}
                            </select>

                        <select
                            value={stageFilter}
                            onChange={(e) => {
                                setStageFilter(e.target.value);
                                applyFilters({ stage: e.target.value });
                            }}
                            className="bg-muted/40 border border-border rounded-lg px-3 py-1.5 text-foreground focus:ring-1 focus:ring-primary font-medium text-xs"
                        >
                            <option value="all">All Statuses</option>
                            {stages.map((st) => (
                                <option key={st.id} value={st.id}>
                                    {st.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={sourceFilter}
                            onChange={(e) => {
                                setSourceFilter(e.target.value);
                                applyFilters({ source: e.target.value });
                            }}
                            className="bg-muted/40 border border-border rounded-lg px-3 py-1.5 text-foreground focus:ring-1 focus:ring-primary font-medium text-xs"
                        >
                            <option value="all">All Sources</option>
                            <option value="website">Website</option>
                            <option value="google_ads">Google Ads</option>
                            <option value="meta_ads">Meta Ads</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="instagram">Instagram</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="email">Email</option>
                            <option value="referral">Referral</option>
                            <option value="manual">Manual</option>
                        </select>

                        <select
                            value={assignedFilter}
                            onChange={(e) => {
                                setAssignedFilter(e.target.value);
                                applyFilters({ assigned_to: e.target.value });
                            }}
                            className="bg-muted/40 border border-border rounded-lg px-3 py-1.5 text-foreground focus:ring-1 focus:ring-primary font-medium text-xs"
                        >
                            <option value="all">All Owners</option>
                            <option value="unassigned">Unassigned</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={priorityFilter}
                            onChange={(e) => {
                                setPriorityFilter(e.target.value);
                                applyFilters({ priority: e.target.value });
                            }}
                            className="bg-muted/40 border border-border rounded-lg px-3 py-1.5 text-foreground focus:ring-1 focus:ring-primary font-medium text-xs"
                        >
                            <option value="all">All Priorities</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>

                        {isFiltered && (
                            <Button
                                variant="ghost"
                                size="xs"
                                onClick={handleResetFilters}
                                className="text-xs text-rose-500 hover:text-rose-600 gap-1 h-7.5 px-2.5 font-semibold"
                            >
                                <X className="w-3.5 h-3.5" /> Clear Filters
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

                {/* ── 4. Floating Contextual Bulk Action Toolbar ── */}
                {selectedIds.length > 0 && (
                    <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-between gap-4 shadow-xl border border-slate-700 text-xs animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-3 font-semibold">
                            <span className="bg-indigo-600 px-3 py-1 rounded-lg text-white font-bold">
                                {selectedIds.length} leads selected
                            </span>
                            <span className="text-slate-300 hidden sm:inline">Choose a bulk action:</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <select
                                value={bulkActionType}
                                onChange={(e) => setBulkActionType(e.target.value)}
                                className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-1.5 font-medium"
                            >
                                <option value="">Select Action...</option>
                                <option value="assign">Assign Owner</option>
                                <option value="status">Change Status</option>
                                <option value="priority">Change Priority</option>
                                <option value="merge">Merge Selected Leads</option>
                                <option value="delete">Delete</option>
                            </select>

                            {bulkActionType === 'merge' && (
                                <span className="text-[11px] text-amber-300 font-semibold px-2.5 py-1 bg-amber-950/60 rounded-lg border border-amber-800/60">
                                    Merges into 1st lead (#{selectedIds[0]})
                                </span>
                            )}

                            {bulkActionType === 'assign' && (
                                <select
                                    value={bulkActionValue}
                                    onChange={(e) => setBulkActionValue(e.target.value)}
                                    className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-1.5 font-medium"
                                >
                                    <option value="">Select Representative...</option>
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {bulkActionType === 'status' && (
                                <select
                                    value={bulkActionValue}
                                    onChange={(e) => setBulkActionValue(e.target.value)}
                                    className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-1.5 font-medium"
                                >
                                    <option value="">Select Target Status...</option>
                                    {stages.map((st) => (
                                        <option key={st.id} value={st.id}>
                                            {st.name}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {bulkActionType === 'priority' && (
                                <select
                                    value={bulkActionValue}
                                    onChange={(e) => setBulkActionValue(e.target.value)}
                                    className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-1.5 font-medium"
                                >
                                    <option value="">Select Priority...</option>
                                    <option value="high">High Priority</option>
                                    <option value="medium">Medium Priority</option>
                                    <option value="low">Low Priority</option>
                                </select>
                            )}

                            <Button
                                size="xs"
                                onClick={handleExecuteBulkAction}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 px-4 text-xs font-bold rounded-xl"
                            >
                                Apply Action
                            </Button>

                            <button onClick={() => setSelectedIds([])} className="text-slate-400 hover:text-white p-1 ml-1 cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ── 5. Main Lead / Company Table Card ── */}
                <Card className="bg-card border-border shadow-xs overflow-hidden rounded-2xl">
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-left text-xs min-w-[1000px]">
                            <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="py-3 px-3.5 pl-4 w-9">
                                        <button onClick={toggleSelectAll} className="text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center">
                                            {allSelected ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4" />}
                                        </button>
                                    </th>
                                    <th className="py-3 px-2 w-10 text-center">#</th>
                                    <th className="py-3 px-3.5 min-w-[200px]">Company Name</th>
                                    <th className="py-3 px-3.5 min-w-[150px]">Company Website</th>
                                    <th className="py-3 px-3.5 min-w-[130px]">Phone Number</th>
                                    <th className="py-3 px-3.5 min-w-[130px]">Status</th>
                                    <th className="py-3 px-3.5 min-w-[130px]">Owner</th>
                                    <th className="py-3 px-3.5 pr-4 text-right min-w-[120px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60 relative">
                                {isUpdating && (
                                    <tr className="bg-indigo-600/10 border-b border-indigo-500/20">
                                        <td colSpan={8} className="p-2 text-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                                                <span>Updating records...</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {leadItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-16 text-muted-foreground">
                                            <div className="max-w-xs mx-auto space-y-2">
                                                <Inbox className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                                                <p className="font-semibold text-foreground text-sm">No companies found</p>
                                                <p className="text-xs">No company records matched your search or active view filters.</p>
                                                {isFiltered && (
                                                    <Button variant="outline" size="xs" onClick={handleResetFilters} className="mt-2">
                                                        Reset All Filters
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    leadItems.map((lead, idx) => {
                                        const isSelected = selectedIds.includes(lead.id);
                                        const custom = lead.custom_fields || {};
                                        const stageName = custom.stage || lead.status || 'new';

                                        const totalCount = leads?.total || leadItems.length;
                                        const currentPage = leads?.current_page || 1;
                                        const perPage = leads?.per_page || leadItems.length;
                                        const serialNum = totalCount - ((currentPage - 1) * perPage) - idx;

                                        const companyName = lead.company || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unspecified Company';
                                        const websiteUrl = custom.website || (lead.website ? lead.website : null);
                                        const faviconUrl = getFaviconUrl(websiteUrl);

                                        return (
                                            <tr
                                                key={lead.id}
                                                className={`hover:bg-muted/40 transition-colors cursor-pointer ${
                                                    isSelected ? 'bg-indigo-50/70 dark:bg-indigo-950/30' : ''
                                                }`}
                                                onClick={() => setSelectedLead(lead)}
                                            >
                                                <td className="py-2.5 px-3.5 pl-4" onClick={(e) => e.stopPropagation()}>
                                                    <button onClick={() => toggleSelectRow(lead.id)} className="cursor-pointer flex items-center justify-center">
                                                        {isSelected ? (
                                                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                                                        ) : (
                                                            <Square className="w-4 h-4 text-muted-foreground/60" />
                                                        )}
                                                    </button>
                                                </td>

                                                {/* 1. Serial Number (latest first) */}
                                                <td className="py-2.5 px-2 text-center font-mono font-bold text-muted-foreground/80 text-[11px]">
                                                    {serialNum}
                                                </td>

                                                {/* 2. Company Name (icon + company name only) */}
                                                <td className="py-2.5 px-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-5 h-5 rounded-[4px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold text-[9px] flex items-center justify-center shrink-0 overflow-hidden relative">
                                                            {faviconUrl ? (
                                                                <img
                                                                    src={faviconUrl}
                                                                    alt={companyName}
                                                                    className="w-5 h-5 object-contain rounded-[4px]"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                                                    }}
                                                                />
                                                            ) : null}
                                                            <div className={`items-center justify-center w-full h-full font-bold text-[9px] uppercase ${faviconUrl ? 'hidden' : 'flex'}`}>
                                                                {getCompanyInitials(companyName)}
                                                            </div>
                                                        </div>
                                                        <div className="font-bold text-foreground text-xs hover:text-indigo-600 transition-colors truncate">
                                                            {companyName}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* 3. Company Website */}
                                                <td className="py-2.5 px-3.5">
                                                    {websiteUrl ? (
                                                        <a
                                                            href={websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium truncate max-w-[160px]"
                                                        >
                                                            <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                                            <span className="truncate">{websiteUrl.replace(/^https?:\/\//i, '').replace(/\/$/, '')}</span>
                                                        </a>
                                                    ) : (
                                                        <span className="text-muted-foreground/50 italic text-[11px]">No website</span>
                                                    )}
                                                </td>

                                                {/* 4. Phone Number */}
                                                <td className="py-2.5 px-3.5">
                                                    {lead.phone ? (
                                                        <a
                                                            href={`tel:${lead.phone}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-mono font-semibold"
                                                        >
                                                            <Phone className="w-3 h-3 shrink-0" />
                                                            <span>{lead.phone}</span>
                                                        </a>
                                                    ) : (
                                                        <span className="text-muted-foreground/50 italic text-[11px]">—</span>
                                                    )}
                                                </td>

                                                {/* 5. Status */}
                                                <td className="py-2.5 px-3.5" onClick={(e) => e.stopPropagation()}>
                                                    <select
                                                        value={stageName}
                                                        onChange={(e) => handleUpdateStage(lead.id, e.target.value)}
                                                        className="h-7 text-xs font-semibold bg-muted/60 hover:bg-muted border border-border/80 rounded-lg px-2 py-0.5 text-foreground focus:ring-1 focus:ring-primary cursor-pointer"
                                                    >
                                                        {stages.map((s) => (
                                                            <option key={s.id} value={s.id}>
                                                                {s.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>

                                                {/* 7. Owner */}
                                                <td className="py-2.5 px-3.5 font-medium text-foreground">
                                                    {lead.assigned_user?.name ? (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/60">
                                                            <UserCheck className="w-3 h-3" />
                                                            {lead.assigned_user.name}
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-semibold border border-border/40">
                                                            Unassigned
                                                        </span>
                                                    )}
                                                </td>

                                                {/* 8. Actions (2 bigger, clear icon buttons) */}
                                                <td className="py-2.5 px-3.5 pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            type="button"
                                                            className="w-8 h-8 rounded-lg text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 border border-indigo-200 dark:border-indigo-800 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                                                            onClick={() => setSelectedLead(lead)}
                                                            title="View & Edit Details"
                                                        >
                                                            <Eye className="w-4.5 h-4.5" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="w-8 h-8 rounded-lg text-emerald-600 dark:text-emerald-400 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 border border-emerald-200 dark:border-emerald-800 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                                                            onClick={() => openConvertModal(lead)}
                                                            title="Convert to Opportunity"
                                                        >
                                                            <ArrowRightCircle className="w-4.5 h-4.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </CardContent>

                    {/* Pagination */}
                    {leads?.links && leads.links.length > 1 && (
                        <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-card">
                            <div className="text-muted-foreground font-semibold">
                                Showing <strong className="text-foreground">{leads.from || 1}</strong> to <strong className="text-foreground">{leads.to || leadItems.length}</strong> of <strong className="text-foreground">{leads.total || leadItems.length}</strong> leads
                            </div>

                            <div className="flex items-center gap-1 overflow-x-auto">
                                {leads.links.map((link, idx) => {
                                    if (!link.url) {
                                        return (
                                            <span
                                                key={idx}
                                                className="px-3 py-1.5 rounded-lg border border-border/40 text-muted-foreground/40 text-xs font-semibold cursor-not-allowed"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    }

                                    return (
                                        <Link
                                            key={idx}
                                            href={link.url}
                                            preserveState
                                            preserveScroll
                                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                                                link.active
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                                    : 'bg-background border-border text-foreground hover:bg-muted'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </Card>

                {/* ── Slide-Over Lead Detail Panel (Right Attached, 60% Width, Full Height) ── */}
                {selectedLead && (
                    <div
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end"
                        onClick={() => setSelectedLead(null)}
                    >
                        <div
                            className="bg-card border-l border-border w-full max-w-[95vw] lg:w-[60vw] lg:max-w-[60vw] h-full shadow-2xl flex flex-col overflow-hidden animate-slide-in"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between p-4 px-6 border-b border-border bg-muted/30 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs shrink-0">
                                        {`${(selectedLead.first_name || 'L')[0]}${(selectedLead.last_name || '')[0] || ''}`.toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-lg font-extrabold text-foreground leading-none">
                                                {selectedLead.first_name} {selectedLead.last_name}
                                            </h2>
                                            <Badge variant="outline" className="text-[10px] uppercase font-bold text-indigo-600 border-indigo-200 dark:border-indigo-800">
                                                {selectedLead.custom_fields?.stage || selectedLead.status || 'New'}
                                            </Badge>
                                            {getSourceBadge(selectedLead.source)}
                                        </div>
                                        {selectedLead.company && (
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 font-medium">
                                                <Building2 className="w-3.5 h-3.5" /> {selectedLead.company}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedLead(null)}
                                    className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Drawer Body: 2 Columns */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border overflow-y-auto flex-1 p-6 gap-6">
                                {/* Column 1 (Left): Editable Company Details & Log Interaction */}
                                <div className="space-y-4 pr-0 lg:pr-2">
                                    {/* Editable Company & Lead Details Form */}
                                    <form onSubmit={handleSaveLeadDetails} className="p-4 bg-card rounded-xl border border-border space-y-3.5 shadow-2xs">
                                        <div className="flex items-center justify-between border-b border-border pb-2">
                                            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                                                <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Editable Company Details
                                            </h4>
                                            <span className="text-[10px] text-muted-foreground font-semibold">
                                                Click Save to update
                                            </span>
                                        </div>

                                        {/* Company & Website */}
                                        <div className="grid grid-cols-2 gap-2.5">
                                            <div>
                                                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                                                    Company Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editForm.data.company}
                                                    onChange={(e) => editForm.setData('company', e.target.value)}
                                                    placeholder="Company Name"
                                                    className="w-full text-xs bg-muted/40 hover:bg-muted/70 focus:bg-background border border-border rounded-lg p-2 text-foreground font-semibold"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                                                    Website URL
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editForm.data.website}
                                                    onChange={(e) => editForm.setData('website', e.target.value)}
                                                    placeholder="https://example.com"
                                                    className="w-full text-xs bg-muted/40 hover:bg-muted/70 focus:bg-background border border-border rounded-lg p-2 text-foreground font-medium"
                                                />
                                            </div>
                                        </div>

                                        {/* Contact Person (First Name, Last Name, Designation) */}
                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                                                    First Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editForm.data.first_name}
                                                    onChange={(e) => editForm.setData('first_name', e.target.value)}
                                                    placeholder="First Name"
                                                    className="w-full text-xs bg-muted/40 hover:bg-muted/70 focus:bg-background border border-border rounded-lg p-2 text-foreground"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                                                    Last Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editForm.data.last_name}
                                                    onChange={(e) => editForm.setData('last_name', e.target.value)}
                                                    placeholder="Last Name"
                                                    className="w-full text-xs bg-muted/40 hover:bg-muted/70 focus:bg-background border border-border rounded-lg p-2 text-foreground"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                                                    Designation
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editForm.data.designation}
                                                    onChange={(e) => editForm.setData('designation', e.target.value)}
                                                    placeholder="e.g. CEO"
                                                    className="w-full text-xs bg-muted/40 hover:bg-muted/70 focus:bg-background border border-border rounded-lg p-2 text-foreground"
                                                />
                                            </div>
                                        </div>

                                        {/* Phone & Email */}
                                        <div className="grid grid-cols-2 gap-2.5">
                                            <div>
                                                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                                                    Phone Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editForm.data.phone}
                                                    onChange={(e) => editForm.setData('phone', e.target.value)}
                                                    placeholder="Phone"
                                                    className="w-full text-xs bg-muted/40 hover:bg-muted/70 focus:bg-background border border-border rounded-lg p-2 text-foreground font-mono"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    value={editForm.data.email}
                                                    onChange={(e) => editForm.setData('email', e.target.value)}
                                                    placeholder="Email"
                                                    className="w-full text-xs bg-muted/40 hover:bg-muted/70 focus:bg-background border border-border rounded-lg p-2 text-foreground"
                                                />
                                            </div>
                                        </div>

                                        {/* Status & Owner */}
                                        <div className="grid grid-cols-2 gap-2.5">
                                            <div>
                                                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                                                    Status / Stage
                                                </label>
                                                <select
                                                    value={editForm.data.stage}
                                                    onChange={(e) => editForm.setData('stage', e.target.value)}
                                                    className="w-full text-xs bg-muted/40 hover:bg-muted/70 focus:bg-background border border-border rounded-lg p-2 text-foreground font-semibold"
                                                >
                                                    {stages.map((s) => (
                                                        <option key={s.id} value={s.id}>
                                                            {s.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                                                    Assigned Owner
                                                </label>
                                                <select
                                                    value={editForm.data.assigned_to}
                                                    onChange={(e) => editForm.setData('assigned_to', e.target.value)}
                                                    className="w-full text-xs bg-muted/40 hover:bg-muted/70 focus:bg-background border border-border rounded-lg p-2 text-foreground font-medium"
                                                >
                                                    <option value="">Unassigned</option>
                                                    {users.map((u) => (
                                                        <option key={u.id} value={u.id}>
                                                            {u.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Service Requested & Est Deal Value & Source */}
                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                                                    Service
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editForm.data.service_requested}
                                                    onChange={(e) => editForm.setData('service_requested', e.target.value)}
                                                    placeholder="Service"
                                                    className="w-full text-xs bg-muted/40 hover:bg-muted/70 focus:bg-background border border-border rounded-lg p-2 text-foreground"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                                                    Est. Value (₹)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={editForm.data.estimated_value}
                                                    onChange={(e) => editForm.setData('estimated_value', e.target.value)}
                                                    placeholder="Value"
                                                    className="w-full text-xs bg-muted/40 hover:bg-muted/70 focus:bg-background border border-border rounded-lg p-2 text-foreground font-semibold"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                                                    Source
                                                </label>
                                                <select
                                                    value={editForm.data.source}
                                                    onChange={(e) => editForm.setData('source', e.target.value)}
                                                    className="w-full text-xs bg-muted/40 hover:bg-muted/70 focus:bg-background border border-border rounded-lg p-2 text-foreground capitalize"
                                                >
                                                    <option value="website">Website</option>
                                                    <option value="google_ads">Google Ads</option>
                                                    <option value="meta_ads">Meta Ads</option>
                                                    <option value="linkedin">LinkedIn</option>
                                                    <option value="instagram">Instagram</option>
                                                    <option value="whatsapp">WhatsApp</option>
                                                    <option value="email">Email</option>
                                                    <option value="referral">Referral</option>
                                                    <option value="manual">Manual</option>
                                                </select>
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={editForm.processing}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 font-bold shadow-xs cursor-pointer"
                                        >
                                            Save Details
                                        </Button>
                                    </form>

                                    {/* Log Interaction Form (Left Side) */}
                                    <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200/80 dark:border-indigo-900/50 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                                                <Send className="w-3.5 h-3.5 text-indigo-600" /> Log Interaction
                                            </h4>
                                            <span className="text-[10px] font-mono text-indigo-500 font-semibold">
                                                Auto Date & Time
                                            </span>
                                        </div>

                                        <form onSubmit={handleLogActivity} className="space-y-3">
                                            <div>
                                                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                                                    Interaction Type
                                                </label>
                                                <select
                                                    value={activityType}
                                                    onChange={(e) => setActivityType(e.target.value)}
                                                    className="w-full text-xs bg-background border border-border rounded-lg p-2 text-foreground font-medium focus:ring-1 focus:ring-indigo-500"
                                                >
                                                    <option value="call">📞 Phone Call</option>
                                                    <option value="email">✉️ Email Interaction</option>
                                                    <option value="meeting">📅 Scheduled Meeting</option>
                                                    <option value="note">📝 Internal Note</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                                                    Discussion Details & Notes
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    placeholder="Enter notes, discussion points, or call summary..."
                                                    value={activityDesc}
                                                    onChange={(e) => setActivityDesc(e.target.value)}
                                                    className="w-full text-xs bg-background border border-border rounded-lg p-2.5 text-foreground placeholder:text-muted-foreground"
                                                ></textarea>
                                            </div>

                                            {/* Show Meeting Date ONLY if activityType is 'meeting' */}
                                            {activityType === 'meeting' ? (
                                                <div>
                                                    <label className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mb-1">
                                                        <Calendar className="w-3.5 h-3.5" /> Meeting Date & Time *
                                                    </label>
                                                    <input
                                                        type="date"
                                                        required
                                                        value={nextActionDue}
                                                        onChange={(e) => setNextActionDue(e.target.value)}
                                                        className="w-full text-xs bg-background border border-indigo-300 dark:border-indigo-700 rounded-lg p-2 text-foreground font-medium"
                                                    />
                                                </div>
                                            ) : (
                                                <div>
                                                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                                                        Next Follow-up Action (Optional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Follow up call next Tuesday..."
                                                        value={nextActionText}
                                                        onChange={(e) => setNextActionText(e.target.value)}
                                                        className="w-full text-xs bg-background border border-border rounded-lg p-2 text-foreground"
                                                    />
                                                </div>
                                            )}

                                            <Button
                                                type="submit"
                                                size="sm"
                                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 font-bold shadow-xs gap-1.5 cursor-pointer"
                                            >
                                                <Send className="w-3.5 h-3.5" /> Save Interaction Log
                                            </Button>
                                        </form>
                                    </div>
                                </div>

                                {/* Column 2 (Right): All Activity History (Latest on top) */}
                                <div className="space-y-4 pl-0 lg:pl-2 pt-4 lg:pt-0">
                                    <div className="flex items-center justify-between border-b border-border pb-2.5">
                                        <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-indigo-600" /> Activity History
                                        </h3>
                                        <span className="text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                                            {selectedLead.activities?.length || 0} Events
                                        </span>
                                    </div>

                                    {/* Activities List (Sorted Latest to Oldest) */}
                                    {(!selectedLead.activities || selectedLead.activities.length === 0) ? (
                                        <div className="p-8 text-center bg-muted/20 border border-dashed border-border rounded-xl space-y-2">
                                            <Clock className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                                            <p className="text-xs font-semibold text-muted-foreground">No activity recorded yet</p>
                                            <p className="text-[11px] text-muted-foreground/70">Use the form on the left to log calls, emails, or meetings.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)] pr-1">
                                            {[...(selectedLead.activities || [])]
                                                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                                .map((act) => {
                                                    const typeConfigs = {
                                                        call: {
                                                            label: 'Phone Call',
                                                            bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900',
                                                            icon: Phone,
                                                        },
                                                        email: {
                                                            label: 'Email Sent',
                                                            bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900',
                                                            icon: Mail,
                                                        },
                                                        meeting: {
                                                            label: 'Meeting',
                                                            bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
                                                            icon: Calendar,
                                                        },
                                                        note: {
                                                            label: 'Internal Note',
                                                            bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900',
                                                            icon: StickyNote,
                                                        },
                                                    };
                                                    const cfg = typeConfigs[act.type] || typeConfigs.call;
                                                    const IconComponent = cfg.icon;

                                                    return (
                                                        <div
                                                            key={act.id}
                                                            className="p-3.5 bg-card hover:bg-muted/40 rounded-xl border border-border/80 shadow-2xs space-y-2 transition-all"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${cfg.bg}`}>
                                                                        <IconComponent className="w-3 h-3" />
                                                                        {cfg.label}
                                                                    </span>
                                                                    {act.title && act.title !== cfg.label && (
                                                                        <span className="font-semibold text-xs text-foreground">
                                                                            {act.title}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="text-[10px] text-muted-foreground font-mono font-medium">
                                                                    {formatDateTime(act.created_at)}
                                                                </span>
                                                            </div>

                                                            {act.description && (
                                                                <p className="text-xs text-foreground/90 bg-muted/30 p-2.5 rounded-lg border border-border/40 whitespace-pre-wrap">
                                                                    {act.description}
                                                                </p>
                                                            )}

                                                            {(act.next_action || act.next_action_due) && (
                                                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                                                    {act.next_action && (
                                                                        <span className="text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-md">
                                                                            Follow-up: {act.next_action}
                                                                        </span>
                                                                    )}
                                                                    {act.next_action_due && (
                                                                        <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                                                                            📅 Meeting: {new Date(act.next_action_due).toLocaleDateString()}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Modal 1: CREATE COMPANY MODAL ── */}
                {isCreateOpen && (
                    <div
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
                        onClick={() => setIsCreateOpen(false)}
                    >
                        <div
                            className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-border">
                                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-indigo-600" /> Add New Company
                                </h3>
                                <button onClick={() => setIsCreateOpen(false)} className="text-muted-foreground hover:text-foreground">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
                                <div>
                                    <label className="font-semibold text-foreground block mb-1">Company Name *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Acme Corporation"
                                        value={createForm.data.company}
                                        onChange={(e) => createForm.setData('company', e.target.value)}
                                        className="w-full bg-muted/40 border border-border rounded-lg p-2 text-foreground"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-semibold text-foreground block mb-1">Company Website (Optional)</label>
                                        <input
                                            type="url"
                                            placeholder="https://acme.com"
                                            value={createForm.data.website}
                                            onChange={(e) => createForm.setData('website', e.target.value)}
                                            className="w-full bg-muted/40 border border-border rounded-lg p-2 text-foreground"
                                        />
                                    </div>
                                    <div>
                                        <label className="font-semibold text-foreground block mb-1">Phone Number (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="+91 98765 43210"
                                            value={createForm.data.phone}
                                            onChange={(e) => createForm.setData('phone', e.target.value)}
                                            className="w-full bg-muted/40 border border-border rounded-lg p-2 text-foreground"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-semibold text-foreground block mb-1">Email Address (Optional)</label>
                                        <input
                                            type="email"
                                            placeholder="contact@acme.com"
                                            value={createForm.data.email}
                                            onChange={(e) => createForm.setData('email', e.target.value)}
                                            className="w-full bg-muted/40 border border-border rounded-lg p-2 text-foreground"
                                        />
                                    </div>
                                    <div>
                                        <label className="font-semibold text-foreground block mb-1">Designation (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Founder & CEO"
                                            value={createForm.data.designation}
                                            onChange={(e) => createForm.setData('designation', e.target.value)}
                                            className="w-full bg-muted/40 border border-border rounded-lg p-2 text-foreground"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-semibold text-foreground block mb-1">Contact First Name (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="Rahul"
                                            value={createForm.data.first_name}
                                            onChange={(e) => createForm.setData('first_name', e.target.value)}
                                            className="w-full bg-muted/40 border border-border rounded-lg p-2 text-foreground"
                                        />
                                    </div>
                                    <div>
                                        <label className="font-semibold text-foreground block mb-1">Contact Last Name (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="Sharma"
                                            value={createForm.data.last_name}
                                            onChange={(e) => createForm.setData('last_name', e.target.value)}
                                            className="w-full bg-muted/40 border border-border rounded-lg p-2 text-foreground"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-semibold text-foreground block mb-1">Source</label>
                                        <select
                                            value={createForm.data.source}
                                            onChange={(e) => createForm.setData('source', e.target.value)}
                                            className="w-full bg-muted/40 border border-border rounded-lg p-2 text-foreground"
                                        >
                                            <option value="website">Website</option>
                                            <option value="google_ads">Google Ads</option>
                                            <option value="meta_ads">Meta Ads</option>
                                            <option value="linkedin">LinkedIn</option>
                                            <option value="instagram">Instagram</option>
                                            <option value="whatsapp">WhatsApp</option>
                                            <option value="email">Email</option>
                                            <option value="referral">Referral</option>
                                            <option value="manual">Manual Entry</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="font-semibold text-foreground block mb-1">Assigned Owner</label>
                                        <select
                                            value={createForm.data.assigned_to}
                                            onChange={(e) => createForm.setData('assigned_to', e.target.value)}
                                            className="w-full bg-muted/40 border border-border rounded-lg p-2 text-foreground"
                                        >
                                            {users.map((u) => (
                                                <option key={u.id} value={u.id}>
                                                    {u.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                                    <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" size="sm" disabled={createForm.processing} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                        Save Company
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── Modal 2: CONVERT LEAD MODAL ── */}
                {convertLead && (
                    <div
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
                        onClick={() => setConvertLead(null)}
                    >
                        <div
                            className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-border">
                                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Convert Lead to Deal
                                </h3>
                                <button onClick={() => setConvertLead(null)} className="text-muted-foreground hover:text-foreground">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300">
                                Converting <strong>{convertLead.first_name} {convertLead.last_name}</strong> will create a new deal opportunity.
                            </div>

                            <form onSubmit={handleConvertSubmit} className="space-y-3 text-xs">
                                <div>
                                    <label className="font-semibold text-foreground">Deal Title *</label>
                                    <input
                                        type="text"
                                        required
                                        value={convertForm.data.deal_title}
                                        onChange={(e) => convertForm.setData('deal_title', e.target.value)}
                                        className="w-full bg-muted/40 border border-border rounded-lg p-2 mt-1 text-foreground"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-semibold text-foreground">Deal Value (₹)</label>
                                        <input
                                            type="number"
                                            value={convertForm.data.deal_value}
                                            onChange={(e) => convertForm.setData('deal_value', e.target.value)}
                                            className="w-full bg-muted/40 border border-border rounded-lg p-2 mt-1 text-foreground"
                                        />
                                    </div>
                                    <div>
                                        <label className="font-semibold text-foreground">Close Date</label>
                                        <input
                                            type="date"
                                            value={convertForm.data.expected_close}
                                            onChange={(e) => convertForm.setData('expected_close', e.target.value)}
                                            className="w-full bg-muted/40 border border-border rounded-lg p-2 mt-1 text-foreground"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                                    <Button type="button" variant="outline" size="sm" onClick={() => setConvertLead(null)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" size="sm" disabled={convertForm.processing} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                        Confirm Convert
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── Modal 3: CSV IMPORT MODAL ── */}
                {isImportOpen && (
                    <div
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
                        onClick={() => setIsImportOpen(false)}
                    >
                        <div
                            className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-border">
                                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                    <Upload className="w-5 h-5 text-indigo-600" /> Import Leads
                                </h3>
                                <button onClick={() => setIsImportOpen(false)} className="text-muted-foreground hover:text-foreground">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-3 text-xs">
                                <p className="text-muted-foreground">
                                    Paste CSV text: <code>First Name, Last Name, Email, Phone, Company, Source</code>
                                </p>

                                <textarea
                                    rows={5}
                                    placeholder="First Name, Last Name, Email, Phone, Company, Source&#10;Rahul, Sharma, rahul@abc.com, 9876543210, ABC Ltd, Website"
                                    value={rawCsvText}
                                    onChange={handleParseCsv}
                                    className="w-full font-mono bg-muted/40 border border-border rounded-lg p-2.5 text-foreground"
                                ></textarea>

                                {parsedImportLeads.length > 0 && (
                                    <div className="p-2.5 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-lg border border-indigo-200 dark:border-indigo-900 text-indigo-900 dark:text-indigo-300 font-semibold">
                                        {parsedImportLeads.length} leads ready for import.
                                    </div>
                                )}

                                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                                    <Button type="button" variant="outline" size="sm" onClick={() => setIsImportOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleExecuteImport}
                                        disabled={parsedImportLeads.length === 0}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                        Import {parsedImportLeads.length} Leads
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Drawer 4: SOURCE ANALYTICS DRAWER ── */}
                {isAnalyticsOpen && (
                    <div
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end"
                        onClick={() => setIsAnalyticsOpen(false)}
                    >
                        <div
                            className="bg-card border-l border-border w-full max-w-md h-full p-6 shadow-2xl overflow-y-auto space-y-4 animate-slide-in"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-border">
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">Lead Source Analytics</h3>
                                    <p className="text-xs text-muted-foreground">Acquisition channels breakdown</p>
                                </div>
                                <button onClick={() => setIsAnalyticsOpen(false)} className="text-muted-foreground hover:text-foreground">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {Object.entries(sourceBreakdown || {}).map(([src, count]) => {
                                    const total = stats?.total_leads || 1;
                                    const pct = Math.round((count / total) * 100);
                                    return (
                                        <div key={src} className="space-y-1">
                                            <div className="flex justify-between text-xs font-semibold">
                                                <span className="capitalize">{src.replace('_', ' ')}</span>
                                                <span>{count} ({pct}%)</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-600 rounded-full"
                                                    style={{ width: `${pct}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
