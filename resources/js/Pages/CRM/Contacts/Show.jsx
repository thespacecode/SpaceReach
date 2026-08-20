import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Link } from '@inertiajs/react';
import { 
    Mail, Phone, Building2, MapPin, Edit, ArrowLeft, Sparkles, HandCoins, 
    Receipt, Clock, CheckCircle2, FileText, Calendar, MessageSquare, Plus
} from 'lucide-react';
import { Currency, DateDisplay } from '@/Components/SettingsFormatters';
import { cn } from '@/lib/utils';

export default function ContactShow({ contact }) {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <AppLayout title={`${contact.first_name} ${contact.last_name}`}>
            <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
                {/* Header Back & Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-border">
                    <div className="flex items-center gap-3">
                        <Link href="/contacts">
                            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold gap-1">
                                <ArrowLeft className="w-3.5 h-3.5" /> Back to Contacts
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                {contact.first_name} {contact.last_name}
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                    {contact.status || 'Active ICP'}
                                </span>
                            </h1>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {contact.job_title ? `${contact.job_title} at ` : ''}{contact.company || 'Enterprise Account'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={`/contacts/${contact.id}/edit`}>
                            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold gap-1.5">
                                <Edit className="w-3.5 h-3.5" /> Edit Profile
                            </Button>
                        </Link>
                        <Button size="sm" className="h-8 text-xs font-semibold gap-1.5 bg-foreground text-background hover:bg-foreground/90">
                            <Plus className="w-3.5 h-3.5" /> Log Interaction
                        </Button>
                    </div>
                </div>

                {/* Profile Top Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-3.5 bg-card border border-border rounded-xl shadow-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">AI Intent Score</span>
                        <div className="mt-1 text-lg font-bold text-emerald-600 font-mono flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            94 / 100
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-0.5 block">High Probability ICP</span>
                    </div>

                    <div className="p-3.5 bg-card border border-border rounded-xl shadow-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Total Pipeline Value</span>
                        <div className="mt-1 text-lg font-bold text-foreground font-mono">
                            <Currency value={(contact.deals || []).reduce((acc, d) => acc + Number(d.value || 0), 0)} />
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-0.5 block">{(contact.deals || []).length} active deals</span>
                    </div>

                    <div className="p-3.5 bg-card border border-border rounded-xl shadow-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Assigned Owner</span>
                        <div className="mt-1 text-sm font-semibold text-foreground">
                            {contact.assigned_to_user?.name || 'Revenue Operations'}
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-0.5 block">Tier 1 Account</span>
                    </div>

                    <div className="p-3.5 bg-card border border-border rounded-xl shadow-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Lead Source</span>
                        <div className="mt-1 text-sm font-semibold text-foreground">
                            {contact.source || 'Inbound AI Chatbot'}
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-0.5 block">Acquired Aug 2026</span>
                    </div>
                </div>

                {/* Profile Tabs & Detail Section */}
                <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
                    {/* Tab Bar */}
                    <div className="px-4 py-2 border-b border-border flex items-center gap-2 text-xs font-semibold bg-muted/20">
                        {['overview', 'deals', 'activity', 'notes'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg capitalize transition-colors",
                                    activeTab === tab 
                                        ? "bg-card text-foreground shadow-xs font-bold" 
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Tab Body */}
                    <div className="p-5 text-xs">
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Metadata Column */}
                                <div className="space-y-4">
                                    <h3 className="font-bold text-foreground uppercase tracking-wider text-[11px] text-muted-foreground">Contact Metadata</h3>

                                    <div className="space-y-3">
                                        {contact.email && (
                                            <div className="flex items-center gap-2 text-foreground font-medium">
                                                <Mail className="w-4 h-4 text-muted-foreground" />
                                                <a href={`mailto:${contact.email}`} className="hover:underline">{contact.email}</a>
                                            </div>
                                        )}
                                        {contact.phone && (
                                            <div className="flex items-center gap-2 text-foreground font-medium">
                                                <Phone className="w-4 h-4 text-muted-foreground" />
                                                <span>{contact.phone}</span>
                                            </div>
                                        )}
                                        {contact.company && (
                                            <div className="flex items-center gap-2 text-foreground font-medium">
                                                <Building2 className="w-4 h-4 text-muted-foreground" />
                                                <span>{contact.company}</span>
                                            </div>
                                        )}
                                        {(contact.city || contact.country) && (
                                            <div className="flex items-center gap-2 text-foreground font-medium">
                                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                                <span>{[contact.city, contact.state, contact.country].filter(Boolean).join(', ')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Main Column: Active Deals Summary */}
                                <div className="lg:col-span-2 space-y-4">
                                    <h3 className="font-bold text-foreground uppercase tracking-wider text-[11px] text-muted-foreground">Associated Deals</h3>
                                    {(contact.deals || []).length > 0 ? (
                                        <div className="space-y-2">
                                            {contact.deals.map((d) => (
                                                <div key={d.id} className="p-3 border border-border rounded-lg bg-muted/20 flex items-center justify-between">
                                                    <div>
                                                        <span className="font-bold text-foreground block text-xs">{d.title}</span>
                                                        <span className="text-[10px] text-muted-foreground font-mono">{d.stage?.name || 'Pipeline'}</span>
                                                    </div>
                                                    <span className="font-mono font-bold text-foreground text-sm">
                                                        <Currency value={d.value} />
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-lg">
                                            No active deals associated with this contact yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'deals' && (
                            <div className="space-y-3">
                                <h3 className="font-bold text-foreground uppercase tracking-wider text-[11px] text-muted-foreground">Pipeline Deals</h3>
                                {(contact.deals || []).map(d => (
                                    <div key={d.id} className="p-3 border border-border rounded-lg flex items-center justify-between">
                                        <span className="font-bold text-foreground">{d.title}</span>
                                        <span className="font-mono font-bold"><Currency value={d.value} /></span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'activity' && (
                            <div className="space-y-3">
                                <h3 className="font-bold text-foreground uppercase tracking-wider text-[11px] text-muted-foreground">Chronological Activity History</h3>
                                <div className="p-3 border border-border rounded-lg bg-muted/20 flex items-start gap-3">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                                    <div>
                                        <span className="font-semibold text-foreground">Inbound Chatbot Qualification</span>
                                        <p className="text-[11px] text-muted-foreground">Passed enterprise qualification threshold. Automated Intent Score 94/100.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notes' && (
                            <div className="space-y-3">
                                <h3 className="font-bold text-foreground uppercase tracking-wider text-[11px] text-muted-foreground">Account Notes</h3>
                                {(contact.notes || []).map(n => (
                                    <div key={n.id} className="p-3 border border-border rounded-lg">
                                        <p className="text-foreground">{n.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
