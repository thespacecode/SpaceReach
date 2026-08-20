<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\ContactActivity;
use App\Models\ContactNote;
use App\Models\Deal;
use App\Models\DealStage;
use App\Models\Pipeline;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeadController extends Controller
{
    /**
     * Display the centralized Lead database workspace.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $view = $request->input('view', 'all'); // Saved Views
        $stageFilter = $request->input('stage', 'all');
        $sourceFilter = $request->input('source', 'all');
        $assignedFilter = $request->input('assigned_to', 'all');
        $priorityFilter = $request->input('priority', 'all');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = strtolower($request->input('sort_dir', 'desc')) === 'asc' ? 'asc' : 'desc';

        // Base Query: Contacts with status 'lead', 'active', 'customer', 'lost'
        $query = Contact::with(['assignedUser:id,name', 'creator:id,name', 'activities', 'notes'])
            ->whereIn('status', ['lead', 'active', 'customer', 'lost']);

        // 1. Saved Views Pre-Filtering
        switch ($view) {
            case 'my_leads':
                $query->where('assigned_to', auth()->id());
                break;
            case 'new':
                $query->where(function($q) {
                    $q->whereJsonContains('custom_fields->stage', 'new')
                      ->orWhere('status', 'lead');
                });
                break;
            case 'high_priority':
                $query->whereJsonContains('custom_fields->priority', 'high');
                break;
            case 'unassigned':
                $query->whereNull('assigned_to');
                break;
            case 'followup_today':
                $query->where(function($q) {
                    $q->whereNotNull('custom_fields->next_action_due')
                      ->whereDate('custom_fields->next_action_due', '<=', today());
                });
                break;
            case 'hot_leads':
                $query->where('custom_fields->lead_score', '>=', 75);
                break;
            case 'google_ads':
                $query->where('source', 'google_ads');
                break;
            case 'website':
                $query->where('source', 'website');
                break;
            default:
                break;
        }

        // 2. Global Multi-criteria Search
        if ($search) {
            $query->where(function ($q2) use ($search) {
                $q2->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('company', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('job_title', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }

        // 3. Filters
        if ($stageFilter !== 'all') {
            $query->where(function($q) use ($stageFilter) {
                $q->whereJsonContains('custom_fields->stage', $stageFilter)
                  ->orWhere('status', $stageFilter);
            });
        }
        if ($sourceFilter !== 'all') {
            $query->where('source', $sourceFilter);
        }
        if ($assignedFilter !== 'all') {
            if ($assignedFilter === 'unassigned') {
                $query->whereNull('assigned_to');
            } else {
                $query->where('assigned_to', $assignedFilter);
            }
        }
        if ($priorityFilter !== 'all') {
            $query->whereJsonContains('custom_fields->priority', $priorityFilter);
        }

        // Sorting
        $allowedSorts = ['first_name', 'company', 'email', 'created_at', 'status', 'source'];
        if (!in_array($sortBy, $allowedSorts)) {
            $sortBy = 'created_at';
        }
        $query->orderBy($sortBy, $sortDir);

        // Paginated result set
        $leads = $query->paginate(\App\Models\PortalSetting::paginationSize())->withQueryString();

        // All leads for real-time totals & source breakdown
        $allLeads = Contact::with(['assignedUser:id,name'])->get();

        // Calculate Overview KPI Metrics
        $stats = [
            'total_leads' => $allLeads->count(),
            'new_leads' => $allLeads->filter(fn($l) => ($l->custom_fields['stage'] ?? 'new') === 'new')->count(),
            'unassigned_leads' => $allLeads->whereNull('assigned_to')->count(),
            'followups_due' => $allLeads->filter(function($l) {
                $due = $l->custom_fields['next_action_due'] ?? null;
                return $due && strtotime($due) <= strtotime('today 23:59:59');
            })->count(),
            'qualified_leads' => $allLeads->filter(fn($l) => in_array($l->custom_fields['stage'] ?? '', ['qualified', 'proposal', 'negotiation']))->count(),
            'estimated_pipeline_value' => $allLeads->sum(fn($l) => (float) ($l->custom_fields['estimated_value'] ?? 0)),
            'conversion_rate' => $allLeads->count() > 0 
                ? round(($allLeads->where('status', 'customer')->count() / $allLeads->count()) * 100, 1)
                : 0,
        ];

        // Extensible Source Attribution Breakdown for Analytics
        $sourceBreakdown = [
            'website' => $allLeads->where('source', 'website')->count(),
            'google_ads' => $allLeads->where('source', 'google_ads')->count(),
            'meta_ads' => $allLeads->where('source', 'meta_ads')->count(),
            'linkedin' => $allLeads->where('source', 'linkedin')->count(),
            'instagram' => $allLeads->where('source', 'instagram')->count(),
            'whatsapp' => $allLeads->where('source', 'whatsapp')->count(),
            'email' => $allLeads->where('source', 'email')->count(),
            'referral' => $allLeads->where('source', 'referral')->count(),
            'api' => $allLeads->where('source', 'api')->count(),
            'import' => $allLeads->where('source', 'import')->count(),
            'manual' => $allLeads->where('source', 'manual')->count(),
        ];

        $stages = [
            ['id' => 'new', 'name' => 'New', 'color' => '#3b82f6'],
            ['id' => 'contacted', 'name' => 'Contacted', 'color' => '#8b5cf6'],
            ['id' => 'qualified', 'name' => 'Qualified', 'color' => '#10b981'],
            ['id' => 'discovery', 'name' => 'Discovery', 'color' => '#06b6d4'],
            ['id' => 'proposal', 'name' => 'Proposal', 'color' => '#f59e0b'],
            ['id' => 'negotiation', 'name' => 'Negotiation', 'color' => '#ec4899'],
            ['id' => 'converted', 'name' => 'Won / Converted', 'color' => '#10b981'],
            ['id' => 'lost', 'name' => 'Lost / Unqualified', 'color' => '#6b7280'],
        ];

        return Inertia::render('Sales/Leads/Index', [
            'leads' => $leads,
            'allLeads' => $allLeads,
            'stages' => $stages,
            'stats' => $stats,
            'sourceBreakdown' => $sourceBreakdown,
            'filters' => [
                'search' => $search,
                'view' => $view,
                'stage' => $stageFilter,
                'source' => $sourceFilter,
                'assigned_to' => $assignedFilter,
                'priority' => $priorityFilter,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
            'users' => User::where('status', 'active')->select('id', 'name')->get(),
            'pipelines' => Pipeline::with('stages')->get(),
        ]);
    }

    /**
     * Store a newly created lead with automated scoring and attribution.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'company' => 'nullable|string|max:255',
            'website' => 'nullable|string|max:255',
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'job_title' => 'nullable|string|max:255',
            'designation' => 'nullable|string|max:255',
            'service_requested' => 'nullable|string|max:255',
            'source' => 'nullable|string|max:50',
            'assigned_to' => 'nullable|exists:users,id',
            'estimated_value' => 'nullable|numeric|min:0',
            'lead_score' => 'nullable|integer|min:0|max:100',
            'priority' => 'nullable|in:high,medium,low',
            'stage' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            
            // Attribution
            'campaign' => 'nullable|string|max:255',
            'ad' => 'nullable|string|max:255',
            'keyword' => 'nullable|string|max:255',
            'landing_page' => 'nullable|string|max:255',
            'referrer' => 'nullable|string|max:255',
        ]);

        $score = $validated['lead_score'] ?? 65;

        $attribution = [
            'campaign' => $validated['campaign'] ?? null,
            'ad' => $validated['ad'] ?? null,
            'keyword' => $validated['keyword'] ?? null,
            'landing_page' => $validated['landing_page'] ?? null,
            'referrer' => $validated['referrer'] ?? null,
        ];

        $designation = $validated['designation'] ?? ($validated['job_title'] ?? null);
        $companyName = $validated['company'] ?? null;
        $firstName = $validated['first_name'] ?? ($companyName ? $companyName : 'Inbound Company');
        $website = $validated['website'] ?? null;

        $customFields = [
            'website' => $website,
            'designation' => $designation,
            'service_requested' => $validated['service_requested'] ?? 'Website Development',
            'estimated_value' => (float) ($validated['estimated_value'] ?? 25000),
            'lead_score' => (int) $score,
            'priority' => $validated['priority'] ?? ($score >= 75 ? 'high' : 'medium'),
            'stage' => $validated['stage'] ?? 'new',
            'notes' => $validated['notes'] ?? '',
            'attribution' => $attribution,
            'next_action' => 'Initial discovery call',
            'next_action_due' => now()->addDay()->toDateTimeString(),
        ];

        $lead = Contact::create([
            'first_name' => $firstName,
            'last_name' => $validated['last_name'] ?? null,
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'company' => $companyName ?: $firstName,
            'job_title' => $designation,
            'source' => $validated['source'] ?? 'website',
            'status' => 'lead',
            'assigned_to' => $validated['assigned_to'] ?? null,
            'custom_fields' => $customFields,
            'city' => $validated['city'] ?? null,
            'country' => $validated['country'] ?? null,
            'created_by' => auth()->id(),
        ]);

        if (!empty($validated['notes'])) {
            ContactNote::create([
                'contact_id' => $lead->id,
                'user_id' => auth()->id(),
                'content' => $validated['notes'],
            ]);
        }

        ContactActivity::create([
            'contact_id' => $lead->id,
            'user_id' => auth()->id(),
            'type' => 'note',
            'title' => 'Lead Created Manually',
            'description' => "Source: " . strtoupper($validated['source'] ?? 'website') . ". Service: " . ($validated['service_requested'] ?? 'N/A'),
            'completed_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Lead created successfully.');
    }

    /**
     * Update an existing lead record.
     */
    public function update(Request $request, Contact $lead)
    {
        $validated = $request->validate([
            'company' => 'nullable|string|max:255',
            'website' => 'nullable|string|max:255',
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'job_title' => 'nullable|string|max:255',
            'designation' => 'nullable|string|max:255',
            'service_requested' => 'nullable|string|max:255',
            'source' => 'nullable|string|max:50',
            'assigned_to' => 'nullable|exists:users,id',
            'estimated_value' => 'nullable|numeric|min:0',
            'lead_score' => 'nullable|integer|min:0|max:100',
            'priority' => 'nullable|in:high,medium,low',
            'stage' => 'nullable|string|max:50',
        ]);

        $designation = $validated['designation'] ?? ($validated['job_title'] ?? null);
        $existingCustom = $lead->custom_fields ?? [];
        $updatedCustom = array_merge($existingCustom, [
            'website' => $validated['website'] ?? ($existingCustom['website'] ?? null),
            'designation' => $designation ?? ($existingCustom['designation'] ?? null),
            'service_requested' => $validated['service_requested'] ?? ($existingCustom['service_requested'] ?? ''),
            'estimated_value' => isset($validated['estimated_value']) ? (float) $validated['estimated_value'] : ($existingCustom['estimated_value'] ?? 0),
            'lead_score' => isset($validated['lead_score']) ? (int) $validated['lead_score'] : ($existingCustom['lead_score'] ?? 50),
            'priority' => $validated['priority'] ?? ($existingCustom['priority'] ?? 'medium'),
            'stage' => $validated['stage'] ?? ($existingCustom['stage'] ?? 'new'),
        ]);

        $companyName = $validated['company'] ?? $lead->company;
        $firstName = $validated['first_name'] ?? ($companyName ?: $lead->first_name);

        $lead->update([
            'first_name' => $firstName,
            'last_name' => array_key_exists('last_name', $validated) ? $validated['last_name'] : $lead->last_name,
            'email' => array_key_exists('email', $validated) ? $validated['email'] : $lead->email,
            'phone' => array_key_exists('phone', $validated) ? $validated['phone'] : $lead->phone,
            'company' => $companyName,
            'job_title' => $designation ?: $lead->job_title,
            'source' => $validated['source'] ?? $lead->source,
            'assigned_to' => array_key_exists('assigned_to', $validated) ? $validated['assigned_to'] : $lead->assigned_to,
            'custom_fields' => $updatedCustom,
        ]);

        return redirect()->back()->with('success', 'Company details updated.');
    }

    /**
     * Update qualification stage.
     */
    public function updateStage(Request $request, Contact $lead)
    {
        $request->validate([
            'stage' => 'required|string|max:50',
        ]);

        $stage = $request->stage;
        $custom = $lead->custom_fields ?? [];
        $custom['stage'] = $stage;

        $newStatus = $lead->status;
        if ($stage === 'converted') {
            $newStatus = 'customer';
        } elseif ($stage === 'lost') {
            $newStatus = 'lost';
        } else {
            $newStatus = 'lead';
        }

        $lead->update([
            'custom_fields' => $custom,
            'status' => $newStatus,
        ]);

        ContactActivity::create([
            'contact_id' => $lead->id,
            'user_id' => auth()->id(),
            'type' => 'note',
            'title' => 'Stage Changed to ' . ucfirst($stage),
            'description' => 'Updated lead stage status.',
            'completed_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Lead stage updated.');
    }

    /**
     * Bulk Operations (Assign Owner, Change Status, Change Priority, Bulk Delete)
     */
    public function bulkAction(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|in:assign,status,priority,delete,merge',
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:contacts,id',
            'value' => 'nullable|string',
        ]);

        $ids = $validated['ids'];
        $action = $validated['action'];
        $val = $validated['value'];

        if ($action === 'assign') {
            Contact::whereIn('id', $ids)->update(['assigned_to' => $val ? (int) $val : null]);
        } elseif ($action === 'status') {
            foreach (Contact::whereIn('id', $ids)->get() as $lead) {
                $custom = $lead->custom_fields ?? [];
                $custom['stage'] = $val;
                $lead->update(['custom_fields' => $custom, 'status' => $val === 'converted' ? 'customer' : 'lead']);
            }
        } elseif ($action === 'priority') {
            foreach (Contact::whereIn('id', $ids)->get() as $lead) {
                $custom = $lead->custom_fields ?? [];
                $custom['priority'] = $val;
                $lead->update(['custom_fields' => $custom]);
            }
        } elseif ($action === 'delete') {
            Contact::whereIn('id', $ids)->delete();
        } elseif ($action === 'merge') {
            if (count($ids) < 2) {
                return redirect()->back()->with('error', 'Select at least 2 leads to merge.');
            }

            \DB::transaction(function() use ($ids) {
                $primaryId = $ids[0];
                $target = Contact::findOrFail($primaryId);
                $secondaryIds = array_slice($ids, 1);

                foreach ($secondaryIds as $secId) {
                    $merged = Contact::find($secId);
                    if (!$merged) continue;

                    ContactActivity::where('contact_id', $merged->id)->update(['contact_id' => $target->id]);
                    ContactNote::where('contact_id', $merged->id)->update(['contact_id' => $target->id]);
                    Deal::where('contact_id', $merged->id)->update(['contact_id' => $target->id]);

                    $custom = $target->custom_fields ?? [];
                    $mergedList = $custom['merged_leads'] ?? [];
                    $mergedList[] = [
                        'id' => $merged->id,
                        'company' => $merged->company,
                        'email' => $merged->email,
                        'phone' => $merged->phone,
                        'source' => $merged->source,
                        'merged_at' => now()->toDateTimeString(),
                    ];
                    $custom['merged_leads'] = $mergedList;
                    $target->update(['custom_fields' => $custom]);

                    ContactActivity::create([
                        'contact_id' => $target->id,
                        'user_id' => auth()->id() ?? 1,
                        'type' => 'note',
                        'title' => 'Duplicate Leads Merged',
                        'description' => "Merged Lead #{$merged->id} ('{$merged->company}') into Lead #{$target->id} ('{$target->company}').",
                        'completed_at' => now(),
                    ]);

                    $merged->delete();
                }
            });

            return redirect()->back()->with('success', 'Successfully merged ' . (count($ids) - 1) . ' leads into primary lead record.');
        }

        return redirect()->back()->with('success', 'Bulk action applied to ' . count($ids) . ' leads.');
    }

    /**
     * 1-Click Lead Conversion to CRM Deal & Customer Account.
     */
    public function convert(Request $request, Contact $lead)
    {
        $validated = $request->validate([
            'deal_title' => 'required|string|max:255',
            'pipeline_id' => 'required|exists:pipelines,id',
            'stage_id' => 'required|exists:deal_stages,id',
            'deal_value' => 'required|numeric|min:0',
            'expected_close' => 'nullable|date',
        ]);

        // 1. Update Lead Status
        $custom = $lead->custom_fields ?? [];
        $custom['stage'] = 'converted';
        $lead->update([
            'status' => 'customer',
            'custom_fields' => $custom,
        ]);

        // 2. Create Deal
        $deal = Deal::create([
            'title' => $validated['deal_title'],
            'contact_id' => $lead->id,
            'value' => $validated['deal_value'],
            'currency' => 'USD',
            'pipeline_id' => $validated['pipeline_id'],
            'stage_id' => $validated['stage_id'],
            'assigned_to' => $lead->assigned_to ?? auth()->id(),
            'expected_close' => $validated['expected_close'] ?? null,
            'status' => 'open',
            'probability' => 70,
            'description' => "Converted from Lead #{$lead->id} ({$lead->first_name} {$lead->last_name}) | Source: {$lead->source}",
            'created_by' => auth()->id(),
        ]);

        ContactActivity::create([
            'contact_id' => $lead->id,
            'user_id' => auth()->id(),
            'type' => 'note',
            'title' => 'Converted to Sales Opportunity',
            'description' => "Created Deal '{$deal->title}' valued at ₹{$deal->value}",
            'completed_at' => now(),
        ]);

        return redirect()->route('crm.deals.index')->with('success', "Lead converted successfully to Deal '{$deal->title}'.");
    }

    /**
     * Log Activity & Schedule Next Follow-up Action.
     */
    public function storeActivity(Request $request, Contact $lead)
    {
        $validated = $request->validate([
            'type' => 'required|in:call,email,meeting,note,task,other',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'next_action' => 'nullable|string|max:255',
            'next_action_due' => 'nullable|date',
        ]);

        ContactActivity::create([
            'contact_id' => $lead->id,
            'user_id' => auth()->id(),
            'type' => $validated['type'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'completed_at' => now(),
        ]);

        if (!empty($validated['next_action'])) {
            $custom = $lead->custom_fields ?? [];
            $custom['next_action'] = $validated['next_action'];
            $custom['next_action_due'] = $validated['next_action_due'] ?? now()->addDays(2)->toDateTimeString();
            $lead->update(['custom_fields' => $custom]);
        }

        return redirect()->back()->with('success', 'Interaction logged and next action updated.');
    }

    /**
     * CSV Lead Importer Endpoint.
     */
    public function import(Request $request)
    {
        $request->validate([
            'leads' => 'required|array|min:1',
            'leads.*.first_name' => 'required|string|max:255',
            'leads.*.last_name' => 'nullable|string|max:255',
            'leads.*.email' => 'nullable|email|max:255',
            'leads.*.phone' => 'nullable|string|max:50',
            'leads.*.company' => 'nullable|string|max:255',
            'leads.*.source' => 'nullable|string|max:50',
        ]);

        $imported = 0;
        $duplicates = 0;

        foreach ($request->leads as $item) {
            $email = strtolower(trim($item['email'] ?? ''));
            if (!empty($email) && Contact::where('email', $email)->exists()) {
                $duplicates++;
                continue;
            }

            Contact::create([
                'first_name' => $item['first_name'],
                'last_name' => $item['last_name'] ?? null,
                'email' => $item['email'] ?? null,
                'phone' => $item['phone'] ?? null,
                'company' => $item['company'] ?? null,
                'source' => $item['source'] ?? 'import',
                'status' => 'lead',
                'custom_fields' => [
                    'stage' => 'new',
                    'lead_score' => 60,
                    'priority' => 'medium',
                    'estimated_value' => 20000,
                ],
                'created_by' => auth()->id(),
            ]);
            $imported++;
        }

        return redirect()->back()->with('success', "Imported {$imported} leads successfully. ({$duplicates} duplicates skipped).");
    }

    /**
     * Delete Lead.
     */
    public function destroy(Contact $lead)
    {
        $lead->delete();
        return redirect()->back()->with('success', 'Lead archived.');
    }
}
