import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Link, router } from '@inertiajs/react';
import {
    Plus, Download, Upload, Filter, ArrowUpDown, ArrowUp, ArrowDown,
    Trash2, X, Check, FileSpreadsheet, RefreshCw, MoreVertical,
    SlidersHorizontal, FileText, CheckSquare, Square
} from 'lucide-react';
import { useState } from 'react';

export default function ContactsIndex({ contacts, filters, users }) {
    const [selectedIds, setSelectedIds] = useState([]);
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [sourceFilter, setSourceFilter] = useState(filters?.source || 'all');
    const [assignedFilter, setAssignedFilter] = useState(filters?.assigned_to || 'all');
    const [sortBy, setSortBy] = useState(filters?.sort_by || 'created_at');
    const [sortDir, setSortDir] = useState(filters?.sort_dir || 'desc');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importData, setImportData] = useState([]);
    const [importError, setImportError] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [rawCsvText, setRawCsvText] = useState('');

    const contactList = contacts?.data || [];
    const allSelected = contactList.length > 0 && selectedIds.length === contactList.length;

    // Apply Filter / Sort changes via Inertia router
    const applyParams = (newParams) => {
        const query = {
            status: statusFilter,
            source: sourceFilter,
            assigned_to: assignedFilter,
            sort_by: sortBy,
            sort_dir: sortDir,
            ...newParams
        };

        // Remove default 'all' params
        Object.keys(query).forEach(k => {
            if (query[k] === 'all' || query[k] === '' || query[k] === null) {
                delete query[k];
            }
        });

        router.get('/contacts', query, { preserveState: true, replace: true });
    };

    const handleSort = (column) => {
        const nextDir = sortBy === column && sortDir === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortDir(nextDir);
        applyParams({ sort_by: column, sort_dir: nextDir });
    };

    const handleStatusFilter = (val) => {
        setStatusFilter(val);
        applyParams({ status: val });
    };

    const handleSourceFilter = (val) => {
        setSourceFilter(val);
        applyParams({ source: val });
    };

    const handleAssignedFilter = (val) => {
        setAssignedFilter(val);
        applyParams({ assigned_to: val });
    };

    const resetFilters = () => {
        setStatusFilter('all');
        setSourceFilter('all');
        setAssignedFilter('all');
        setSortBy('created_at');
        setSortDir('desc');
        router.get('/contacts', {}, { preserveState: true, replace: true });
    };

    // Checkbox Selection
    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(contactList.map(c => c.id));
        }
    };

    const toggleSelectRow = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(item => item !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // Bulk Actions
    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        if (confirm(`Are you sure you want to delete ${selectedIds.length} selected contacts?`)) {
            router.post('/contacts/bulk-delete', { ids: selectedIds }, {
                onSuccess: () => setSelectedIds([])
            });
        }
    };

    // Export Functionality
    const exportCSV = (selectedOnly = false) => {
        const dataToExport = selectedOnly
            ? contactList.filter(c => selectedIds.includes(c.id))
            : contactList;

        if (dataToExport.length === 0) {
            alert('No contacts available to export.');
            return;
        }

        const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Job Title', 'Status', 'Source', 'Assigned To', 'Created At'];
        const csvRows = [headers.join(',')];

        dataToExport.forEach(c => {
            const row = [
                c.id,
                `"${(c.first_name || '').replace(/"/g, '""')}"`,
                `"${(c.last_name || '').replace(/"/g, '""')}"`,
                `"${(c.email || '').replace(/"/g, '""')}"`,
                `"${(c.phone || '').replace(/"/g, '""')}"`,
                `"${(c.company || '').replace(/"/g, '""')}"`,
                `"${(c.job_title || '').replace(/"/g, '""')}"`,
                `"${(c.status || '').replace(/"/g, '""')}"`,
                `"${(c.source || '').replace(/"/g, '""')}"`,
                `"${(c.assigned_user?.name || '').replace(/"/g, '""')}"`,
                `"${c.created_at || ''}"`
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `contacts_export_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // CSV Parse for Import
    const parseCsvText = (text) => {
        setImportError('');
        const lines = text.trim().split('\n');
        if (lines.length < 2) {
            setImportError('CSV must contain a header line and at least one data row.');
            setImportData([]);
            return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
        const parsed = [];

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
            const rowObj = {};
            headers.forEach((h, index) => {
                const val = values[index] || '';
                if (h.includes('first') || h === 'name') rowObj.first_name = val;
                else if (h.includes('last')) rowObj.last_name = val;
                else if (h.includes('email')) rowObj.email = val;
                else if (h.includes('phone')) rowObj.phone = val;
                else if (h.includes('company')) rowObj.company = val;
                else if (h.includes('title') || h.includes('job')) rowObj.job_title = val;
                else if (h.includes('source')) rowObj.source = val;
                else if (h.includes('status')) rowObj.status = val;
            });

            if (rowObj.first_name) {
                parsed.push(rowObj);
            }
        }

        if (parsed.length === 0) {
            setImportError('Could not find valid rows with "first_name" or "name" column.');
        }
        setImportData(parsed);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const content = evt.target.result;
            setRawCsvText(content);
            parseCsvText(content);
        };
        reader.readAsText(file);
    };

    const handleImportSubmit = () => {
        if (importData.length === 0) {
            setImportError('Please upload or paste valid CSV data to import.');
            return;
        }

        setIsImporting(true);
        router.post('/contacts/import', { contacts: importData }, {
            onSuccess: () => {
                setIsImporting(false);
                setIsImportModalOpen(false);
                setImportData([]);
                setRawCsvText('');
            },
            onError: (err) => {
                setIsImporting(false);
                setImportError('Failed to import contacts. Please check format.');
            }
        });
    };

    const downloadSampleCsv = () => {
        const sample = `First Name,Last Name,Email,Phone,Company,Job Title,Source,Status\nJohn,Doe,john@example.com,+1234567890,Acme Corp,Manager,website,lead\nJane,Smith,jane@tech.io,+1987654321,Tech Start,Developer,referral,customer`;
        const blob = new Blob([sample], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', 'contacts_sample_template.csv');
        a.click();
    };

    return (
        <AppLayout title="Contacts" breadcrumbs={[{ label: 'CRM', href: '/contacts' }, { label: 'Contacts' }]}>
            {/* Top Toolbar: Action & Import/Export Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Contacts Directory</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">Manage and organize your client and lead records</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(true)} className="gap-1.5 bg-white border-border shadow-xs hover:bg-muted/50 cursor-pointer">
                        <Upload className="h-4 w-4" /> Import CSV
                    </Button>
                    <div className="relative inline-block text-left">
                        <Button variant="outline" size="sm" onClick={() => exportCSV(false)} className="gap-1.5 bg-white border-border shadow-xs hover:bg-muted/50 cursor-pointer">
                            <Download className="h-4 w-4" /> Export CSV
                        </Button>
                    </div>
                    <Link href="/contacts/create">
                        <Button variant="gradient" size="sm" className="gap-1.5 shadow-sm cursor-pointer">
                            <Plus className="h-4 w-4" /> Add Contact
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Selection Action Bar (when rows selected) */}
            {selectedIds.length > 0 && (
                <div className="mb-4 flex items-center justify-between px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/20 animate-fade-in">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <CheckSquare className="h-4 w-4 text-[#111]" />
                        <span>{selectedIds.length} contact{selectedIds.length > 1 ? 's' : ''} selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="xs" onClick={() => exportCSV(true)} className="gap-1 bg-white hover:bg-muted cursor-pointer text-xs">
                            <Download className="h-3.5 w-3.5" /> Export Selected
                        </Button>
                        <Button variant="destructive" size="xs" onClick={handleBulkDelete} className="gap-1 cursor-pointer text-xs">
                            <Trash2 className="h-3.5 w-3.5" /> Delete Selected
                        </Button>
                        <Button variant="ghost" size="xs" onClick={() => setSelectedIds([])} className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                            Clear Selection
                        </Button>
                    </div>
                </div>
            )}

            {/* Filter Controls Header */}
            <Card className="mb-4 bg-white border-border shadow-xs">
                <CardContent className="p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                <SlidersHorizontal className="h-3.5 w-3.5" /> Filters:
                            </div>

                            {/* Status Filter */}
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs text-muted-foreground">Status:</span>
                                <select
                                    className="h-8 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                                    value={statusFilter}
                                    onChange={e => handleStatusFilter(e.target.value)}
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="lead">Lead</option>
                                    <option value="customer">Customer</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="lost">Lost</option>
                                </select>
                            </div>

                            {/* Source Filter */}
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs text-muted-foreground">Source:</span>
                                <select
                                    className="h-8 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                                    value={sourceFilter}
                                    onChange={e => handleSourceFilter(e.target.value)}
                                >
                                    <option value="all">All Sources</option>
                                    <option value="website">Website</option>
                                    <option value="referral">Referral</option>
                                    <option value="manual">Manual</option>
                                    <option value="import">Import</option>
                                </select>
                            </div>

                            {/* Assigned To Filter */}
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs text-muted-foreground">Assigned To:</span>
                                <select
                                    className="h-8 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                                    value={assignedFilter}
                                    onChange={e => handleAssignedFilter(e.target.value)}
                                >
                                    <option value="all">All Users</option>
                                    {users?.map(u => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>

                            {(statusFilter !== 'all' || sourceFilter !== 'all' || assignedFilter !== 'all') && (
                                <Button variant="ghost" size="xs" onClick={resetFilters} className="h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                                    <RefreshCw className="h-3 w-3 mr-1" /> Reset
                                </Button>
                            )}
                        </div>

                        <div className="text-xs text-muted-foreground">
                            Showing <span className="font-semibold text-foreground">{contactList.length}</span> of <span className="font-semibold text-foreground">{contacts?.total || contactList.length}</span> records
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabular Data View - Scrollable vertically and horizontally */}
            <Card className="bg-white border-border shadow-xs overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto overflow-y-auto max-h-[620px]">
                        <table className="w-full min-w-[1650px] border-collapse text-left text-xs">
                            <thead className="sticky top-0 z-20 bg-muted/90 backdrop-blur-xs border-b border-border">
                                <tr>
                                    <th className="w-12 min-w-[48px] px-4 py-3.5 text-center sticky left-0 z-30 bg-muted/90">
                                        <input
                                            type="checkbox"
                                            className="rounded border-border accent-primary h-4 w-4 cursor-pointer"
                                            checked={allSelected}
                                            onChange={toggleSelectAll}
                                            title="Select all rows"
                                        />
                                    </th>
                                    <th className="min-w-[180px] px-5 py-3.5 font-bold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors whitespace-nowrap" onClick={() => handleSort('first_name')}>
                                        <div className="flex items-center gap-1.5">
                                            <span>Contact Name</span>
                                            {sortBy === 'first_name' ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-foreground" /> : <ArrowDown className="h-3 w-3 text-foreground" />) : <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />}
                                        </div>
                                    </th>
                                    <th className="min-w-[200px] px-5 py-3.5 font-bold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors whitespace-nowrap" onClick={() => handleSort('email')}>
                                        <div className="flex items-center gap-1.5">
                                            <span>Email</span>
                                            {sortBy === 'email' ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-foreground" /> : <ArrowDown className="h-3 w-3 text-foreground" />) : <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />}
                                        </div>
                                    </th>
                                    <th className="min-w-[140px] px-5 py-3.5 font-bold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors whitespace-nowrap" onClick={() => handleSort('phone')}>
                                        <div className="flex items-center gap-1.5">
                                            <span>Phone</span>
                                            {sortBy === 'phone' ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-foreground" /> : <ArrowDown className="h-3 w-3 text-foreground" />) : <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />}
                                        </div>
                                    </th>
                                    <th className="min-w-[160px] px-5 py-3.5 font-bold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors whitespace-nowrap" onClick={() => handleSort('company')}>
                                        <div className="flex items-center gap-1.5">
                                            <span>Company</span>
                                            {sortBy === 'company' ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-foreground" /> : <ArrowDown className="h-3 w-3 text-foreground" />) : <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />}
                                        </div>
                                    </th>
                                    <th className="min-w-[160px] px-5 py-3.5 font-bold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors whitespace-nowrap" onClick={() => handleSort('job_title')}>
                                        <div className="flex items-center gap-1.5">
                                            <span>Job Title</span>
                                            {sortBy === 'job_title' ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-foreground" /> : <ArrowDown className="h-3 w-3 text-foreground" />) : <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />}
                                        </div>
                                    </th>
                                    <th className="min-w-[120px] px-5 py-3.5 font-bold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors whitespace-nowrap" onClick={() => handleSort('status')}>
                                        <div className="flex items-center gap-1.5">
                                            <span>Status</span>
                                            {sortBy === 'status' ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-foreground" /> : <ArrowDown className="h-3 w-3 text-foreground" />) : <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />}
                                        </div>
                                    </th>
                                    <th className="min-w-[120px] px-5 py-3.5 font-bold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors whitespace-nowrap" onClick={() => handleSort('source')}>
                                        <div className="flex items-center gap-1.5">
                                            <span>Source</span>
                                            {sortBy === 'source' ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-foreground" /> : <ArrowDown className="h-3 w-3 text-foreground" />) : <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />}
                                        </div>
                                    </th>
                                    <th className="min-w-[140px] px-5 py-3.5 font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                                        Assigned To
                                    </th>
                                    <th className="min-w-[120px] px-5 py-3.5 font-bold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors whitespace-nowrap" onClick={() => handleSort('city')}>
                                        <div className="flex items-center gap-1.5">
                                            <span>City</span>
                                            {sortBy === 'city' ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-foreground" /> : <ArrowDown className="h-3 w-3 text-foreground" />) : <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />}
                                        </div>
                                    </th>
                                    <th className="min-w-[120px] px-5 py-3.5 font-bold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors whitespace-nowrap" onClick={() => handleSort('country')}>
                                        <div className="flex items-center gap-1.5">
                                            <span>Country</span>
                                            {sortBy === 'country' ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-foreground" /> : <ArrowDown className="h-3 w-3 text-foreground" />) : <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />}
                                        </div>
                                    </th>
                                    <th className="min-w-[150px] px-5 py-3.5 font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                                        Tags
                                    </th>
                                    <th className="min-w-[130px] px-5 py-3.5 font-bold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors whitespace-nowrap" onClick={() => handleSort('created_at')}>
                                        <div className="flex items-center gap-1.5">
                                            <span>Created</span>
                                            {sortBy === 'created_at' ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-foreground" /> : <ArrowDown className="h-3 w-3 text-foreground" />) : <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />}
                                        </div>
                                    </th>
                                    <th className="min-w-[120px] px-5 py-3.5 text-right font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {contactList.map(contact => {
                                    const isSelected = selectedIds.includes(contact.id);
                                    return (
                                        <tr
                                            key={contact.id}
                                            className={`transition-colors hover:bg-muted/40 ${isSelected ? 'bg-primary/5' : ''}`}
                                        >
                                            <td className="px-4 py-3.5 text-center sticky left-0 z-10 bg-white group-hover:bg-muted/40">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-border accent-primary h-4 w-4 cursor-pointer"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelectRow(contact.id)}
                                                />
                                            </td>
                                            <td className="px-5 py-3.5 font-medium whitespace-nowrap">
                                                <Link href={`/contacts/${contact.id}`} className="font-semibold text-sm text-foreground hover:text-foreground transition-colors">
                                                    {contact.first_name} {contact.last_name || ''}
                                                </Link>
                                            </td>
                                            <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">{contact.email || '—'}</td>
                                            <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">{contact.phone || '—'}</td>
                                            <td className="px-5 py-3.5 font-medium text-foreground whitespace-nowrap">{contact.company || '—'}</td>
                                            <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">{contact.job_title || '—'}</td>
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <Badge variant={contact.status || 'lead'} className="capitalize">
                                                    {contact.status || 'lead'}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-3.5 capitalize text-muted-foreground whitespace-nowrap">{contact.source || '—'}</td>
                                            <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">{contact.assigned_user?.name || '—'}</td>
                                            <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">{contact.city || '—'}</td>
                                            <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">{contact.country || '—'}</td>
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                {contact.tags && contact.tags.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {(Array.isArray(contact.tags) ? contact.tags : []).map((tag, i) => (
                                                            <span key={i} className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : '—'}
                                            </td>
                                            <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                                                {contact.created_at ? new Date(contact.created_at).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link href={`/contacts/${contact.id}`}>
                                                        <Button variant="ghost" size="xs" className="h-7 px-2 cursor-pointer">View</Button>
                                                    </Link>
                                                    <Link href={`/contacts/${contact.id}/edit`}>
                                                        <Button variant="ghost" size="xs" className="h-7 px-2 cursor-pointer">Edit</Button>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {contactList.length === 0 && (
                                    <tr>
                                        <td colSpan="14" className="text-center py-12 text-muted-foreground">
                                            No contacts match the selected criteria.
                                            <div className="mt-2">
                                                <Link href="/contacts/create" className="text-[#860DFF] font-semibold hover:underline">
                                                    Add a new contact
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination Controls */}
            {contacts?.links && contacts.links.length > 3 && (
                <div className="mt-4 flex items-center justify-between px-2 text-xs text-muted-foreground">
                    <div>
                        Showing {contacts.from || 0} to {contacts.to || 0} of {contacts.total || 0} contacts
                    </div>
                    <div className="flex gap-1">
                        {contacts.links.map((link, idx) => (
                            <Button
                                key={idx}
                                variant={link.active ? "default" : "outline"}
                                size="xs"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true, replace: true })}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className="cursor-pointer"
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Import Contacts Modal */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
                    <div className="bg-white border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5 text-[#111]" />
                                <h3 className="font-bold text-lg text-foreground">Import Contacts from CSV</h3>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsImportModalOpen(false)} className="h-8 w-8 cursor-pointer">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="p-5 overflow-y-auto flex-1 space-y-4">
                            {importError && (
                                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                                    ⚠ {importError}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                    1. Upload CSV File
                                </label>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    className="block w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90 cursor-pointer"
                                />
                                <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                                    <span>Supports .csv files with header row.</span>
                                    <button type="button" onClick={downloadSampleCsv} className="text-[#860DFF] hover:underline font-semibold cursor-pointer">
                                        Download CSV Template
                                    </button>
                                </div>
                            </div>

                            <div className="relative flex py-1 items-center">
                                <div className="flex-grow border-t border-border"></div>
                                <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-muted-foreground">or paste CSV data</span>
                                <div className="flex-grow border-t border-border"></div>
                            </div>

                            <div>
                                <textarea
                                    rows="4"
                                    placeholder="First Name, Last Name, Email, Phone, Company, Job Title, Source, Status&#10;John, Doe, john@example.com, +1234567890, Acme Corp, Manager, website, lead"
                                    className="w-full rounded-md border border-border bg-background p-2.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                                    value={rawCsvText}
                                    onChange={(e) => {
                                        setRawCsvText(e.target.value);
                                        parseCsvText(e.target.value);
                                    }}
                                />
                            </div>

                            {/* Preview parsed data */}
                            {importData.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-foreground">
                                            Preview Parsed Contacts ({importData.length} valid rows)
                                        </span>
                                    </div>
                                    <div className="max-h-48 overflow-y-auto border border-border rounded-lg">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-muted text-muted-foreground font-semibold sticky top-0">
                                                <tr>
                                                    <th className="p-2">First Name</th>
                                                    <th className="p-2">Last Name</th>
                                                    <th className="p-2">Email</th>
                                                    <th className="p-2">Company</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {importData.slice(0, 5).map((row, i) => (
                                                    <tr key={i}>
                                                        <td className="p-2 font-medium">{row.first_name}</td>
                                                        <td className="p-2 text-muted-foreground">{row.last_name || '—'}</td>
                                                        <td className="p-2 text-muted-foreground">{row.email || '—'}</td>
                                                        <td className="p-2 text-muted-foreground">{row.company || '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {importData.length > 5 && (
                                            <div className="p-2 text-center text-[11px] text-muted-foreground bg-muted/30">
                                                + {importData.length - 5} more rows ready to import
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-2 p-4 border-t border-border bg-muted/20">
                            <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(false)} className="cursor-pointer">
                                Cancel
                            </Button>
                            <Button
                                variant="gradient"
                                size="sm"
                                disabled={importData.length === 0 || isImporting}
                                onClick={handleImportSubmit}
                                className="cursor-pointer"
                            >
                                {isImporting ? 'Importing...' : `Import ${importData.length} Contacts`}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
