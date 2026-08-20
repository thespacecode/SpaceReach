import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Link, useForm, router } from '@inertiajs/react';
import {
    CheckSquare, CheckCircle2, XCircle, Merge, AlertTriangle, Globe,
    Building2, Mail, Phone
} from 'lucide-react';

export default function LeadReviewQueue({ candidates = { data: [] }, counts = {}, activeCategory = 'all' }) {
    const [selectedMergeCandidate, setSelectedMergeCandidate] = useState(null);

    const mergeForm = useForm({
        candidate_id: '',
        lead_id: '',
        company: '',
        email: '',
        phone: '',
        website: '',
    });

    const handleApprove = (id) => {
        router.post(`/leads/review/${id}/approve`);
    };

    const handleReject = (id) => {
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

    const candidateList = candidates.data || [];

    const categories = [
        { id: 'all', label: 'All Candidates', count: counts.total || 0 },
        { id: 'needs_review', label: 'Needs Review', count: counts.needs_review || 0 },
        { id: 'incomplete', label: 'Incomplete', count: counts.incomplete || 0 },
        { id: 'duplicate', label: 'Duplicates', count: counts.duplicate || 0 },
        { id: 'high_potential', label: 'High Potential', count: counts.high_potential || 0 },
        { id: 'invalid', label: 'Invalid', count: counts.invalid || 0 },
    ];

    return (
        <AppLayout title="Lead Review Queue — TheSpaceCode">
            <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/60 pb-4">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <CheckSquare className="w-5 h-5 text-primary" /> Lead Review Queue
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/leads">
                            <Button variant="outline" size="sm" className="text-xs font-semibold">Leads</Button>
                        </Link>
                        <Link href="/leads/sources">
                            <Button variant="outline" size="sm" className="text-xs font-semibold">Sources</Button>
                        </Link>
                        <Link href="/leads/data">
                            <Button variant="outline" size="sm" className="text-xs font-semibold">Data & Extraction</Button>
                        </Link>
                    </div>
                </div>

                {/* Category Navigation Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border/60">
                    {categories.map((cat) => (
                        <Link key={cat.id} href={`/leads/review?category=${cat.id}`}>
                            <Button
                                variant={activeCategory === cat.id ? 'default' : 'outline'}
                                size="sm"
                                className="gap-2 text-xs font-semibold rounded-full whitespace-nowrap"
                            >
                                {cat.label}
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeCategory === cat.id ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                    {cat.count}
                                </span>
                            </Button>
                        </Link>
                    ))}
                </div>

                {/* Candidates List */}
                <div className="space-y-3">
                    {candidateList.length === 0 ? (
                        <Card className="p-12 text-center text-muted-foreground bg-card border-border/60">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                            <h3 className="text-sm font-bold text-foreground">Review Queue Clear</h3>
                        </Card>
                    ) : (
                        candidateList.map((c) => (
                            <Card key={c.id} className="bg-card border-border/60 shadow-xs p-4 space-y-3">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-mono text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border/50">{c.candidate_number}</span>
                                            <h3 className="font-bold text-foreground text-base">{c.company_name}</h3>
                                            {c.review_category === 'duplicate' && (
                                                <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 px-2 py-0.5 font-bold text-xs gap-1">
                                                    <AlertTriangle className="w-3 h-3" /> Duplicate ({c.duplicate_match_confidence}%)
                                                </Badge>
                                            )}
                                            {c.review_category === 'high_potential' && (
                                                <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 px-2 py-0.5 font-bold text-xs">
                                                    High Potential
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-0.5">
                                            {c.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-primary" /> {c.email}</span>}
                                            {c.phone && <span className="flex items-center gap-1 font-mono"><Phone className="w-3.5 h-3.5 text-primary" /> {c.phone}</span>}
                                            {c.website && <span className="flex items-center gap-1 font-mono"><Globe className="w-3.5 h-3.5 text-primary" /> {c.website}</span>}
                                            <span>Industry: <strong className="text-foreground">{c.industry || 'Real Estate'}</strong></span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        {c.review_category === 'duplicate' && (
                                            <Button size="sm" variant="outline" className="gap-1 text-amber-600 border-amber-500/40 hover:bg-amber-500/10 font-semibold text-xs" onClick={() => openMergeModal(c)}>
                                                <Merge className="w-3.5 h-3.5" /> Merge
                                            </Button>
                                        )}
                                        <Button size="sm" variant="outline" className="gap-1 text-red-600 border-red-500/40 hover:bg-red-500/10 font-semibold text-xs" onClick={() => handleReject(c.id)}>
                                            <XCircle className="w-3.5 h-3.5" /> Reject
                                        </Button>
                                        <Button size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs" onClick={() => handleApprove(c.id)}>
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>

                {/* Merge Modal */}
                {selectedMergeCandidate && (
                    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-card border border-border rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
                            <div className="flex items-center justify-between border-b border-border pb-2">
                                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                    <Merge className="w-4 h-4 text-amber-500" /> Merge Duplicate Record
                                </h3>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedMergeCandidate(null)}>Close</Button>
                            </div>

                            <form onSubmit={handleExecuteMerge} className="space-y-3 text-xs">
                                <div>
                                    <label className="font-bold text-foreground uppercase text-[10px]">Company Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary"
                                        value={mergeForm.data.company}
                                        onChange={(e) => mergeForm.setData('company', e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="font-bold text-foreground uppercase text-[10px]">Email</label>
                                        <input
                                            type="email"
                                            className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary"
                                            value={mergeForm.data.email}
                                            onChange={(e) => mergeForm.setData('email', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-foreground uppercase text-[10px]">Phone</label>
                                        <input
                                            type="text"
                                            className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary"
                                            value={mergeForm.data.phone}
                                            onChange={(e) => mergeForm.setData('phone', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                                    <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedMergeCandidate(null)}>Cancel</Button>
                                    <Button type="submit" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold" disabled={mergeForm.processing}>
                                        Merge Record
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
