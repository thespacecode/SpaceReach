import { useState } from 'react';
import { 
    Bell, CheckCheck, Sparkles, AlertCircle, Info, ArrowUpRight, X, Clock, Check 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotificationCenter({ open, onClose }) {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: 'Predictive AI Insight Available',
            message: 'Enterprise inbound lead velocity increased by 18.4% this week.',
            category: 'AI Insight',
            timestamp: '10m ago',
            read: false,
            type: 'ai'
        },
        {
            id: 2,
            title: 'High-Value Lead Target',
            message: 'Acme Corp ($250k ARR target) requested demo via chatbot.',
            category: 'CRM Lead',
            timestamp: '45m ago',
            read: false,
            type: 'important'
        },
        {
            id: 3,
            title: 'Invoice Payment Received',
            message: 'Invoice #INV-2026-089 ($18,500) marked paid by Stripe.',
            category: 'Finance',
            timestamp: '2h ago',
            read: true,
            type: 'system'
        },
        {
            id: 4,
            title: 'Quarterly OKR Milestone Reached',
            message: 'Lead Generation Goal reached 85% completion.',
            category: 'Performance',
            timestamp: '1d ago',
            read: true,
            type: 'activity'
        }
    ]);

    const [activeTab, setActiveTab] = useState('all');

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const markRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const filtered = notifications.filter(n => {
        if (activeTab === 'unread') return !n.read;
        if (activeTab === 'ai') return n.type === 'ai';
        return true;
    });

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-xs transition-opacity animate-fade-in" onClick={onClose}>
            <div 
                className="w-full max-w-sm h-full bg-card border-l border-border shadow-2xl flex flex-col divide-y divide-border"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-foreground" />
                        <h3 className="text-sm font-semibold text-foreground">Notification Center</h3>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                            {notifications.filter(n => !n.read).length} new
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={markAllRead}
                            title="Mark all as read"
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors text-xs"
                        >
                            <CheckCheck className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={onClose}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="px-4 py-2 flex items-center gap-1 bg-muted/20 text-xs font-medium">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={cn(
                            "px-2.5 py-1 rounded-md transition-colors",
                            activeTab === 'all' ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setActiveTab('unread')}
                        className={cn(
                            "px-2.5 py-1 rounded-md transition-colors",
                            activeTab === 'unread' ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Unread
                    </button>
                    <button
                        onClick={() => setActiveTab('ai')}
                        className={cn(
                            "px-2.5 py-1 rounded-md transition-colors flex items-center gap-1",
                            activeTab === 'ai' ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        AI Insights
                    </button>
                </div>

                {/* Notification List */}
                <div className="flex-1 overflow-y-auto p-3 divide-y divide-border/60">
                    {filtered.length === 0 ? (
                        <div className="py-12 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                            <Info className="w-6 h-6 text-muted-foreground/60" />
                            <span>No notifications in this category</span>
                        </div>
                    ) : (
                        filtered.map(item => (
                            <div 
                                key={item.id}
                                onClick={() => markRead(item.id)}
                                className={cn(
                                    "p-3 rounded-lg transition-colors cursor-pointer text-xs group relative flex gap-3 items-start",
                                    item.read ? "bg-card opacity-80 hover:bg-muted/40" : "bg-muted/30 border border-border/80 hover:bg-muted/70"
                                )}
                            >
                                <div className="mt-0.5">
                                    {item.type === 'ai' && <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />}
                                    {item.type === 'important' && <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
                                    {item.type === 'system' && <Info className="w-4 h-4 text-blue-500 shrink-0" />}
                                    {item.type === 'activity' && <Clock className="w-4 h-4 text-muted-foreground shrink-0" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                        <span className="font-semibold text-foreground text-xs">{item.title}</span>
                                        {!item.read && (
                                            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-muted-foreground text-[11px] leading-relaxed mb-1.5">
                                        {item.message}
                                    </p>
                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                                        <span>{item.category}</span>
                                        <span>{item.timestamp}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 bg-muted/20 text-center">
                    <button 
                        onClick={markAllRead}
                        className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
                    >
                        Clear notification history
                    </button>
                </div>
            </div>
        </div>
    );
}
