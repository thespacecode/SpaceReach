<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditController extends Controller
{
    public function index(Request $r)
    {
        return Inertia::render('Admin/Audit', [
            'logs' => AuditLog::with('user')
                ->when($r->user_id, fn($q, $u) => $q->where('user_id', $u))
                ->latest('created_at')->paginate(50)->withQueryString(),
            'users' => User::select('id', 'name')->get(),
            'filters' => $r->only('user_id'),
        ]);
    }
}
