import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Link } from '@inertiajs/react';
import { Bot, MessageSquare, Database, HelpCircle, Settings, TrendingUp } from 'lucide-react';

function StatCard({ title, value, icon: Icon, color }) {
    return (
        <Card><CardContent className="p-6 flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}><Icon className="h-6 w-6" /></div>
            <div><p className="text-2xl font-bold">{value}</p><p className="text-sm text-muted-foreground">{title}</p></div>
        </CardContent></Card>
    );
}

export default function ChatbotIndex({ stats, categories, recentUnanswered, recentConversations, settings }) {
    const s = stats || {};
    return (
        <AppLayout title="Live Chat" breadcrumbs={[{label:'CRM'},{label:'Live Chat'}]}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <StatCard title="Total Conversations" value={s.total_conversations||0} icon={MessageSquare} color="bg-[#111]/10 text-[#111]" />
                <StatCard title="Today" value={s.today_conversations||0} icon={TrendingUp} color="bg-emerald-500/15 text-emerald-400" />
                <StatCard title="Knowledge Base" value={s.total_entries||0} icon={Database} color="bg-secondary/15 text-secondary" />
                <StatCard title="Unanswered" value={s.unanswered_count||0} icon={HelpCircle} color="bg-amber-500/15 text-amber-400" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
                <Link href="/crm/chatbot/entries"><Button variant="outline" className="h-auto py-4 flex-col gap-2"><Database className="h-5 w-5" /><span className="text-xs">Knowledge Base</span></Button></Link>
                <Link href="/crm/chatbot/conversations"><Button variant="outline" className="h-auto py-4 flex-col gap-2"><MessageSquare className="h-5 w-5" /><span className="text-xs">Conversations</span></Button></Link>
                <Link href="/crm/chatbot/unanswered"><Button variant="outline" className="h-auto py-4 flex-col gap-2"><HelpCircle className="h-5 w-5" /><span className="text-xs">Unanswered</span></Button></Link>
                <Link href="/crm/chatbot/settings"><Button variant="outline" className="h-auto py-4 flex-col gap-2"><Settings className="h-5 w-5" /><span className="text-xs">Settings</span></Button></Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card><CardHeader><CardTitle className="text-base">Categories</CardTitle></CardHeader>
                    <CardContent>{(categories||[]).map(c=><div key={c.id} className="flex justify-between items-center py-2 border-b border-border/50"><div className="flex items-center gap-2"><span>{c.icon}</span><span className="text-sm font-medium">{c.name}</span></div><Badge variant="outline">{c.entries_count} entries</Badge></div>)}</CardContent>
                </Card>
                <Card><CardHeader><CardTitle className="text-base">Top Unanswered Questions</CardTitle></CardHeader>
                    <CardContent>{(recentUnanswered||[]).map(q=><div key={q.id} className="flex justify-between items-center py-2 border-b border-border/50"><p className="text-sm truncate flex-1">{q.question}</p><Badge variant="warning">{q.occurrence_count}x</Badge></div>)}
                    {(recentUnanswered||[]).length===0&&<p className="text-sm text-muted-foreground text-center py-4">No unanswered questions 🎉</p>}</CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
