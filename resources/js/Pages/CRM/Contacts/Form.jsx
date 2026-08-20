import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { useForm, Link } from '@inertiajs/react';

export default function ContactForm({ contact, users }) {
    const isEdit = !!contact;
    const { data, setData, post, put, processing, errors } = useForm({
        first_name: contact?.first_name || '', last_name: contact?.last_name || '',
        email: contact?.email || '', phone: contact?.phone || '',
        company: contact?.company || '', job_title: contact?.job_title || '',
        source: contact?.source || 'manual', status: contact?.status || 'lead',
        assigned_to: contact?.assigned_to || '', address: contact?.address || '',
        city: contact?.city || '', state: contact?.state || '', country: contact?.country || '',
    });

    const submit = (e) => { e.preventDefault(); isEdit ? put(`/contacts/${contact.id}`) : post('/contacts'); };

    return (
        <AppLayout title={isEdit ? 'Edit Contact' : 'New Contact'} breadcrumbs={[{label:'CRM',href:'/contacts'},{label:'Contacts',href:'/contacts'},{label:isEdit?'Edit':'New'}]}>
            <Card className="max-w-3xl">
                <CardHeader><CardTitle>{isEdit ? 'Edit Contact' : 'Create New Contact'}</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>First Name *</Label><Input value={data.first_name} onChange={e=>setData('first_name',e.target.value)} required />{errors.first_name && <p className="text-xs text-red-400">{errors.first_name}</p>}</div>
                            <div className="space-y-2"><Label>Last Name</Label><Input value={data.last_name} onChange={e=>setData('last_name',e.target.value)} /></div>
                            <div className="space-y-2"><Label>Email</Label><Input type="email" value={data.email} onChange={e=>setData('email',e.target.value)} /></div>
                            <div className="space-y-2"><Label>Phone</Label><Input value={data.phone} onChange={e=>setData('phone',e.target.value)} /></div>
                            <div className="space-y-2"><Label>Company</Label><Input value={data.company} onChange={e=>setData('company',e.target.value)} /></div>
                            <div className="space-y-2"><Label>Job Title</Label><Input value={data.job_title} onChange={e=>setData('job_title',e.target.value)} /></div>
                            <div className="space-y-2"><Label>Source</Label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.source} onChange={e=>setData('source',e.target.value)}>
                                    <option value="manual">Manual</option><option value="website">Website</option><option value="referral">Referral</option><option value="chatbot">Chatbot</option><option value="form">Form</option><option value="import">Import</option>
                                </select>
                            </div>
                            <div className="space-y-2"><Label>Status</Label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.status} onChange={e=>setData('status',e.target.value)}>
                                    <option value="lead">Lead</option><option value="active">Active</option><option value="customer">Customer</option><option value="inactive">Inactive</option><option value="lost">Lost</option>
                                </select>
                            </div>
                            <div className="space-y-2"><Label>Assigned To</Label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.assigned_to} onChange={e=>setData('assigned_to',e.target.value)}>
                                    <option value="">Unassigned</option>
                                    {(users||[]).map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2"><Label>City</Label><Input value={data.city} onChange={e=>setData('city',e.target.value)} /></div>
                            <div className="space-y-2"><Label>State</Label><Input value={data.state} onChange={e=>setData('state',e.target.value)} /></div>
                            <div className="space-y-2"><Label>Country</Label><Input value={data.country} onChange={e=>setData('country',e.target.value)} /></div>
                        </div>
                        <div className="flex gap-3">
                            <Button type="submit" variant="gradient" disabled={processing}>{processing ? 'Saving...' : (isEdit ? 'Update Contact' : 'Create Contact')}</Button>
                            <Link href="/contacts"><Button type="button" variant="outline">Cancel</Button></Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
