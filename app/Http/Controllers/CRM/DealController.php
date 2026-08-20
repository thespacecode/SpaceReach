<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Deal;
use App\Models\DealStage;
use App\Models\Pipeline;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DealController extends Controller
{
    public function index(Request $request)
    {
        $pipeline = Pipeline::where('is_default', true)->first() ?? Pipeline::first();
        $stages = DealStage::where('pipeline_id', $pipeline?->id)->orderBy('order')->get();

        $search = $request->input('search');
        $stageId = $request->input('stage_id');
        $status = $request->input('status', 'all');

        // Fetch paginated Opportunities (Deals) for tabular list
        $dealsQuery = Deal::with(['contact:id,first_name,last_name,email,company', 'stage', 'assignedUser:id,name'])
            ->where('pipeline_id', $pipeline?->id)
            ->when($search, function ($q, $s) {
                $q->where('title', 'like', "%{$s}%")
                  ->orWhereHas('contact', function ($q2) use ($s) {
                      $q2->where('first_name', 'like', "%{$s}%")
                        ->orWhere('last_name', 'like', "%{$s}%")
                        ->orWhere('company', 'like', "%{$s}%");
                  });
            })
            ->when($stageId && $stageId !== 'all', fn($q) => $q->where('stage_id', $stageId))
            ->when($status && $status !== 'all', fn($q) => $q->where('status', $status))
            ->orderByDesc('id');

        $deals = $dealsQuery->paginate(\App\Models\PortalSetting::paginationSize())->withQueryString();

        // Calculate aggregated KPI totals
        $allDeals = Deal::where('pipeline_id', $pipeline?->id)->get();
        $stats = [
            'total_opportunities' => $allDeals->count(),
            'open_value' => $allDeals->where('status', 'open')->sum('value'),
            'won_value' => $allDeals->where('status', 'won')->sum('value'),
            'win_rate' => $allDeals->count() > 0 ? round(($allDeals->where('status', 'won')->count() / $allDeals->count()) * 100, 1) : 0,
        ];

        return Inertia::render('CRM/Deals/Index', [
            'pipeline' => $pipeline,
            'stages' => $stages,
            'deals' => $deals,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'stage_id' => $stageId,
                'status' => $status,
            ],
            'pipelines' => Pipeline::all(),
        ]);
    }

    public function create()
    {
        return Inertia::render('CRM/Deals/Form', [
            'contacts' => Contact::select('id', 'first_name', 'last_name', 'company')->get(),
            'pipelines' => Pipeline::with('stages')->get(),
            'users' => User::where('status', 'active')->select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'contact_id' => 'nullable|exists:contacts,id',
            'value' => 'required|numeric|min:0',
            'pipeline_id' => 'required|exists:pipelines,id',
            'stage_id' => 'required|exists:deal_stages,id',
            'assigned_to' => 'nullable|exists:users,id',
            'expected_close' => 'nullable|date',
            'probability' => 'nullable|integer|min:0|max:100',
            'description' => 'nullable|string',
        ]);

        $validated['created_by'] = auth()->id();
        $validated['status'] = 'open';

        Deal::create($validated);

        return redirect()->route('crm.deals.index')->with('success', 'Opportunity created successfully.');
    }

    public function show(Deal $deal)
    {
        $deal->load(['contact', 'stage', 'pipeline', 'assignedUser']);
        return Inertia::render('CRM/Deals/Show', [
            'deal' => $deal,
            'stages' => DealStage::where('pipeline_id', $deal->pipeline_id)->orderBy('order')->get(),
        ]);
    }

    public function edit(Deal $deal)
    {
        return Inertia::render('CRM/Deals/Form', [
            'deal' => $deal,
            'contacts' => Contact::select('id', 'first_name', 'last_name', 'company')->get(),
            'pipelines' => Pipeline::with('stages')->get(),
            'users' => User::where('status', 'active')->select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, Deal $deal)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'contact_id' => 'nullable|exists:contacts,id',
            'value' => 'required|numeric|min:0',
            'pipeline_id' => 'required|exists:pipelines,id',
            'stage_id' => 'required|exists:deal_stages,id',
            'assigned_to' => 'nullable|exists:users,id',
            'expected_close' => 'nullable|date',
            'status' => 'required|in:open,won,lost',
            'probability' => 'nullable|integer|min:0|max:100',
            'description' => 'nullable|string',
        ]);

        $deal->update($validated);

        return redirect()->route('crm.deals.index')->with('success', 'Opportunity updated successfully.');
    }

    public function updateStage(Request $request, Deal $deal)
    {
        $request->validate([
            'stage_id' => 'required|exists:deal_stages,id',
        ]);

        $deal->update(['stage_id' => $request->stage_id]);

        return redirect()->back()->with('success', 'Opportunity stage updated.');
    }

    public function destroy(Deal $deal)
    {
        $deal->delete();
        return redirect()->route('crm.deals.index')->with('success', 'Opportunity deleted successfully.');
    }
}
