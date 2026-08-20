<?php
namespace App\Http\Controllers\Finance;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index()
    {
        return Inertia::render('Finance/Payments/Index', [
            'payments' => Payment::with(['invoice.contact', 'recorder'])->latest()->paginate(\App\Models\PortalSetting::paginationSize()),
        ]);
    }

    public function store(Request $r)
    {
        $v = $r->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'amount' => 'required|numeric|min:0.01',
            'method' => 'required|string',
            'transaction_id' => 'nullable|string',
            'paid_at' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);
        $v['recorded_by'] = auth()->id();
        $v['status'] = 'completed';
        $p = Payment::create($v);
        $inv = $p->invoice;
        $totalPaid = $inv->payments()->where('status', 'completed')->sum('amount');
        if ($totalPaid >= $inv->total) {
            $inv->update(['status' => 'paid', 'paid_at' => now()]);
        } else {
            $inv->update(['status' => 'partially_paid']);
        }
        return back()->with('success', 'Payment recorded.');
    }
}
