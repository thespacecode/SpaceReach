import { useState, useMemo } from 'react';
import { 
    Search, ArrowUpDown, ChevronDown, ChevronUp, Download, SlidersHorizontal, 
    Check, MoreHorizontal, ChevronLeft, ChevronRight, Eye, Trash2, Edit3, Filter, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { 
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem 
} from '@/Components/ui/dropdown-menu';

export default function DataTable({
    data = [],
    columns = [],
    searchPlaceholder = "Search table records...",
    onRowClick = null,
    bulkActions = [],
    onExport = null,
    emptyMessage = "No records found matching your filters."
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'
    const [selectedRows, setSelectedRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Visible Columns State
    const [visibleColumns, setVisibleColumns] = useState(() => 
        columns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
    );

    // Search & Filter Logic
    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        const lower = searchTerm.toLowerCase();
        return data.filter(row => {
            return columns.some(col => {
                const val = row[col.key];
                if (val == null) return false;
                return String(val).toLowerCase().includes(lower);
            });
        });
    }, [data, searchTerm, columns]);

    // Sorting Logic
    const sortedData = useMemo(() => {
        if (!sortColumn) return filteredData;
        return [...filteredData].sort((a, b) => {
            let aVal = a[sortColumn];
            let bVal = b[sortColumn];

            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortColumn, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, currentPage, pageSize]);

    const handleSort = (columnKey) => {
        if (sortColumn === columnKey) {
            if (sortDirection === 'asc') setSortDirection('desc');
            else {
                setSortColumn(null);
                setSortDirection('asc');
            }
        } else {
            setSortColumn(columnKey);
            setSortDirection('asc');
        }
    };

    const toggleSelectAll = () => {
        if (selectedRows.length === paginatedData.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(paginatedData.map(r => r.id || r._id));
        }
    };

    const toggleSelectRow = (id) => {
        setSelectedRows(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleColumnVisibility = (key) => {
        setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="w-full bg-card border border-border rounded-xl shadow-xs overflow-hidden flex flex-col">
            {/* Table Toolbar */}
            <div className="p-3.5 border-b border-border flex flex-wrap items-center justify-between gap-3 bg-muted/10">
                {/* Search input */}
                <div className="relative flex-1 min-w-[220px] max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-9 pr-4 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground outline-hidden focus:ring-1 focus:ring-ring font-medium"
                    />
                </div>

                {/* Toolbar Actions */}
                <div className="flex items-center gap-2">
                    {/* Selected Action Bar */}
                    {selectedRows.length > 0 && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-md text-xs font-semibold text-foreground animate-fade-in">
                            <span>{selectedRows.length} selected</span>
                            {bulkActions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => action.onClick(selectedRows)}
                                    className="px-2 py-0.5 rounded hover:bg-primary/20 text-xs text-foreground transition-colors font-medium"
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Column Toggle */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 text-xs font-medium gap-1.5">
                                <SlidersHorizontal className="w-3.5 h-3.5" />
                                Columns
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            {columns.map(col => (
                                <DropdownMenuCheckboxItem
                                    key={col.key}
                                    checked={visibleColumns[col.key]}
                                    onCheckedChange={() => toggleColumnVisibility(col.key)}
                                    className="text-xs"
                                >
                                    {col.label}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Export */}
                    {onExport && (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={onExport}
                            className="h-8 text-xs font-medium gap-1.5"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Export
                        </Button>
                    )}
                </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            <th className="py-2.5 px-3.5 w-10 text-center">
                                <input
                                    type="checkbox"
                                    checked={paginatedData.length > 0 && selectedRows.length === paginatedData.length}
                                    onChange={toggleSelectAll}
                                    className="rounded border-border text-primary focus:ring-ring cursor-pointer"
                                />
                            </th>
                            {columns.map(col => {
                                if (!visibleColumns[col.key]) return null;
                                const isSorted = sortColumn === col.key;
                                return (
                                    <th 
                                        key={col.key}
                                        onClick={() => col.sortable !== false && handleSort(col.key)}
                                        className={cn(
                                            "py-2.5 px-3.5 transition-colors select-none",
                                            col.sortable !== false ? "cursor-pointer hover:text-foreground" : "",
                                            col.align === 'right' ? "text-right" : col.align === 'center' ? "text-center" : "text-left"
                                        )}
                                    >
                                        <div className={cn(
                                            "inline-flex items-center gap-1",
                                            col.align === 'right' ? "justify-end" : "justify-start"
                                        )}>
                                            <span>{col.label}</span>
                                            {col.sortable !== false && (
                                                <ArrowUpDown className={cn(
                                                    "w-3 h-3 text-muted-foreground/60",
                                                    isSorted && "text-foreground font-bold"
                                                )} />
                                            )}
                                        </div>
                                    </th>
                                );
                            })}
                            <th className="py-2.5 px-3.5 w-12 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-xs">
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + 2} className="py-12 text-center text-muted-foreground font-medium">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, rIdx) => {
                                const rowId = row.id || row._id || rIdx;
                                const isSelected = selectedRows.includes(rowId);

                                return (
                                    <tr
                                        key={rowId}
                                        onClick={() => onRowClick && onRowClick(row)}
                                        className={cn(
                                            "transition-colors group",
                                            isSelected ? "bg-muted/50 font-medium" : "hover:bg-muted/30",
                                            onRowClick && "cursor-pointer"
                                        )}
                                    >
                                        <td className="py-2.5 px-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleSelectRow(rowId)}
                                                className="rounded border-border text-primary focus:ring-ring cursor-pointer"
                                            />
                                        </td>
                                        {columns.map(col => {
                                            if (!visibleColumns[col.key]) return null;
                                            const val = row[col.key];

                                            return (
                                                <td 
                                                    key={col.key}
                                                    className={cn(
                                                        "py-2.5 px-3.5 text-foreground",
                                                        col.align === 'right' ? "text-right font-mono" : col.align === 'center' ? "text-center" : "text-left"
                                                    )}
                                                >
                                                    {col.render ? col.render(val, row) : (val ?? '—')}
                                                </td>
                                            );
                                        })}
                                        <td className="py-2.5 px-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-colors">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-36">
                                                    <DropdownMenuItem onClick={() => onRowClick && onRowClick(row)} className="text-xs gap-2">
                                                        <Eye className="w-3.5 h-3.5" /> View Detail
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-muted/10">
                <div>
                    Showing <span className="font-semibold text-foreground">{sortedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to <span className="font-semibold text-foreground">{Math.min(currentPage * pageSize, sortedData.length)}</span> of <span className="font-semibold text-foreground">{sortedData.length}</span> results
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                        className="h-7 w-7 p-0"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                    </Button>
                    <span className="px-2 font-mono text-[11px] font-semibold text-foreground">
                        {currentPage} / {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                        className="h-7 w-7 p-0"
                    >
                        <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
