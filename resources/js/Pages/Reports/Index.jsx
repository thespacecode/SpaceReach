import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { 
    FileText, Download, Plus, Calendar, Share2, FileSpreadsheet, 
    FileCheck, Clock, Filter, CheckCircle2, Sparkles, Copy
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';

const REPORT_TEMPLATES = [
    { id: 1, title: 'Quarterly Executive Revenue Telemetry', category: 'Finance & ARR', format: 'PDF & Excel', freq: 'Monthly', lastRun: '2026-08-01', status: 'Scheduled' },
    { id: 2, title: 'High-Intent ICP Lead Conversion Matrix', category: 'CRM & Pipeline', format: 'CSV & PDF', freq: 'Weekly', lastRun: '2026-08-15', status: 'Scheduled' },
    { id: 3, title: 'Sales Cycle Velocity & Win/Loss Analysis', category: 'Analytics', format: 'PDF', freq: 'On-Demand', lastRun: '2026-08-10', status: 'Active' },
    { id: 4, title: 'AI Predictive Lead Intent & Scoring Audit', category: 'AI Copilot', format: 'Excel & JSON', freq: 'Daily', lastRun: '2026-08-17', status: 'Active' }
];

export default function ReportsIndex() {
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [exporting, setExporting] = useState(false);

    const handleExport = (format) => {
        setExporting(true);
        setTimeout(() => {
            setExporting(false);
            alert(`Report successfully exported as ${format}!`);
        }, 800);
    };

    return (
        <AppLayout title="Reports & Telemetry Generator">
            <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-border">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">Reporting & Data Export Engine</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">Generate, schedule, and export enterprise financial and lead intelligence reports.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button size="sm" className="h-8 text-xs font-semibold gap-1.5 bg-foreground text-background hover:bg-foreground/90">
                            <Plus className="w-3.5 h-3.5" /> Create Custom Report
                        </Button>
                    </div>
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {REPORT_TEMPLATES.map((report) => (
                        <div key={report.id} className="p-4 bg-card border border-border rounded-xl shadow-xs flex flex-col justify-between space-y-3 hover:border-border/80 transition-all">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                                        {report.category}
                                    </span>
                                    <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> {report.status}
                                    </span>
                                </div>

                                <h3 className="text-xs font-bold text-foreground leading-snug">{report.title}</h3>
                            </div>

                            <div className="pt-3 border-t border-border space-y-2 text-[11px] text-muted-foreground font-mono">
                                <div className="flex items-center justify-between">
                                    <span>Frequency:</span>
                                    <span className="text-foreground font-semibold">{report.freq}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Formats:</span>
                                    <span className="text-foreground font-semibold">{report.format}</span>
                                </div>
                            </div>

                            <div className="pt-2 flex items-center gap-1.5">
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="w-full h-7 text-xs font-medium gap-1"
                                    onClick={() => handleExport('PDF')}
                                >
                                    <Download className="w-3 h-3" /> Export PDF
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="w-full h-7 text-xs font-medium gap-1"
                                    onClick={() => handleExport('CSV')}
                                >
                                    <FileSpreadsheet className="w-3 h-3" /> CSV
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Instant Generator Section */}
                <div className="p-4 bg-card border border-border rounded-xl shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4 text-foreground" />
                        Instant Telemetry Builder & Data Exporter
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground uppercase text-[10px]">Data Module</label>
                            <select className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-medium outline-hidden">
                                <option>CRM Lead Conversion & Pipeline</option>
                                <option>Financial Invoices & Payments</option>
                                <option>AI Predictive Scores & Signals</option>
                                <option>Employee OKRs & Performance</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground uppercase text-[10px]">Time Horizon</label>
                            <select className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-medium outline-hidden">
                                <option>Current Quarter (Q3 2026)</option>
                                <option>Year to Date (2026)</option>
                                <option>Trailing 30 Days</option>
                                <option>Custom Date Range</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="font-semibold text-muted-foreground uppercase text-[10px]">Output Format</label>
                            <select className="w-full p-2 bg-background border border-border rounded-lg text-foreground font-medium outline-hidden">
                                <option>Formatted Executive PDF Document</option>
                                <option>Raw CSV Dataset</option>
                                <option>Excel Workbook (.xlsx)</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                        <Button 
                            disabled={exporting}
                            onClick={() => handleExport('Custom Report')} 
                            className="h-8 text-xs font-semibold bg-foreground text-background hover:bg-foreground/90 gap-1.5"
                        >
                            <Download className="w-3.5 h-3.5" />
                            {exporting ? "Generating File..." : "Compile & Download Telemetry"}
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
