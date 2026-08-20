<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\ContactActivity;
use App\Models\LeadAutomationLog;
use App\Models\LeadReviewCandidate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeadReviewController extends Controller
{
    /**
     * Display candidate review queue (Sales → Lead Review).
     */
    public function index(Request $request)
    {
        $category = $request->input('category', 'all');
        return redirect()->route('sales.leads.data', ['tab' => 'review', 'category' => $category]);
    }

    /**
     * Approve candidate into Master Lead Sheet (`contacts` table).
     */
    public function approve(LeadReviewCandidate $candidate)
    {
        $customFields = [
            'stage' => 'new',
            'service_requested' => $candidate->service_opportunity ?: 'Website Development',
            'lead_score' => $candidate->qualification_score,
            'priority' => $candidate->qualification_score >= 75 ? 'high' : 'medium',
            'estimated_value' => rand(30000, 100000),
            'website' => $candidate->website,
            'industry' => $candidate->industry,
            'extracted_data' => $candidate->extracted_data,
            'enriched_data' => $candidate->enriched_data,
            'ai_inferences' => $candidate->ai_inferences,
            'website_signals' => $candidate->website_signals,
            'technology_stack' => $candidate->technology_stack,
            'provenance' => $candidate->provenance,
            'next_action' => 'Initial phone outreach',
            'next_action_due' => now()->addDay()->toDateTimeString(),
        ];

        $lead = Contact::create([
            'first_name' => $candidate->first_name ?: 'Managing',
            'last_name' => $candidate->last_name ?: 'Director',
            'email' => $candidate->email,
            'phone' => $candidate->phone,
            'company' => $candidate->company_name,
            'job_title' => 'Decision Maker',
            'source' => 'web_discovery',
            'status' => 'lead',
            'assigned_to' => auth()->id(),
            'custom_fields' => $customFields,
            'city' => 'Bhubaneswar',
            'country' => 'India',
            'created_by' => auth()->id(),
        ]);

        $candidate->update(['status' => 'approved']);

        ContactActivity::create([
            'contact_id' => $lead->id,
            'user_id' => auth()->id(),
            'type' => 'note',
            'title' => 'Candidate Approved from Review Queue',
            'description' => "Approved candidate #{$candidate->candidate_number} into Master Lead Sheet database.",
            'completed_at' => now(),
        ]);

        LeadAutomationLog::create([
            'event_type' => 'approval',
            'title' => "Review Candidate Approved",
            'description' => "Candidate '{$candidate->company_name}' approved into Master Lead Sheet.",
            'status' => 'success',
            'contact_id' => $lead->id,
        ]);

        return redirect()->back()->with('success', "Candidate '{$candidate->company_name}' approved into Master Lead Sheet.");
    }

    /**
     * Reject candidate.
     */
    public function reject(LeadReviewCandidate $candidate)
    {
        $candidate->update(['status' => 'rejected']);

        LeadAutomationLog::create([
            'event_type' => 'rejection',
            'title' => "Candidate Rejected",
            'description' => "Candidate #{$candidate->candidate_number} ('{$candidate->company_name}') rejected.",
            'status' => 'info',
        ]);

        return redirect()->back()->with('success', "Candidate '{$candidate->company_name}' rejected.");
    }

    /**
     * Side-by-side Merge duplicate candidate into existing lead record.
     */
    public function merge(Request $request)
    {
        $validated = $request->validate([
            'candidate_id' => 'required|exists:lead_review_candidates,id',
            'lead_id' => 'required|exists:contacts,id',
            'company' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'website' => 'nullable|string|max:255',
        ]);

        $candidate = LeadReviewCandidate::findOrFail($validated['candidate_id']);
        $lead = Contact::findOrFail($validated['lead_id']);

        $custom = $lead->custom_fields ?? [];
        $custom['merged_history'][] = [
            'candidate_number' => $candidate->candidate_number,
            'merged_at' => now()->toDateTimeString(),
            'source_provenance' => $candidate->provenance,
        ];

        $lead->update([
            'company' => $validated['company'],
            'email' => $validated['email'] ?: $lead->email,
            'phone' => $validated['phone'] ?: $lead->phone,
            'custom_fields' => $custom,
        ]);

        $candidate->update(['status' => 'merged']);

        ContactActivity::create([
            'contact_id' => $lead->id,
            'user_id' => auth()->id(),
            'type' => 'note',
            'title' => 'Duplicate Merged Successfully',
            'description' => "Merged candidate #{$candidate->candidate_number} ('{$candidate->company_name}') into existing Lead #{$lead->id}.",
            'completed_at' => now(),
        ]);

        return redirect()->back()->with('success', "Candidate #{$candidate->candidate_number} merged successfully into Lead #{$lead->id}.");
    }
}
