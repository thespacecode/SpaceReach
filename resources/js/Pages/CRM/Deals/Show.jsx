import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Currency, DateDisplay } from '@/Components/SettingsFormatters';

export default function DealShow({ deal }) {
    return (
        <AppLayout title={deal.title} breadcrumbs={[{label:'CRM'},{label:'Opportunities',href:'/opportunity'},{label:deal.title}]}>
            <Link href="/opportunity"><Button variant="ghost" size="sm" className="mb-4 gap-1"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2"><CardHeader><CardTitle>{deal.title}</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><p className="text-muted-foreground">Value</p><p className="text-2xl font-bold text-foreground"><Currency value={deal.value||0}/></p></div>
                            <div><p className="text-muted-foreground">Stage</p><Badge>{deal.stage?.name}</Badge></div>
                            <div><p className="text-muted-foreground">Contact</p><p>{deal.contact?.first_name} {deal.contact?.last_name}</p></div>
                            <div><p className="text-muted-foreground">Assigned To</p><p>{deal.assigned_user?.name||'—'}</p></div>
                            <div><p className="text-muted-foreground">Probability</p><p>{deal.probability||0}%</p></div>
                            <div><p className="text-muted-foreground">Expected Close</p><p><DateDisplay value={deal.expected_close}/></p></div>
                        </div>
                        {deal.description && <div><p className="text-muted-foreground text-sm mb-1">Description</p><p className="text-sm">{deal.description}</p></div>}
                    </CardContent>
                </Card>
                <Card><CardHeader><CardTitle className="text-base">Actions</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <Link href={`/opportunity/${deal.id}/edit`}><Button variant="outline" className="w-full">Edit Opportunity</Button></Link>
                        <Link href={`/opportunity/${deal.id}`} method="delete" as="button" className="w-full"><Button variant="destructive" className="w-full">Delete</Button></Link>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
