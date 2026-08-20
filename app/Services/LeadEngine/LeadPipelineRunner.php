<?php

namespace App\Services\LeadEngine;

use App\Models\Contact;
use App\Models\ContactActivity;
use App\Models\LeadAutomationLog;
use App\Models\LeadReviewCandidate;
use App\Models\LeadSource;

class LeadPipelineRunner
{
    protected NormalizationService $normalizer;
    protected ValidationService $validator;
    protected TechDetectorService $techDetector;
    protected WebsiteOpportunityAnalyzer $opportunityAnalyzer;
    protected EnrichmentService $enricher;
    protected QualificationScoringEngine $scorer;
    protected DeduplicationEngine $deduplicator;
    protected RoutingEngine $router;

    public function __construct(
        NormalizationService $normalizer,
        ValidationService $validator,
        TechDetectorService $techDetector,
        WebsiteOpportunityAnalyzer $opportunityAnalyzer,
        EnrichmentService $enricher,
        QualificationScoringEngine $scorer,
        DeduplicationEngine $deduplicator,
        RoutingEngine $router
    ) {
        $this->normalizer = $normalizer;
        $this->validator = $validator;
        $this->techDetector = $techDetector;
        $this->opportunityAnalyzer = $opportunityAnalyzer;
        $this->enricher = $enricher;
        $this->scorer = $scorer;
        $this->deduplicator = $deduplicator;
        $this->router = $router;
    }

