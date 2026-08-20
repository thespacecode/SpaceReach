import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { Currency, DateDisplay } from '@/Components/SettingsFormatters';

export default function QuotesIndex({ quotes }) {
    return (
        <AppLayout title="Proposals" breadcrumbs={[{label:'CRM'},{label:'Proposals'}]}>
            <div className="flex justify-between mb-6">
                <div />
                <Link href="/proposals/create"><Button variant="gradient" className="gap-1.5"><Plus className="h-4 w-4" /> New Proposal</Button></Link>
            </div>
            <Card><CardContent className="p-0"><table className="w-full"><thead><tr className="border-b border-border">
                <th className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground p-4">Proposal #</th>
                <th className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground p-4">Contact</th>
                <th className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground p-4">Total</th>
                <th className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground p-4">Status</th>
                <th className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground p-4">Valid Until</th>
            </tr></thead><tbody>
                {(quotes?.data||[]).map(q=><tr key={q.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="p-4 font-medium text-sm"><Link href={`/proposals/${q.id}`} className="hover:text-foreground">{q.quote_number}</Link></td>
                    <td className="p-4 text-sm">{q.contact?.first_name} {q.contact?.last_name}</td>
                    <td className="p-4 text-sm font-bold"><Currency value={q.total||0}/></td>
                    <td className="p-4"><Badge variant={q.status}>{q.status}</Badge></td>
                    <td className="p-4 text-sm text-muted-foreground"><DateDisplay value={q.valid_until}/></td>
                </tr>)}
                {(quotes?.data||[]).length===0&&<tr><td colSpan="5" className="text-center py-12 text-muted-foreground">No proposals yet</td></tr>}
            </tbody></table></CardContent></Card>
        </AppLayout>
    );
}
