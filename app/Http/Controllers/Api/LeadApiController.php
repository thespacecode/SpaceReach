<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\ContactActivity;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LeadApiController extends Controller
{
    /**
     * Automated Public Lead Ingestion API Endpoint (POST /api/leads or /api/leads/ingest)
     * Handles incoming leads from Website forms, Landing pages, Google/Meta Webhooks, Zapier, APIs, etc.
     */
    public function ingest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'company' => 'nullable|string|max:255',
            'job_title' => 'nullable|string|max:255',
            'service_requested' => 'nullable|string|max:255',
            'source' => 'nullable|string|max:50',
            'budget' => 'nullable|numeric|min:0',
            'priority' => 'nullable|in:high,medium,low',
            'notes' => 'nullable|string',
            
            // Attribution payload
            'campaign' => 'nullable|string|max:255',
            'ad' => 'nullable|string|max:255',
            'keyword' => 'nullable|string|max:255',
            'landing_page' => 'nullable|string|max:255',
            'utm_source' => 'nullable|string|max:255',
            'utm_medium' => 'nullable|string|max:255',
            'utm_campaign' => 'nullable|string|max:255',
            'referrer' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();
        $email = strtolower(trim($validated['email'] ?? ''));
        $phone = preg_replace('/[^0-9+]/', '', $validated['phone'] ?? '');

        // 1. Duplicate Detection Check
        $existingLead = null;
        if (!empty($email)) {
            $existingLead = Contact::where('email', $email)->first();
        }
        if (!$existingLead && !empty($phone)) {
            $existingLead = Contact::where('phone', $phone)->first();
        }

        if ($existingLead) {
            // Record interaction on existing lead timeline rather than creating duplicate record
            ContactActivity::create([
                'contact_id' => $existingLead->id,
                'user_id' => null,
                'type' => 'note',
                'title' => 'Re-submitted Lead Form',
                'description' => "Lead form submitted again via " . ($validated['source'] ?? 'API/Form') . ". Notes: " . ($validated['notes'] ?? 'None'),
                'completed_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'action' => 'updated_existing',
                'lead_id' => $existingLead->id,
                'message' => 'Existing lead recognized and activity timeline updated.',
            ], 200);
        }

        // 2. Lead Scoring Calculation
        $score = 50;
        if (!empty($validated['company'])) $score += 15;
        if (!empty($validated['email'])) $score += 10;
        if (!empty($validated['phone'])) $score += 10;
        if (!empty($validated['budget']) && $validated['budget'] > 50000) $score += 15;

        // 3. Auto Assignment Logic
        $salesRep = User::where('status', 'active')->first();

        // 4. Attribution Payload
        $attribution = [
            'campaign' => $validated['campaign'] ?? $request->input('utm_campaign'),
            'ad' => $validated['ad'] ?? null,
            'keyword' => $validated['keyword'] ?? null,
            'landing_page' => $validated['landing_page'] ?? $request->header('referer'),
            'utm_source' => $validated['utm_source'] ?? null,
            'utm_medium' => $validated['utm_medium'] ?? null,
            'utm_campaign' => $validated['utm_campaign'] ?? null,
            'referrer' => $validated['referrer'] ?? null,
        ];

        $customFields = [
            'service_requested' => $validated['service_requested'] ?? 'General Inquiry',
            'estimated_value' => (float) ($validated['budget'] ?? 15000),
            'lead_score' => min(100, $score),
            'priority' => $validated['priority'] ?? ($score >= 75 ? 'high' : 'medium'),
            'stage' => 'new',
            'attribution' => $attribution,
            'next_action' => 'Contact new inbound prospect',
            'next_action_due' => now()->addHours(2)->toDateTimeString(),
        ];

        // 5. Create Lead Contact
        $lead = Contact::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'] ?? null,
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'company' => $validated['company'] ?? null,
            'job_title' => $validated['job_title'] ?? null,
            'source' => $validated['source'] ?? 'website',
            'status' => 'lead',
            'assigned_to' => $salesRep?->id,
            'custom_fields' => $customFields,
        ]);

        // Record Initial Timeline Event
        ContactActivity::create([
            'contact_id' => $lead->id,
            'user_id' => null,
            'type' => 'note',
            'title' => 'Inbound Lead Automated Ingestion',
            'description' => "Captured from source: " . ($validated['source'] ?? 'Website') . ". Service: " . ($validated['service_requested'] ?? 'N/A'),
            'completed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'action' => 'created_new',
            'lead_id' => $lead->id,
            'message' => 'Lead ingested and assigned successfully.',
        ], 201);
    }
}