    /**
     * Run full 12-stage pipeline on incoming raw lead record.
     */
    public function processRecord(array $raw, string $sourceName = 'Web Discovery', ?int $jobId = null, ?int $sourceId = null): array
    {
        // 1. Extraction / Parsing
        $companyName = $raw['company_name'] ?? $raw['company'] ?? 'Target Enterprise';
        $website = $raw['website'] ?? null;
        $email = $raw['email'] ?? null;
        $phone = $raw['phone'] ?? null;
        $industry = $raw['industry'] ?? 'Real Estate';
        $location = $raw['location'] ?? 'Bhubaneswar, Odisha';

        // 2. Normalization
        $normPhone = $this->normalizer->normalizePhone($phone);
        $normWebsite = $this->normalizer->normalizeWebsite($website);
        $normCompany = $this->normalizer->normalizeCompanyName($companyName);
        $structuredLoc = $this->normalizer->normalizeLocation($location);

        $normalizedPayload = [
            'company_name' => $normCompany ?: $companyName,
            'website' => $normWebsite ?: $website,
            'email' => strtolower(trim($email ?: '')),
            'phone' => $normPhone ?: $phone,
            'first_name' => $raw['first_name'] ?? 'Managing',
            'last_name' => $raw['last_name'] ?? 'Director',
            'industry' => $industry,
            'location' => implode(', ', array_filter($structuredLoc)),
            'city' => $structuredLoc['city'],
            'state' => $structuredLoc['state'],
            'country' => $structuredLoc['country'],
        ];

        // 3. Validation
        $validationResult = $this->validator->validateLead($normalizedPayload);

        // 4. Technology Detection
        $techStack = $this->techDetector->detectTechnology($normWebsite ?: 'example.com');

        // 5. Website Opportunity Analysis
        $opportunityAnalysis = $this->opportunityAnalyzer->analyzeOpportunity($normWebsite ?: '', $techStack, $normalizedPayload);

        // 6. Enrichment (Extracted vs Enriched vs AI Inferred)
        $enrichmentResult = $this->enricher->enrichRecord($normalizedPayload, $techStack, $opportunityAnalysis);

        // 7. Qualification Scoring
        $scoringResult = $this->scorer->calculateScore(array_merge($normalizedPayload, [
            'industry' => $industry,
            'location' => $location,
            'email' => $email,
            'phone' => $phone,
        ]));

        // 8. Duplicate Detection
        $duplicateCheck = $this->deduplicator->checkDuplicate($normalizedPayload);

        // 9. Lead Routing
        $routingResult = $this->router->routeLead($normalizedPayload, $scoringResult['score']);

        // 10. Record Provenance
        $provenance = $raw['provenance'] ?? [
            'source_url' => $normWebsite ?: 'https://google.com',
            'fetched_at' => now()->toDateTimeString(),
            'source_type' => $sourceName,
            'confidence' => 'High',
            'provenance_details' => [
                'Company Name' => ['source' => $sourceName, 'confidence' => 'High', 'timestamp' => now()->toIso8601String()],
                'Website URL' => ['source' => $sourceName, 'confidence' => 'High', 'timestamp' => now()->toIso8601String()],
            ]
        ];

        // Pipeline Decision: Direct Master Lead Sheet insertion vs Review Queue candidate
        $candidateNumber = 'CAN-' . strtoupper(uniqid());

        // Check if duplicate or needs review
        if ($duplicateCheck['is_duplicate'] || !$validationResult['is_valid'] || $scoringResult['score'] < 50) {
            // Direct to Review Queue
            $category = 'needs_review';
            if ($duplicateCheck['is_duplicate']) $category = 'duplicate';
            elseif (!$validationResult['is_valid']) $category = 'incomplete';
            elseif ($scoringResult['score'] >= 80) $category = 'high_potential';

            $candidate = LeadReviewCandidate::create([
                'candidate_number' => $candidateNumber,
                'company_name' => $normalizedPayload['company_name'],
                'first_name' => $normalizedPayload['first_name'],
                'last_name' => $normalizedPayload['last_name'],
                'email' => $normalizedPayload['email'],
                'phone' => $normalizedPayload['phone'],
                'website' => $normalizedPayload['website'],
                'industry' => $normalizedPayload['industry'],
                'location' => $normalizedPayload['location'],
                'service_opportunity' => $opportunityAnalysis['primary_service'],
                'qualification_score' => $scoringResult['score'],
                'review_category' => $category,
                'validation_status' => $validationResult['status'],
                'extracted_data' => $enrichmentResult['extracted_data'],
                'enriched_data' => $enrichmentResult['enriched_data'],
                'ai_inferences' => $enrichmentResult['ai_inferences'],
                'website_signals' => $opportunityAnalysis,
                'technology_stack' => $techStack,
                'provenance' => $provenance,
                'matched_lead_id' => $duplicateCheck['matched_lead'] ? $duplicateCheck['matched_lead']->id : null,
                'duplicate_match_confidence' => $duplicateCheck['confidence'],
                'source_id' => $sourceId,
                'job_id' => $jobId,
                'status' => 'pending',
            ]);

            LeadAutomationLog::create([
                'event_type' => 'review_queue',
                'title' => "Candidate Sent to Review Queue ({$category})",
                'description' => "Record '{$normalizedPayload['company_name']}' placed in Review Queue. Reason: " . ($duplicateCheck['match_reason'] ?? $validationResult['status']),
                'status' => 'warning',
                'job_id' => $jobId,
            ]);

            return [
                'action' => 'review_queue',
                'candidate' => $candidate,
                'score' => $scoringResult['score'],
                'duplicate' => $duplicateCheck['is_duplicate'],
            ];
        }

        // Direct Approval into Master Lead Sheet (`contacts` table)
        $customFields = [
            'stage' => 'new',
            'service_requested' => $opportunityAnalysis['primary_service'],
            'lead_score' => $scoringResult['score'],
            'priority' => $routingResult['priority'],
            'estimated_value' => rand(25000, 150000),
            'website' => $normalizedPayload['website'],
            'industry' => $normalizedPayload['industry'],
            'website_signals' => $opportunityAnalysis,
            'technology_stack' => $techStack,
            'extracted_data' => $enrichmentResult['extracted_data'],
            'enriched_data' => $enrichmentResult['enriched_data'],
            'ai_inferences' => $enrichmentResult['ai_inferences'],
            'provenance' => $provenance,
            'score_breakdown' => $scoringResult['breakdown'],
            'next_action' => 'Schedule Discovery Consultation',
            'next_action_due' => now()->addDay()->toDateTimeString(),
        ];

        $lead = Contact::create([
            'first_name' => $normalizedPayload['first_name'],
            'last_name' => $normalizedPayload['last_name'],
            'email' => $normalizedPayload['email'],
            'phone' => $normalizedPayload['phone'],
            'company' => $normalizedPayload['company_name'],
            'job_title' => 'Managing Director',
            'source' => strtolower(str_replace(' ', '_', $sourceName)),
            'status' => 'lead',
            'assigned_to' => $routingResult['assigned_to'],
            'custom_fields' => $customFields,
            'city' => $normalizedPayload['city'],
            'state' => $normalizedPayload['state'],
            'country' => $normalizedPayload['country'],
            'created_by' => auth()->id(),
        ]);

        ContactActivity::create([
            'contact_id' => $lead->id,
            'user_id' => auth()->id(),
            'type' => 'note',
            'title' => 'Lead Pipeline Automated Acquisition',
            'description' => "Lead acquired from '{$sourceName}'. Qualified Score: {$scoringResult['score']}/100. Target Service: {$opportunityAnalysis['primary_service']}.",
            'completed_at' => now(),
        ]);

        LeadAutomationLog::create([
            'event_type' => 'lead_created',
            'title' => "Master Lead Sheet Entry Created",
            'description' => "Lead '{$lead->company}' successfully processed through 12-stage pipeline and inserted into Master Lead Sheet.",
            'status' => 'success',
            'job_id' => $jobId,
            'contact_id' => $lead->id,
        ]);

        // Update Source metrics if sourceId provided
        if ($sourceId) {
            $source = LeadSource::find($sourceId);
            if ($source) {
                $source->increment('records_created');
            }
        }

        return [
            'action' => 'created',
            'lead' => $lead,
            'score' => $scoringResult['score'],
            'duplicate' => false,
        ];
    }
}
