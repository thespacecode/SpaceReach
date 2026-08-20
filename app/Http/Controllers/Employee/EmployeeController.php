<?php
namespace App\Http\Controllers\Employee;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $users = User::with(['department', 'designation', 'roles'])
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%"))
            ->when($request->department, fn($q, $d) => $q->where('department_id', $d))
            ->latest()->paginate(\App\Models\PortalSetting::paginationSize())->withQueryString();
        return Inertia::render('Employees/Index', [
            'employees' => $users,
            'departments' => Department::all(),
            'filters' => $request->only('search', 'department'),
        ]);
    }

    public function show(User $employee)
    {
        return Inertia::render('Employees/Show', [
            'employee' => $employee->load(['department', 'designation', 'manager', 'subordinates', 'roles']),
        ]);
    }
}
