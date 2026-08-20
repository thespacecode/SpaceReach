<?php
namespace App\Http\Controllers\Employee;
use App\Http\Controllers\Controller;
use App\Models\PeerReview;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReviewController extends Controller
{
    public function index()
    {
        $q = PeerReview::with(['reviewer', 'reviewee']);
        if (!auth()->user()->hasRole(['superadmin', 'admin', 'manager'])) {
            $q->where('reviewee_id', auth()->id())->orWhere('reviewer_id', auth()->id());
        }
        return Inertia::render('Employees/Reviews/Index', ['reviews' => $q->latest()->paginate(\App\Models\PortalSetting::paginationSize())]);
    }

    public function create()
    {
        return Inertia::render('Employees/Reviews/Form', [
            'users' => User::where('status', 'active')->where('id', '!=', auth()->id())->select('id', 'name')->get(),
        ]);
    }

    public function store(Request $r)
    {
        $v = $r->validate([
            'reviewee_id' => 'required|exists:users,id',
            'period' => 'required|string',
            'rating' => 'nullable|integer|min:1|max:5',
            'strengths' => 'nullable|string',
            'improvements' => 'nullable|string',
            'feedback' => 'nullable|string',
        ]);
        $v['reviewer_id'] = auth()->id();
        $v['status'] = 'submitted';
        PeerReview::create($v);
        return redirect()->route('employees.reviews.index')->with('success', 'Review submitted.');
    }
}
