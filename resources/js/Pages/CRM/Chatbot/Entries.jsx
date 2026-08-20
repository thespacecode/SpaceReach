import AppLayout from '@/Layouts/AppLayout';import{Card,CardContent,CardHeader,CardTitle}from'@/Components/ui/card';import{Badge}from'@/Components/ui/badge';import{Button}from'@/Components/ui/button';import{Input}from'@/Components/ui/input';import{useForm}from'@inertiajs/react';import{Plus}from'lucide-react';import{useState}from'react';
export default function Entries({entries,categories,filters}){const[showForm,setShowForm]=useState(false);const{data,setData,post,processing}=useForm({question:'',answer:'',category_id:'',keywords:[],intent:''});
const submit=(e)=>{e.preventDefault();post('/crm/chatbot/entries',{onSuccess:()=>setShowForm(false)});};
return(<AppLayout title="Knowledge Base" breadcrumbs={[{label:'CRM'},{label:'Chatbot',href:'/crm/chatbot'},{label:'Knowledge Base'}]}>
<div className="flex justify-between mb-6"><div/><Button variant="gradient" onClick={()=>setShowForm(!showForm)} className="gap-1.5"><Plus className="h-4 w-4"/> Add Entry</Button></div>
{showForm&&<Card className="mb-6"><CardContent className="p-6"><form onSubmit={submit} className="space-y-4">
<div className="grid grid-cols-2 gap-4"><div className="space-y-2"><label className="text-sm font-medium">Question *</label><Input value={data.question} onChange={e=>setData('question',e.target.value)} required/></div>
<div className="space-y-2"><label className="text-sm font-medium">Category</label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.category_id} onChange={e=>setData('category_id',e.target.value)}><option value="">Select...</option>{(categories||[]).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
<div className="space-y-2 col-span-2"><label className="text-sm font-medium">Answer *</label><textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" value={data.answer} onChange={e=>setData('answer',e.target.value)} required/></div></div>
<Button type="submit" variant="gradient" disabled={processing}>{processing?'Saving...':'Save Entry'}</Button></form></CardContent></Card>}
<Card><CardContent className="p-0"><table className="w-full"><thead><tr className="border-b border-border">
<th className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground p-4">Question</th>
<th className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground p-4">Category</th>
<th className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground p-4">Status</th>
</tr></thead><tbody>{(entries?.data||[]).map(e=><tr key={e.id} className="border-b border-border/50 hover:bg-muted/30"><td className="p-4"><p className="text-sm font-medium">{e.question}</p><p className="text-xs text-muted-foreground mt-1 truncate max-w-md">{e.answer}</p></td><td className="p-4 text-sm">{e.category?.name||'—'}</td><td className="p-4"><Badge variant={e.is_active?'active':'inactive'}>{e.is_active?'Active':'Inactive'}</Badge></td></tr>)}
{(entries?.data||[]).length===0&&<tr><td colSpan="3" className="text-center py-12 text-muted-foreground">No entries yet</td></tr>}
</tbody></table></CardContent></Card></AppLayout>);}
