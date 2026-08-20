<?php
namespace App\Http\Controllers\Employee;
use App\Http\Controllers\Controller;
use App\Models\EmployeeGroup;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GroupController extends Controller
{
    public function index()
    {
        return Inertia::render('Employees/Groups/Index', [
            'groups' => EmployeeGroup::with('members')->latest()->paginate(\App\Models\PortalSetting::paginationSize()),
        ]);
    }

    public function create()
    {
        return Inertia::render('Employees/Groups/Form', [
            'users' => User::where('status', 'active')->select('id', 'name')->get(),
        ]);
    }

    public function store(Request $r)
    {
        $v = $r->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'members' => 'array',
        ]);
        $g = EmployeeGroup::create([
            'name' => $v['name'],
            'description' => $v['description'] ?? null,
            'created_by' => auth()->id(),
        ]);
        if (isset($v['members'])) $g->members()->attach($v['members']);
        return redirect()->route('employees.groups.index')->with('success', 'Group created.');
    }

    public function destroy(EmployeeGroup $group)
    {
        $group->delete();
        return back()->with('success', 'Group deleted.');
    }
}
