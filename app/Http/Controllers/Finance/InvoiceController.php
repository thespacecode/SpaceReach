<?php
namespace App\Http\Controllers\Finance;
use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Contact;
use App\Models\Deal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function index(Request $r)
    {
        return Inertia::render('Finance/Invoices/Index', [
            'invoices' => Invoice::with(['contact', 'creator'])
                ->when($r->status, fn($q, $s) => $q->where('status', $s))
                ->latest()->paginate(\App\Models\PortalSetting::paginationSize())->withQueryString(),
            'filters' => $r->only('status'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Finance/Invoices/Form', [
            'contacts' => Contact::select('id', 'first_name', 'last_name', 'company')->get(),
            'deals' => Deal::select('id', 'title')->get(),
            'nextNumber' => 'INV-' . str_pad(Invoice::count() + 1, 5, '0', STR_PAD_LEFT),
        ]);
    }

    public function store(Request $r)
    {
        $v = $r->validate([
            'invoice_number' => 'required|unique:invoices',
            'contact_id' => 'nullable|exists:contacts,id',
            'deal_id' => 'nullable|exists:deals,id',
            'items' => 'required|array',
            'subtotal' => 'required|numeric',
            'tax' => 'nullable|numeric',
            'discount' => 'nullable|numeric',
            'total' => 'required|numeric',
            'issue_date' => 'nullable|date',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'terms' => 'nullable|string',
        ]);
        $v['created_by'] = auth()->id();
        $v['status'] = 'draft';
        Invoice::create($v);
        return redirect()->route('finance.invoices.index')->with('success', 'Invoice created.');
    }

    public function show(Invoice $invoice)
    {
        return Inertia::render('Finance/Invoices/Show', [
            'invoice' => $invoice->load(['contact', 'deal', 'payments.recorder', 'creator']),
        ]);
    }

    public function edit(Invoice $invoice)
    {
        return Inertia::render('Finance/Invoices/Form', [
            'invoice' => $invoice,
            'contacts' => Contact::select('id', 'first_name', 'last_name', 'company')->get(),
            'deals' => Deal::select('id', 'title')->get(),
        ]);
    }

    public function update(Request $r, Invoice $invoice)
    {
        $v = $r->validate([
            'items' => 'required|array',
            'subtotal' => 'required|numeric',
            'tax' => 'nullable|numeric',
            'discount' => 'nullable|numeric',
            'total' => 'required|numeric',
            'status' => 'nullable|in:draft,sent,partially_paid,paid,overdue,cancelled',
            'issue_date' => 'nullable|date',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'terms' => 'nullable|string',
        ]);
        $invoice->update($v);
        return redirect()->route('finance.invoices.index')->with('success', 'Invoice updated.');
    }

    public function destroy(Invoice $invoice)
    {
        $invoice->delete();
        return redirect()->route('finance.invoices.index')->with('success', 'Invoice deleted.');
    }
}
