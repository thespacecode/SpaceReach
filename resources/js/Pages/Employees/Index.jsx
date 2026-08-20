import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Link } from '@inertiajs/react';
import { Search, Plus } from 'lucide-react';
import { useState } from 'react';

export default function EmployeesIndex({ employees, departments, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    return (
        <AppLayout title="Employees" breadcrumbs={[{label:'Employees'}]}>
            <div className="flex items-center justify-between mb-6">
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><form><Input placeholder="Search employees..." className="pl-9 w-[300px]" name="search" value={search} onChange={e=>setSearch(e.target.value)} /></form></div>
                <Link href="/admin/users">
                    <Button variant="gradient" className="gap-1.5"><Plus className="h-4 w-4" /> Add Employee</Button>
                </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {(employees?.data||[]).map(emp => (
                    <Card key={emp.id} className="hover:border-primary/30 transition-all hover:-translate-y-0.5">
                        <CardContent className="p-5 text-center">
                            <Avatar className="h-16 w-16 mx-auto mb-3">
                                <AvatarImage src={emp.avatar_url} />
                                <AvatarFallback className="bg-[#111]/10 text-[#111] font-bold">{emp.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}</AvatarFallback>
                            </Avatar>
                            <Link href={`/employees/${emp.id}`} className="font-semibold text-sm hover:text-foreground">{emp.name}</Link>
                            <p className="text-xs text-muted-foreground mt-0.5">{emp.designation?.name || '—'}</p>
                            <p className="text-xs text-muted-foreground">{emp.department?.name || '—'}</p>
                            <div className="flex justify-center gap-1 mt-2">{(emp.roles||[]).map(r=><Badge key={r.id||r.name} variant="outline" className="text-[10px]">{r.name}</Badge>)}</div>
                            <Badge variant={emp.status} className="mt-2">{emp.status}</Badge>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </AppLayout>
    );
}
