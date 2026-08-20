<?php
namespace App\Http\Controllers\Employee;
use App\Http\Controllers\Controller;
use App\Models\Okr;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OkrController extends Controller
{
    public function index()
    {
        $q = Okr::with(['user', 'keyResults']);
        if (!auth()->user()->hasRole(['superadmin', 'admin', 'manager'])) {
            $q->where('user_id', auth()->id());
        }
        return Inertia::render('Employees/OKRs/Index', ['okrs' => $q->latest()->paginate(\App\Models\PortalSetting::paginationSize())]);
    }

    public function create()
    {
        return Inertia::render('Employees/OKRs/Form');
    }

    public function store(Request $r)
    {
        $v = $r->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after:period_start',
            'key_results' => 'array',
        ]);
        $okr = Okr::create([
            'user_id' => auth()->id(),
            'title' => $v['title'],
            'description' => $v['description'] ?? null,
            'period_start' => $v['period_start'],
            'period_end' => $v['period_end'],
            'status' => 'draft',
        ]);
        foreach (($v['key_results'] ?? []) as $kr) {
            $okr->keyResults()->create($kr);
        }
        return redirect()->route('employees.okrs.index')->with('success', 'OKR created.');
    }
}
