import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { useForm, Link, router } from '@inertiajs/react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function UsersIndex({ users, roles, departments, designations, filters }) {
    const [showForm, setShowForm] = useState(false);
    const { data, setData, post, processing, reset } = useForm({ name: '', email: '', password: '', department_id: '', designation_id: '', role: 'employee' });
    const submit = (e) => { e.preventDefault(); post('/admin/users', { onSuccess: () => { reset(); setShowForm(false); } }); };

    return (
        <AppLayout title="Users & Roles" breadcrumbs={[{label:'Admin'},{label:'Users & Roles'}]}>
            <div className="flex justify-between mb-6">
                <form><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search users..." className="pl-9 w-[300px]" name="search" defaultValue={filters?.search} /></div></form>
                <Button variant="gradient" className="gap-1.5" onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4" /> Add User</Button>
            </div>

            {showForm && (
                <Card className="mb-6"><CardContent className="p-6"><form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2"><label className="text-sm font-medium">Name *</label><Input value={data.name} onChange={e => setData('name', e.target.value)} required /></div>
                        <div className="space-y-2"><label className="text-sm font-medium">Email *</label><Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} required /></div>
                        <div className="space-y-2"><label className="text-sm font-medium">Password *</label><Input type="password" value={data.password} onChange={e => setData('password', e.target.value)} required /></div>
                        <div className="space-y-2"><label className="text-sm font-medium">Role</label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.role} onChange={e => setData('role', e.target.value)}>{(roles||[]).map(r => <option key={r.id} value={r.name}>{r.name}</option>)}</select></div>
                        <div className="space-y-2"><label className="text-sm font-medium">Department</label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.department_id} onChange={e => setData('department_id', e.target.value)}><option value="">None</option>{(departments||[]).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
                        <div className="space-y-2"><label className="text-sm font-medium">Designation</label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.designation_id} onChange={e => setData('designation_id', e.target.value)}><option value="">None</option>{(designations||[]).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
                    </div>
                    <div className="flex gap-2"><Button type="submit" variant="gradient" disabled={processing}>{processing ? 'Creating...' : 'Create User'}</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
                </form></CardContent></Card>
            )}

            <Card><CardContent className="p-0"><table className="w-full"><thead><tr className="border-b border-border">
                <th className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground p-4">Name</th>
                <th className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground p-4">Email</th>
                <th className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground p-4">Role</th>
                <th className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground p-4">Department</th>
                <th className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground p-4">Status</th>
                <th className="p-4"></th>
            </tr></thead><tbody>
                {(users?.data||[]).map(u => (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-4 font-medium text-sm">{u.name}</td>
                        <td className="p-4 text-sm text-muted-foreground">{u.email}</td>
                        <td className="p-4">{(u.roles||[]).map(r => <Badge key={r.id||r.name} variant="outline" className="mr-1">{r.name}</Badge>)}</td>
                        <td className="p-4 text-sm">{u.department?.name || '—'}</td>
                        <td className="p-4"><Badge variant={u.status}>{u.status}</Badge></td>
                        <td className="p-4"><Link href={`/admin/users/${u.id}`} method="delete" as="button"><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></Link></td>
                    </tr>
                ))}
            </tbody></table></CardContent></Card>
        </AppLayout>
    );
}
