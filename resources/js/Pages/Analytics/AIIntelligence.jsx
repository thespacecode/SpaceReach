import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { 
    Sparkles, ArrowRight, Bot, Zap, Search, AlertTriangle, ShieldCheck, 
    TrendingUp, Cpu, CheckCircle2, BarChart2, Filter, Download
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';

export default function AIIntelligence() {
    const [query, setQuery] = useState('');
    const [aiResponse, setAiResponse] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const PRESET_QUERIES = [
        "Which enterprise leads are most likely to close this month?",
        "Identify accounts with highest risk of deal stagnation.",
        "Show revenue forecast breakdown for Q4 2026.",
        "Analyze SMB vs Enterprise conversion speed differences."
    ];

    const handleRunQuery = (qText) => {
        const targetQ = qText || query;
        if (!targetQ) return;
        setIsAnalyzing(true);

        setTimeout(() => {
            setIsAnalyzing(false);
            setAiResponse({
                query: targetQ,
                summary: "Based on 14,200 account touchpoints and historical conversion telemetry:",
                insights: [
                    "High-Intent Prospects (Score > 90): Apex Global, CyberShield Systems, and Starlight Financial represent $940,000 in high-probability ARR.",
                    "Velocity Gain: Enterprise deal sales cycles shortened from 18.4 days to 14.2 days following automated chatbot qualification.",
                    "Recommended Action: Schedule executive sponsor meeting with CyberShield legal team to close $420k contract."
                ],
                confidence: "98.4% Confidence Index"
            });
        }, 600);
    };

    return (
        <AppLayout title="AI Intelligence Hub">
            <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-border">
                    <div>
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-500" />
                            <h1 className="text-xl font-bold tracking-tight text-foreground">AI Intelligence & Copilot Engine</h1>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Automated anomaly detection, natural language analytics queries, and predictive lead scoring.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-xs font-semibold gap-1.5">
                            <Download className="w-3.5 h-3.5" /> Export AI Report
                        </Button>
                    </div>
                </div>

                {/* Natural Language Query Box */}
                <div className="p-4 bg-card border border-border rounded-xl shadow-xs space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-foreground" />
                        Ask AppLead AI Copilot
                    </label>

                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="e.g. 'Show me accounts with highest conversion score in Healthcare sector'..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleRunQuery()}
                                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-xs text-foreground outline-hidden focus:ring-1 focus:ring-ring font-medium"
                            />
                        </div>
                        <Button 
                            disabled={isAnalyzing}
                            onClick={() => handleRunQuery()} 
                            size="sm" 
                            className="h-9 px-4 text-xs font-semibold bg-foreground text-background hover:bg-foreground/90 gap-1.5"
                        >
                            {isAnalyzing ? "Analyzing..." : "Run AI Query"}
                        </Button>
                    </div>

                    {/* Presets */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-[11px] text-muted-foreground font-mono">Suggested:</span>
                        {PRESET_QUERIES.map((preset, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setQuery(preset);
                                    handleRunQuery(preset);
                                }}
                                className="px-2.5 py-1 rounded-md bg-muted/50 border border-border text-[11px] font-medium text-foreground hover:bg-muted transition-colors"
                            >
                                {preset}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Response Display */}
                {aiResponse && (
                    <div className="p-4 bg-muted/20 border border-border rounded-xl shadow-xs space-y-3 animate-fade-in">
                        <div className="flex items-center justify-between border-b border-border pb-2">
                            <span className="text-xs font-bold text-foreground flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                Query Result: "{aiResponse.query}"
                            </span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                {aiResponse.confidence}
                            </span>
                        </div>

                        <p className="text-xs text-foreground font-medium">{aiResponse.summary}</p>

                        <div className="space-y-2">
                            {aiResponse.insights.map((item, idx) => (
                                <div key={idx} className="p-3 bg-card border border-border rounded-lg text-xs text-foreground flex items-start gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span className="leading-relaxed">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Grid: Anomaly Stream & Lead Intent Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Anomaly Stream */}
                    <div className="p-4 bg-card border border-border rounded-xl shadow-xs space-y-3">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            Real-time Anomaly & Opportunity Stream
                        </h3>

                        <div className="space-y-2.5 text-xs">
                            <div className="p-3 bg-muted/30 border border-border rounded-lg space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-foreground">Inbound Engagement Spike</span>
                                    <span className="text-[10px] font-mono text-emerald-600 font-bold">+42% Activity</span>
                                </div>
                                <p className="text-muted-foreground text-[11px]">Fintech accounts visited pricing page 18 times in past 2 hours.</p>
                            </div>

                            <div className="p-3 bg-muted/30 border border-border rounded-lg space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-foreground">Outbound Stagnation Flag</span>
                                    <span className="text-[10px] font-mono text-amber-600 font-bold">Needs Review</span>
                                </div>
                                <p className="text-muted-foreground text-[11px]">SMB sequence open rate dropped below 15% in EMEA region.</p>
                            </div>
                        </div>
                    </div>

                    {/* AI Scoring Parameters */}
                    <div className="p-4 bg-card border border-border rounded-xl shadow-xs space-y-3">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Zap className="w-4 h-4 text-primary" />
                            Model Scoring Parameters & Weights
                        </h3>

                        <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between p-2 bg-muted/30 rounded border border-border">
                                <span className="font-medium text-foreground">ICP Firmographic Fit (Employee Count & Revenue)</span>
                                <span className="font-mono font-bold text-foreground">35% Weight</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-muted/30 rounded border border-border">
                                <span className="font-medium text-foreground">Behavioral Intent Signals (Chatbot & Visits)</span>
                                <span className="font-mono font-bold text-foreground">30% Weight</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-muted/30 rounded border border-border">
                                <span className="font-medium text-foreground">Executive Engagement Velocity</span>
                                <span className="font-mono font-bold text-foreground">25% Weight</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-muted/30 rounded border border-border">
                                <span className="font-medium text-foreground">Financial & Stock Telemetry</span>
                                <span className="font-mono font-bold text-foreground">10% Weight</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
