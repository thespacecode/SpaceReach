<?php
namespace App\Http\Controllers\Employee;
use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaveController extends Controller
{
    public function index()
    {
        $q = LeaveRequest::with(['user', 'leaveType', 'approver']);
        if (!auth()->user()->hasRole(['superadmin', 'admin', 'manager'])) {
            $q->where('user_id', auth()->id());
        }
        return Inertia::render('Employees/Leaves/Index', [
            'leaves' => $q->latest()->paginate(\App\Models\PortalSetting::paginationSize()),
            'leaveTypes' => LeaveType::where('is_active', true)->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Employees/Leaves/Form', [
            'leaveTypes' => LeaveType::where('is_active', true)->get(),
        ]);
    }

    public function store(Request $r)
    {
        $v = $r->validate([
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'nullable|string',
        ]);
        $v['user_id'] = auth()->id();
        LeaveRequest::create($v);
        return redirect()->route('employees.leaves.index')->with('success', 'Leave request submitted.');
    }

    public function approve(LeaveRequest $leave)
    {
        $leave->update(['status' => 'approved', 'approved_by' => auth()->id()]);
        return back()->with('success', 'Leave approved.');
    }

    public function reject(Request $r, LeaveRequest $leave)
    {
        $leave->update(['status' => 'rejected', 'approved_by' => auth()->id(), 'rejection_reason' => $r->reason]);
        return back()->with('success', 'Leave rejected.');
    }
}
