import AppLayout from '@/Layouts/AppLayout';import{Card,CardContent,CardHeader,CardTitle}from'@/Components/ui/card';import{Badge}from'@/Components/ui/badge';import{Avatar,AvatarFallback}from'@/Components/ui/avatar';import{Button}from'@/Components/ui/button';import{Link}from'@inertiajs/react';import{ArrowLeft,Mail,Phone,Building2}from'lucide-react';
export default function EmployeeShow({employee}){return(<AppLayout title={employee.name} breadcrumbs={[{label:'Employees',href:'/employees'},{label:employee.name}]}>
<Link href="/employees"><Button variant="ghost" size="sm" className="mb-4 gap-1"><ArrowLeft className="h-4 w-4"/> Back</Button></Link>
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
<Card><CardContent className="p-6 text-center"><Avatar className="h-20 w-20 mx-auto mb-3"><AvatarFallback className="bg-[#111]/10 text-[#111] text-2xl font-bold">{employee.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}</AvatarFallback></Avatar>
<h2 className="text-lg font-bold">{employee.name}</h2><p className="text-sm text-muted-foreground">{employee.designation?.name}</p>
<Badge variant={employee.status} className="mt-2">{employee.status}</Badge>
<div className="mt-4 space-y-2 text-left"><div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground"/>{employee.email}</div>
{employee.phone&&<div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground"/>{employee.phone}</div>}
<div className="flex items-center gap-2 text-sm"><Building2 className="h-4 w-4 text-muted-foreground"/>{employee.department?.name||'—'}</div></div></CardContent></Card>
<div className="lg:col-span-2 space-y-6">
<Card><CardHeader><CardTitle className="text-base">Reporting To</CardTitle></CardHeader><CardContent><p className="text-sm">{employee.manager?.name||'—'}</p></CardContent></Card>
<Card><CardHeader><CardTitle className="text-base">Direct Reports ({(employee.subordinates||[]).length})</CardTitle></CardHeader><CardContent>{(employee.subordinates||[]).map(s=><div key={s.id} className="flex items-center gap-2 py-1"><span className="text-sm">{s.name}</span></div>)}{(employee.subordinates||[]).length===0&&<p className="text-sm text-muted-foreground">No direct reports</p>}</CardContent></Card>
</div></div></AppLayout>);}
