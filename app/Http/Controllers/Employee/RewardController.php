<?php
namespace App\Http\Controllers\Employee;
use App\Http\Controllers\Controller;
use App\Models\Reward;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RewardController extends Controller
{
    public function index()
    {
        return Inertia::render('Employees/Rewards/Index', [
            'rewards' => Reward::with(['user', 'awarder'])->latest()->paginate(\App\Models\PortalSetting::paginationSize()),
            'users' => User::where('status', 'active')->select('id', 'name')->get(),
            'leaderboard' => User::select('id', 'name')
                ->withSum('rewards', 'points')
                ->orderByDesc('rewards_sum_points')
                ->take(10)->get(),
        ]);
    }

    public function store(Request $r)
    {
        $v = $r->validate([
            'user_id' => 'required|exists:users,id',
            'title' => 'required|string',
            'description' => 'nullable|string',
            'points' => 'required|integer|min:1',
        ]);
        $v['awarded_by'] = auth()->id();
        $v['awarded_at'] = now();
        Reward::create($v);
        return back()->with('success', 'Reward awarded.');
    }
}
