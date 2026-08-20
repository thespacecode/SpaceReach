<?php
namespace App\Http\Controllers\CRM;
use App\Http\Controllers\Controller;
use App\Models\Quote;
use App\Models\Contact;
use App\Models\Deal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuoteController extends Controller
{
    public function index() { return Inertia::render('CRM/Quotes/Index', ['quotes' => Quote::with(['contact', 'deal', 'creator'])->latest()->paginate(\App\Models\PortalSetting::paginationSize())]); }
    public function create() { return Inertia::render('CRM/Quotes/Form', ['contacts' => Contact::select('id','first_name','last_name')->get(), 'deals' => Deal::select('id','title')->get()]); }
    public function store(Request $r) { $v = $r->validate(['quote_number'=>'required|unique:quotes','contact_id'=>'nullable|exists:contacts,id','deal_id'=>'nullable|exists:deals,id','items'=>'required|array','subtotal'=>'required|numeric','tax'=>'nullable|numeric','discount'=>'nullable|numeric','total'=>'required|numeric','valid_until'=>'nullable|date','notes'=>'nullable|string','terms'=>'nullable|string']); $v['created_by']=auth()->id(); $v['status']='draft'; Quote::create($v); return redirect()->route('crm.quotes.index')->with('success','Quote created.'); }
    public function show(Quote $quote) { return Inertia::render('CRM/Quotes/Show', ['quote' => $quote->load(['contact','deal','creator'])]); }
    public function edit(Quote $quote) { return Inertia::render('CRM/Quotes/Form', ['quote'=>$quote, 'contacts'=>Contact::select('id','first_name','last_name')->get(), 'deals'=>Deal::select('id','title')->get()]); }
    public function update(Request $r, Quote $quote) { $v = $r->validate(['items'=>'required|array','subtotal'=>'required|numeric','tax'=>'nullable|numeric','discount'=>'nullable|numeric','total'=>'required|numeric','status'=>'nullable|in:draft,sent,accepted,rejected,expired','valid_until'=>'nullable|date','notes'=>'nullable|string','terms'=>'nullable|string']); $quote->update($v); return redirect()->route('crm.quotes.index')->with('success','Quote updated.'); }
    public function destroy(Quote $quote) { $quote->delete(); return redirect()->route('crm.quotes.index')->with('success','Quote deleted.'); }
}
