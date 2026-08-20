<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Department;
use App\Models\Designation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $r)
    {
        return Inertia::render('Admin/Users/Index', [
            'users' => User::with(['department', 'designation', 'roles'])
                ->when($r->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%"))
                ->latest()->paginate(\App\Models\PortalSetting::paginationSize())->withQueryString(),
            'roles' => Role::all(),
            'departments' => Department::all(),
            'designations' => Designation::all(),
            'filters' => $r->only('search'),
        ]);
    }

    public function store(Request $r)
    {
        $v = $r->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8',
            'department_id' => 'nullable|exists:departments,id',
            'designation_id' => 'nullable|exists:designations,id',
            'role' => 'required|exists:roles,name',
        ]);
        $u = User::create([
            'name' => $v['name'],
            'email' => $v['email'],
            'password' => bcrypt($v['password']),
            'department_id' => $v['department_id'] ?? null,
            'designation_id' => $v['designation_id'] ?? null,
            'status' => 'active',
        ]);
        $u->assignRole($v['role']);
        return back()->with('success', 'User created.');
    }

    public function update(Request $r, User $user)
    {
        $v = $r->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'department_id' => 'nullable|exists:departments,id',
            'designation_id' => 'nullable|exists:designations,id',
            'role' => 'nullable|exists:roles,name',
            'status' => 'nullable|in:active,inactive,suspended',
        ]);
        $user->update($v);
        if (isset($v['role'])) {
            $user->syncRoles([$v['role']]);
        }
        return back()->with('success', 'User updated.');
    }

    public function destroy(User $user)
    {
        $user->delete();
        return back()->with('success', 'User deleted.');
    }
}
