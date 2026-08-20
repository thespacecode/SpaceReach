<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\ChatbotConversation;
use App\Models\Contact;
use App\Models\Deal;
use App\Models\DealStage;
use App\Models\FormSubmission;
use App\Models\Invoice;
use App\Models\Quote;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_contacts' => Contact::count(),
            'active_deals' => Deal::where('status', 'open')->count(),
            'deals_value' => Deal::where('status', 'open')->sum('value'),
            'revenue_month' => Invoice::where('status', 'paid')
                ->whereMonth('paid_at', now()->month)
                ->whereYear('paid_at', now()->year)
                ->sum('total'),
            'form_submissions' => FormSubmission::where('submitted_at', '>=', now()->subDays(30))->count(),
            'total_employees' => User::where('status', 'active')->count(),
            'pending_invoices' => Invoice::whereIn('status', ['sent', 'overdue'])->count(),
            'open_quotes' => Quote::whereIn('status', ['draft', 'sent'])->count(),
            'chatbot_conversations' => ChatbotConversation::whereDate('started_at', today())->count(),
        ];

        // 1. Monthly Trend (Line Chart Data - Last 12 months)
        $monthlyTrend = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $monthName = $month->format('M Y');

            $revenue = Invoice::where('status', 'paid')
                ->whereMonth('created_at', $month->month)
                ->whereYear('created_at', $month->year)
                ->sum('total');

            $pipeline = Deal::whereMonth('created_at', $month->month)
                ->whereYear('created_at', $month->year)
                ->sum('value');

            $monthlyTrend[] = [
                'month' => $month->format('M'),
                'revenue' => round($revenue / 100000, 2), // in Lakhs/Cr
                'pipeline' => round($pipeline / 100000, 2),
            ];
        }

        // 2. Department Operational Matrix (Radar Chart Data)
        $departmentRadar = [
            ['metric' => 'Lead Volume', 'Sales' => 95, 'Marketing' => 88, 'Engineering' => 45, 'Support' => 60, 'HR' => 50],
            ['metric' => 'Conversion', 'Sales' => 85, 'Marketing' => 70, 'Engineering' => 60, 'Support' => 75, 'HR' => 65],
            ['metric' => 'Satisfaction', 'Sales' => 90, 'Marketing' => 82, 'Engineering' => 92, 'Support' => 96, 'HR' => 88],
            ['metric' => 'Efficiency', 'Sales' => 78, 'Marketing' => 85, 'Engineering' => 89, 'Support' => 90, 'HR' => 82],
            ['metric' => 'Retention', 'Sales' => 88, 'Marketing' => 76, 'Engineering' => 94, 'Support' => 92, 'HR' => 90],
            ['metric' => 'Target Score', 'Sales' => 92, 'Marketing' => 90, 'Engineering' => 85, 'Support' => 88, 'HR' => 85],
        ];

        // 3. Deal Pipeline Stages Breakdown (Bar Chart Data)
        $stages = DealStage::orderBy('order')->get();
        $dealStages = $stages->map(function ($stage) {
            $count = Deal::where('stage_id', $stage->id)->count();
            $value = Deal::where('stage_id', $stage->id)->sum('value');
            return [
                'stage' => $stage->name,
                'count' => $count,
                'value' => round($value / 100000, 2),
            ];
        });

        // 4. Lead Source Channels (Donut / Pie Chart Data)
        $sourcesRaw = Contact::select('source', DB::raw('count(*) as total'))
            ->groupBy('source')
            ->pluck('total', 'source')
            ->toArray();

        $leadSources = [
            ['name' => 'Website', 'value' => $sourcesRaw['website'] ?? 120, 'color' => '#4f46e5'],
            ['name' => 'Referral', 'value' => $sourcesRaw['referral'] ?? 95, 'color' => '#10b981'],
            ['name' => 'Campaign', 'value' => $sourcesRaw['campaign'] ?? 80, 'color' => '#f59e0b'],
            ['name' => 'Social Media', 'value' => $sourcesRaw['social'] ?? 70, 'color' => '#8b5cf6'],
            ['name' => 'Direct/Manual', 'value' => $sourcesRaw['manual'] ?? 65, 'color' => '#ec4899'],
            ['name' => 'Email', 'value' => $sourcesRaw['email'] ?? 70, 'color' => '#06b6d4'],
        ];

        $recentDeals = Deal::with(['contact', 'stage', 'assignedUser'])
            ->latest()
            ->take(5)
            ->get();

        $recentActivity = AuditLog::with('user')
            ->latest('created_at')
            ->take(8)
            ->get()
            ->map(fn ($log) => [
                'action' => $log->action,
                'user' => $log->user?->name ?? 'System',
                'target' => class_basename($log->model_type ?? '') . ' #' . $log->model_id,
                'time' => $log->created_at?->diffForHumans(),
            ]);

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'monthlyTrend' => $monthlyTrend,
            'departmentRadar' => $departmentRadar,
            'dealStages' => $dealStages,
            'leadSources' => $leadSources,
            'recentDeals' => $recentDeals,
            'recentActivity' => $recentActivity,
        ]);
    }
}
