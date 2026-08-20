import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { useForm, Link } from '@inertiajs/react';
import { useFormatters } from '@/Components/SettingsFormatters';

export default function DealForm({ deal, contacts, pipelines, users }) {
    const isEdit = !!deal;
    const { currencySymbol } = useFormatters();
    const { data, setData, post, put, processing, errors } = useForm({
        title: deal?.title || '',
        contact_id: deal?.contact_id || '',
        value: deal?.value || '',
        pipeline_id: deal?.pipeline_id || pipelines?.[0]?.id || '',
        stage_id: deal?.stage_id || pipelines?.[0]?.stages?.[0]?.id || '',
        assigned_to: deal?.assigned_to || '',
        expected_close: deal?.expected_close || '',
        probability: deal?.probability || 50,
        description: deal?.description || '',
    });
    const stages = pipelines?.find(p => p.id == data.pipeline_id)?.stages || [];
    const submit = (e) => { e.preventDefault(); isEdit ? put(`/opportunity/${deal.id}`) : post('/opportunity'); };

    return (
        <AppLayout title={isEdit?'Edit Opportunity':'New Opportunity'} breadcrumbs={[{label:'CRM'},{label:'Opportunities',href:'/opportunity'},{label:isEdit?'Edit':'New'}]}>
            <Card className="max-w-3xl"><CardHeader><CardTitle>{isEdit?'Edit Opportunity':'Create New Opportunity'}</CardTitle></CardHeader>
                <CardContent><form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2"><Label>Title *</Label><Input value={data.title} onChange={e=>setData('title',e.target.value)} required /></div>
                        <div className="space-y-2"><Label>Contact</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.contact_id} onChange={e=>setData('contact_id',e.target.value)}><option value="">Select...</option>{(contacts||[]).map(c=><option key={c.id} value={c.id}>{c.first_name} {c.last_name} {c.company?`(${c.company})`:''}</option>)}</select></div>
                        <div className="space-y-2"><Label>Value ({currencySymbol}) *</Label><Input type="number" value={data.value} onChange={e=>setData('value',e.target.value)} required /></div>
                        <div className="space-y-2"><Label>Pipeline</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.pipeline_id} onChange={e=>setData('pipeline_id',e.target.value)}>{(pipelines||[]).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                        <div className="space-y-2"><Label>Stage</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.stage_id} onChange={e=>setData('stage_id',e.target.value)}>{stages.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                        <div className="space-y-2"><Label>Assigned To</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.assigned_to} onChange={e=>setData('assigned_to',e.target.value)}><option value="">Unassigned</option>{(users||[]).map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
                        <div className="space-y-2"><Label>Expected Close</Label><Input type="date" value={data.expected_close} onChange={e=>setData('expected_close',e.target.value)} /></div>
                        <div className="space-y-2"><Label>Probability (%)</Label><Input type="number" min="0" max="100" value={data.probability} onChange={e=>setData('probability',e.target.value)} /></div>
                        <div className="space-y-2 col-span-2"><Label>Description</Label><textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" value={data.description} onChange={e=>setData('description',e.target.value)} /></div>
                    </div>
                    <div className="flex gap-3"><Button type="submit" variant="gradient" disabled={processing}>{processing?'Saving...':(isEdit?'Update':'Create Opportunity')}</Button><Link href="/opportunity"><Button type="button" variant="outline">Cancel</Button></Link></div>
                </form></CardContent>
            </Card>
        </AppLayout>
    );
}
